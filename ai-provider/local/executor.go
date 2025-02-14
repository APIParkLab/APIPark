package ai_provider_local

import (
	"context"
	"fmt"
	"sync"

	"github.com/ollama/ollama/progress"

	"github.com/eolinker/eosc"
	"github.com/ollama/ollama/api"
)

var (
	taskExecutor = NewAsyncExecutor(100)
)

// Pipeline 结构体，表示每个用户的管道
type Pipeline struct {
	id      string
	channel chan PullMessage
	ctx     context.Context
	cancel  context.CancelFunc
}

func (p *Pipeline) Message() <-chan PullMessage {
	return p.channel
}

// AsyncExecutor 结构体，管理不同模型的管道和任务队列
type AsyncExecutor struct {
	ctx       context.Context
	cancel    context.CancelFunc
	mu        sync.Mutex
	pipelines map[string]*modelPipeline // 以模型为 key，存管道列表
	msgQueue  chan messageTask          // 消息队列
}

type modelPipeline struct {
	ctx       context.Context
	cancel    context.CancelFunc
	pipelines eosc.Untyped[string, *Pipeline]
	pullFn    PullCallback
	maxSize   int
}

func (m *modelPipeline) List() []*Pipeline {
	return m.pipelines.List()
}

func (m *modelPipeline) Get(id string) (*Pipeline, bool) {
	return m.pipelines.Get(id)
}

func (m *modelPipeline) Set(id string, p *Pipeline) error {
	_, ok := m.pipelines.Get(id)
	if !ok {
		if m.pipelines.Count() > m.maxSize {
			return fmt.Errorf("pipeline size exceed %d", m.maxSize)
		}
	}
	m.pipelines.Set(id, p)
	return nil
}

func (m *modelPipeline) AddPipeline(id string) (*Pipeline, error) {
	ctx, cancel := context.WithCancel(m.ctx)
	pipeline := &Pipeline{
		ctx:     ctx,
		cancel:  cancel,
		id:      id,
		channel: make(chan PullMessage, 10), // 带缓冲，防止阻塞
	}
	err := m.Set(id, pipeline)
	if err != nil {
		return nil, err
	}
	return pipeline, nil
}

func (m *modelPipeline) Close() {
	m.cancel()
	ids := m.pipelines.Keys()
	for _, id := range ids {
		m.ClosePipeline(id)
	}
	return
}

func (m *modelPipeline) ClosePipeline(id string) {
	// 关闭管道
	p, has := m.pipelines.Del(id)
	if !has {
		return
	}
	p.cancel()
	close(p.channel)
}

func newModelPipeline(ctx context.Context, maxSize int) *modelPipeline {
	ctx, cancel := context.WithCancel(ctx)
	return &modelPipeline{
		pipelines: eosc.BuildUntyped[string, *Pipeline](),
		ctx:       ctx,
		cancel:    cancel,
		maxSize:   maxSize,
	}
}

// messageTask 结构体，包含模型名和消息内容
type messageTask struct {
	message PullMessage
}

type PullMessage struct {
	Model     string
	Status    string
	Digest    string
	Total     int64
	Completed int64
	Msg       string
}

// NewAsyncExecutor 创建一个新的异步任务执行器
func NewAsyncExecutor(queueSize int) *AsyncExecutor {
	ctx, cancel := context.WithCancel(context.Background())
	executor := &AsyncExecutor{
		ctx:       ctx,
		cancel:    cancel,
		pipelines: make(map[string]*modelPipeline), // 以模型为 key，存管道列表
		msgQueue:  make(chan messageTask, queueSize),
	}
	executor.StartMessageDistributor()

	return executor
}

func (e *AsyncExecutor) GetModelPipeline(model string) (*modelPipeline, bool) {
	e.mu.Lock()
	defer e.mu.Unlock()

	mp, ok := e.pipelines[model]
	return mp, ok
}

func (e *AsyncExecutor) SetModelPipeline(model string, mp *modelPipeline) {
	e.mu.Lock()
	defer e.mu.Unlock()
	e.pipelines[model] = mp
}

// ClosePipeline 关闭管道并移除
func (e *AsyncExecutor) ClosePipeline(model string, id string) {
	e.mu.Lock()
	defer e.mu.Unlock()
	mp, ok := e.pipelines[model]
	if !ok {
		return
	}
	mp.ClosePipeline(id)
}

