package main

import (
	"context"
	"encoding/json"
	"log"
	"strings"
	"time"

	"github.com/eolinker/go-common/cftool"

	ai_dto "github.com/APIParkLab/APIPark/module/ai/dto"

	"github.com/eolinker/go-common/store"

	"github.com/APIParkLab/APIPark/service/ai"

	ai_key "github.com/APIParkLab/APIPark/service/ai-key"

	nsq "github.com/nsqio/go-nsq"

	ai_api "github.com/APIParkLab/APIPark/service/ai-api"
)

func init() {
	cftool.Register[NSQConfig]("nsq")
}

type NSQConfig struct {
	Addr        string `json:"addr"`
	TopicPrefix string `json:"topic_prefix"`
}

// 定义 NSQ 消息结构
type AIProviderStatus struct {
	Provider string `json:"provider"`
	Model    string `json:"model"`
	Key      string `json:"key"`
	Status   string `json:"status"`
}

type AIInfo struct {
	Model         string             `json:"ai_model"`
	Cost          interface{}        `json:"ai_model_cost"`
	InputToken    interface{}        `json:"ai_model_input_token"`
	OutputToken   interface{}        `json:"ai_model_output_token"`
	TotalToken    interface{}        `json:"ai_model_total_token"`
	Provider      string             `json:"ai_provider"`
	ProviderStats []AIProviderStatus `json:"ai_provider_statuses"`
}

type NSQMessage struct {
	AI          AIInfo `json:"ai"`
	API         string `json:"api"`
	Provider    string `json:"provider"`
	RequestID   string `json:"request_id"`
	TimeISO8601 string `json:"time_iso8601"`
}

// NSQHandler 处理 NSQ 消息并写入 MySQL
type NSQHandler struct {
	apiUseService ai_api.IAPIUseService `autowired:""`
	aiKeyService  ai_key.IKeyService    `autowired:""`
	aiService     ai.IProviderService   `autowired:""`
	transaction   store.ITransaction    `autowired:""`
	nsqConfig     *NSQConfig            `autowired:""`
	ctx           context.Context
}

func convertInt(value interface{}) int {
	switch v := value.(type) {
	case int:
		return v
	case float64:
		return int(v)
	default:
		return 0
	}
}

// HandleMessage 处理从 NSQ 读取的消息
func (h *NSQHandler) HandleMessage(message *nsq.Message) error {
	log.Printf("Received message: %s", string(message.Body))

	// 解析消息为结构体
	var data NSQMessage
	err := json.Unmarshal(message.Body, &data)
	if err != nil {
		log.Printf("Failed to unmarshal message: %v", err)
		return err
	}

	// 将时间字符串转换为 time.Time
	timestamp, err := time.Parse(time.RFC3339, data.TimeISO8601)
	if err != nil {
		log.Printf("Failed to parse timestamp: %v", err)
		return err
	}

	day := time.Date(timestamp.Year(), timestamp.Month(), timestamp.Day(), 0, 0, 0, 0, timestamp.Location())
	hour := time.Date(timestamp.Year(), timestamp.Month(), timestamp.Day(), timestamp.Hour(), 0, 0, 0, timestamp.Location())
	minute := time.Date(timestamp.Year(), timestamp.Month(), timestamp.Day(), timestamp.Hour(), timestamp.Minute(), 0, 0, timestamp.Location())
	return h.transaction.Transaction(context.Background(), func(ctx context.Context) error {
		finalStatus := &AIProviderStatus{}
		for _, s := range data.AI.ProviderStats {
			status := ToKeyStatus(s.Status).Int()
			keys := strings.Split(s.Key, "@")
			key := keys[0]
			err = h.aiKeyService.Save(ctx, key, &ai_key.Edit{
				Status: &status,
			})
			if err != nil {
				log.Printf("Failed to save AI key: %v", err)
				return err
			}
			if s.Provider != data.AI.Provider {

				pStatus := ai_dto.ProviderAbnormal.Int()
				err = h.aiService.Save(ctx, s.Provider, &ai.SetProvider{
					Status: &pStatus,
				})
			} else {
				pStatus := ai_dto.ProviderEnabled.Int()
				err = h.aiService.Save(ctx, s.Provider, &ai.SetProvider{
					Status: &pStatus,
				})
			}
			finalStatus = &s
		}
		if finalStatus != nil {
			keys := strings.Split(finalStatus.Key, "@")
			err = h.aiKeyService.IncrUseToken(ctx, keys[0], convertInt(data.AI.TotalToken))
			if err != nil {
				log.Printf("Failed to increment AI key token: %v", err)
				return err
			}
		}

		// 调用 AI API 接口
		err = h.apiUseService.Incr(context.Background(), &ai_api.IncrAPIUse{
			API:         data.API,
			Service:     data.Provider,
			Provider:    data.AI.Provider,
			Model:       data.AI.Model,
			Day:         day.Unix(),
			Hour:        hour.Unix(),
			Minute:      minute.Unix(),
			InputToken:  convertInt(data.AI.InputToken),
			OutputToken: convertInt(data.AI.OutputToken),
			TotalToken:  convertInt(data.AI.TotalToken),
		})
		if err != nil {
			log.Printf("Failed to call AI API: %v", err)
			return err
		}

		log.Printf("Message processed and saved to MySQL: %+v", data)
		return nil
	})

}
