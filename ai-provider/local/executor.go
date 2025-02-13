package ai_provider_local

import (
	"context"
	"fmt"
	"sync"
	"time"

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
	channel chan string
	ctx     context.Context
	cancel  context.CancelFunc
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
	pipelines eosc.Untyped[string, *Pipeline]
	ctx       context.Context
	cancel    context.CancelFunc
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
	model   string
	message string
	status  string
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

// AddPipeline 为指定模型的用户创建一个管道
func (e *AsyncExecutor) AddPipeline(model, id string) (*Pipeline, bool) {
	e.mu.Lock()
	defer e.mu.Unlock()

	hasModel := true
	mp, ok := e.pipelines[model]
	if !ok {
		hasModel = false
		mp = newModelPipeline(e.ctx, 100)
		e.pipelines[model] = mp
	}
	ctx, cancel := context.WithCancel(mp.ctx)
	pipeline := &Pipeline{
		ctx:     ctx,
		cancel:  cancel,
		id:      id,
		channel: make(chan string, 10), // 带缓冲，防止阻塞
	}
	mp.Set(id, pipeline)
	return pipeline, hasModel
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
			if task.status == "error" || task.status == "success" {
				e.DistributeToModelPipelines(task.model, task.message)
				e.CloseModelPipeline(task.model)
				continue
			}
			e.DistributeToModelPipelines(task.model, task.message)
		}
	}()
}

// DistributeToModelPipelines 仅将消息分发给指定模型的管道
func (e *AsyncExecutor) DistributeToModelPipelines(model, message string) {
	e.mu.Lock()
	defer e.mu.Unlock()
	pipelines, ok := e.pipelines[model]
	if !ok {
		return
	}
	for _, pipeline := range pipelines.List() {
		select {
		case pipeline.channel <- message:
		default:
			// 如果管道已满，跳过
		}
	}
}

func PullModel(model string, id string) (*Pipeline, error) {
	p, has := taskExecutor.AddPipeline(model, id)
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
					model:   model,
					message: bar.String(),
					status:  resp.Status,
				}
			} else if status != resp.Status {
				taskExecutor.msgQueue <- messageTask{
					model:   model,
					message: resp.Status,
					status:  resp.Status,
				}
			}

			return nil
		}
		go func() {
			err := client.Pull(context.Background(), &api.PullRequest{Model: model}, fn)
			if err != nil {
				taskExecutor.msgQueue <- messageTask{
					model:   model,
					message: err.Error(),
					status:  "error",
				}
			}

		}()

	}
	return p, nil
}

func StopPull(model string) {
	taskExecutor.CloseModelPipeline(model)
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

type Model struct {
	Name       string       `json:"name"`
	Model      string       `json:"model"`
	ModifiedAt time.Time    `json:"modified_at"`
	Size       int64        `json:"size"`
	Digest     string       `json:"digest"`
	Details    ModelDetails `json:"details,omitempty"`
}

// ModelDetails provides details about a model.
type ModelDetails struct {
	ParentModel       string   `json:"parent_model"`
	Format            string   `json:"format"`
	Family            string   `json:"family"`
	Families          []string `json:"families"`
	ParameterSize     string   `json:"parameter_size"`
	QuantizationLevel string   `json:"quantization_level"`
}