// CloseModelPipeline 关闭当前模型所有管道
func (e *AsyncExecutor) CloseModelPipeline(model string) {
	e.mu.Lock()
	defer e.mu.Unlock()
	mp, ok := e.pipelines[model]
	if !ok {
		return
	}
	mp.Close()
	delete(e.pipelines, model)
}

// StartMessageDistributor 启动消息分发器
func (e *AsyncExecutor) StartMessageDistributor() {
	go func() {
		for task := range e.msgQueue {
			msg := task.message
			e.DistributeToModelPipelines(msg.Model, msg)
			if msg.Status == "error" || msg.Status == "success" {
				mp, has := e.GetModelPipeline(msg.Model)
				if has && mp.pullFn != nil {
					mp.pullFn(msg)
				}
				e.CloseModelPipeline(msg.Model)
				continue
			}
		}
	}()
}

// DistributeToModelPipelines 仅将消息分发给指定模型的管道
func (e *AsyncExecutor) DistributeToModelPipelines(model string, msg PullMessage) {
	e.mu.Lock()
	defer e.mu.Unlock()
	pipelines, ok := e.pipelines[model]
	if !ok {
		return
	}
	for _, pipeline := range pipelines.List() {
		select {
		case pipeline.channel <- msg:
		default:
			// 如果管道已满，跳过
		}
	}
}

type PullCallback func(msg PullMessage) error

func PullModel(model string, id string, fn PullCallback) (*Pipeline, error) {
	mp, has := taskExecutor.GetModelPipeline(model)
	if !has {
		mp = newModelPipeline(taskExecutor.ctx, 100)
		mp.pullFn = fn
		taskExecutor.SetModelPipeline(model, mp)
	}
	p, err := mp.AddPipeline(id)
	if err != nil {
		return nil, err
	}
	if !has {
		var status string
		bars := make(map[string]*progress.Bar)
		fn := func(resp api.ProgressResponse) error {
			if resp.Digest != "" {
				bar, ok := bars[resp.Digest]
				if !ok {
					bar = progress.NewBar(fmt.Sprintf("pulling %s...", resp.Digest[7:19]), resp.Total, resp.Completed)
					bars[resp.Digest] = bar
				}
				bar.Set(resp.Completed)

				taskExecutor.msgQueue <- messageTask{
					message: PullMessage{
						Model:     model,
						Digest:    resp.Digest,
						Total:     resp.Total,
						Completed: resp.Completed,
						Msg:       bar.String(),
						Status:    resp.Status,
					},
				}
			} else if status != resp.Status {
				taskExecutor.msgQueue <- messageTask{
					message: PullMessage{
						Model:     model,
						Digest:    resp.Digest,
						Total:     resp.Total,
						Completed: resp.Completed,
						Msg:       status,
						Status:    resp.Status,
					},
				}
			}

			return nil
		}
		go func() {
			err = client.Pull(mp.ctx, &api.PullRequest{Model: model}, fn)
			if err != nil {
				taskExecutor.msgQueue <- messageTask{
					message: PullMessage{
						Model:     model,
						Status:    "error",
						Digest:    "",
						Total:     0,
						Completed: 0,
						Msg:       err.Error(),
					},
				}
			}
		}()

	}

	return p, nil
}

func StopPull(model string) {
	taskExecutor.CloseModelPipeline(model)
}

func CancelPipeline(model string, id string) {
	taskExecutor.ClosePipeline(model, id)
}

func RemoveModel(model string) error {
	taskExecutor.CloseModelPipeline(model)
	err := client.Delete(context.Background(), &api.DeleteRequest{Model: model})
	if err != nil {
		if err.Error() == fmt.Sprintf("model '%s' not found", model) {
			return nil
		}
	}
	return err
}

func ModelsInstalled() ([]Model, error) {
	result, err := client.List(context.Background())
	if err != nil {
		return nil, err
	}
	models := make([]Model, 0, len(result.Models))
	for _, m := range result.Models {
		models = append(models, Model{
			Name:       m.Name,
			Model:      m.Model,
			ModifiedAt: m.ModifiedAt,
			Size:       m.Size,
			Digest:     m.Digest,
			Details: ModelDetails{
				ParentModel:       m.Details.ParentModel,
				Format:            m.Details.Format,
				Family:            m.Details.Family,
				Families:          m.Details.Families,
				ParameterSize:     m.Details.ParameterSize,
				QuantizationLevel: m.Details.QuantizationLevel,
			},
		})
	}
	return models, nil
}
