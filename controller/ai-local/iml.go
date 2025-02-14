package ai_local

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"math"
	"net/http"
	"strings"

	"gorm.io/gorm"

	"github.com/APIParkLab/APIPark/module/router"

	"github.com/APIParkLab/APIPark/model/plugin_model"
	"github.com/APIParkLab/APIPark/service/api"

	ai_api "github.com/APIParkLab/APIPark/module/ai-api"

	"github.com/APIParkLab/APIPark/module/catalogue"

	"github.com/APIParkLab/APIPark/module/service"

	"github.com/eolinker/go-common/store"

	service_dto "github.com/APIParkLab/APIPark/module/service/dto"

	ai_api_dto "github.com/APIParkLab/APIPark/module/ai-api/dto"
	router_dto "github.com/APIParkLab/APIPark/module/router/dto"

	ai_provider_local "github.com/APIParkLab/APIPark/ai-provider/local"

	"github.com/eolinker/eosc/log"

	ai_local "github.com/APIParkLab/APIPark/module/ai-local"
	ai_local_dto "github.com/APIParkLab/APIPark/module/ai-local/dto"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

var (
	ollamaConfig = "{\n  \"mirostat\": 0,\n  \"mirostat_eta\": 0.1,\n  \"mirostat_tau\": 5.0,\n  \"num_ctx\": 4096,\n  \"repeat_last_n\":64,\n  \"repeat_penalty\": 1.1,\n  \"temperature\": 0.7,\n  \"seed\": 42,\n  \"num_predict\": 42,\n  \"top_k\": 40,\n  \"top_p\": 0.9,\n  \"min_p\": 0.5\n}\n"
)

var _ ILocalModelController = &imlLocalModelController{}

type imlLocalModelController struct {
	module          ai_local.ILocalModelModule `autowired:""`
	serviceModule   service.IServiceModule     `autowired:""`
	catalogueModule catalogue.ICatalogueModule `autowired:""`
	aiAPIModule     ai_api.IAPIModule          `autowired:""`
	routerModule    router.IRouterModule       `autowired:""`
	docModule       service.IServiceDocModule  `autowired:""`
	transaction     store.ITransaction         `autowired:""`
}

func (i *imlLocalModelController) SimpleList(ctx *gin.Context) ([]*ai_local_dto.SimpleItem, error) {
	return i.module.SimpleList(ctx)
}

func (i *imlLocalModelController) State(ctx *gin.Context, model string) (*ai_local_dto.DeployState, *ai_local_dto.ModelInfo, error) {
	return i.module.ModelState(ctx, model)
}

// 自动选择合适的单位
func humanReadableSize(size int64) string {
	const (
		KB = 1000
		MB = 1000 * KB
		GB = 1000 * MB
	)

	switch {
	case size >= GB:
		return fmt.Sprintf("%.1f GB", math.Round(float64(size)/float64(GB)*10)/10)
	case size >= MB:
		return fmt.Sprintf("%.1f MB", math.Round(float64(size)/float64(MB)*10)/10)
	case size >= KB:
		return fmt.Sprintf("%.1f KB", math.Round(float64(size)/float64(KB)*10)/10)
	default:
		return fmt.Sprintf("%d B", size)
	}
}
func (i *imlLocalModelController) Deploy(ctx *gin.Context) {

	var input ai_local_dto.DeployInput
	err := ctx.ShouldBindBodyWithJSON(&input)
	if err != nil {
		ctx.JSON(200, gin.H{
			"code": -1, "msg": err.Error(), "success": "fail",
		})
		return
	}
	if input.Model == "" {
		ctx.JSON(200, gin.H{
			"code": -1, "msg": "model is required", "success": "fail",
		})
		return

	}
	err = i.initAILocalService(ctx, input.Model, input.Team)
	if err != nil {
		ctx.JSON(200, gin.H{
			"code": -1, "msg": err.Error(), "success": "fail",
		})
		return
	}
	id := uuid.NewString()
	p, err := i.module.Deploy(ctx, input.Model, id)
	if err != nil {
		ctx.JSON(200, gin.H{
			"code": -1, "msg": err.Error(), "success": "fail",
		})
		return
	}
	done := make(chan struct{})
	// 启动一个 goroutine 监听客户端关闭连接
	go func() {
		select {
		case <-ctx.Writer.CloseNotify():
			log.Info("client closed connection,close pipeline")
			ai_provider_local.CancelPipeline(input.Model, id)
		case <-done:
		}
	}()
	var complete int64
	var total int64
	ctx.Stream(func(w io.Writer) bool {
		msg, ok := <-p.Message()
		if !ok {
			return false
		}
		state := "download"
		switch msg.Status {
		case "verifying sha256 digest":
			state = "deploy"
		case "writing manifest":
			state = "initializing"
		case "removing any unused layers":
			state = "initializing"
		case "success":
			state = "finish"
		case "error":
			state = "error"
		}
		if msg.Completed > complete {
			complete = msg.Completed
		}
		if msg.Total > total {
			total = msg.Total
		}
		result := map[string]interface{}{
			"code": 0,
			"msg":  "",
			"data": map[string]interface{}{
				"message": msg.Msg,
				"info": map[string]interface{}{
					"current": humanReadableSize(complete),
					"total":   humanReadableSize(total),
				},
				"state": state,
			},
		}
		data, _ := json.Marshal(result)

		_, err = w.Write(data)
		if err != nil {
			log.Error("write message error: %v", err)
			return false
		}
		_, err = w.Write([]byte("\n"))
		if err != nil {
			log.Error("write message error: %v", err)
			return false
		}

		return true
	})
	close(done)
}

func (i *imlLocalModelController) DeployStart(ctx *gin.Context, input *ai_local_dto.DeployInput) error {
	err := i.initAILocalService(ctx, input.Model, input.Team)
	if err != nil {
		return err
	}
	id := uuid.NewString()
	_, err = i.module.Deploy(ctx, input.Model, id)
	if err != nil {
		return err
	}
	ai_provider_local.CancelPipeline(input.Model, id)
	return nil
}

func (i *imlLocalModelController) initAILocalService(ctx context.Context, model string, teamID string) error {
	err := i.transaction.Transaction(ctx, func(ctx context.Context) error {
		_, err := i.serviceModule.Get(ctx, model)
		if err == nil {
			return nil
		} else {
			if !errors.Is(err, gorm.ErrRecordNotFound) {
				return err
			}
		}
		catalogueInfo, err := i.catalogueModule.DefaultCatalogue(ctx)
		if err != nil {
			return err
		}

		providerId := "ollama"
		prefix := "/" + model
		info, err := i.serviceModule.Create(ctx, teamID, &service_dto.CreateService{
			Id:           model,
			Name:         model,
			Prefix:       prefix,
			Description:  "Auto generated service for AI model " + model,
			ServiceType:  "public",
			Catalogue:    catalogueInfo.Id,
			ApprovalType: "auto",
			Kind:         "ai",
			Provider:     &providerId,
		})
		if err != nil {
			return err
		}
		path := fmt.Sprintf("/%s/demo_translation_api", strings.Trim(prefix, "/"))
		timeout := 300000
		retry := 0
		aiPrompt := &ai_api_dto.AiPrompt{
			Variables: []*ai_api_dto.AiPromptVariable{
				{
					Key:         "source_lang",
					Description: "",
					Require:     true,
				},
				{
					Key:         "target_lang",
					Description: "",
					Require:     true,
				},
				{
					Key:         "text",
					Description: "",
					Require:     true,
				},
			},
			Prompt: "You need to translate {{source_lang}} into {{target_lang}}, and the following is the content that needs to be translated.\n---\n{{text}}",
		}
		aiModel := &ai_api_dto.AiModel{
			Id:       model,
			Config:   ollamaConfig,
			Provider: providerId,
			Type:     "local",
		}
		name := "Demo Translation API"
		description := "A demo that shows you how to use a prompt to create a Translation API."
		apiId := uuid.New().String()
		err = i.aiAPIModule.Create(
			ctx,
			info.Id,
			&ai_api_dto.CreateAPI{
				Id:          apiId,
				Name:        name,
				Path:        path,
				Description: description,
				Disable:     false,
				AiPrompt:    aiPrompt,
				AiModel:     aiModel,
				Timeout:     timeout,
				Retry:       retry,
			},
		)
		if err != nil {
			return err
		}
		plugins := make(map[string]api.PluginSetting)
		plugins["ai_prompt"] = api.PluginSetting{
			Config: plugin_model.ConfigType{
				"prompt":    aiPrompt.Prompt,
				"variables": aiPrompt.Variables,
			},
		}
		plugins["ai_formatter"] = api.PluginSetting{
			Config: plugin_model.ConfigType{
				"model":    aiModel.Id,
				"provider": info.Provider.Id,
				"config":   aiModel.Config,
			},
		}
		_, err = i.routerModule.Create(ctx, info.Id, &router_dto.Create{
			Id:   apiId,
			Name: name,
			Path: path,
			Methods: []string{
				http.MethodPost,
			},
			Description: description,
			Protocols:   []string{"http", "https"},
			MatchRules:  nil,
			Proxy: &router_dto.InputProxy{
				Path:    path,
				Timeout: timeout,
				Retry:   retry,
				Plugins: plugins,
			},
			Disable: false,
		})
		if err != nil {
			return err
		}

		return i.docModule.SaveServiceDoc(ctx, info.Id, &service_dto.SaveServiceDoc{
			Doc: "The Translation API allows developers to translate text from one language to another. It supports multiple languages and enables easy integration of high-quality translation features into applications. With simple API requests, you can quickly translate content into different target languages.",
		})
	})

	return err
}

func (i *imlLocalModelController) Search(ctx *gin.Context, keyword string) ([]*ai_local_dto.LocalModelItem, error) {
	return i.module.Search(ctx, keyword)
}

func (i *imlLocalModelController) ListCanInstall(ctx *gin.Context, keyword string) ([]*ai_local_dto.LocalModelPackageItem, error) {
	return i.module.ListCanInstall(ctx, keyword)
}

func (i *imlLocalModelController) CancelDeploy(ctx *gin.Context, input *ai_local_dto.CancelDeploy) error {
	return i.module.CancelDeploy(ctx, input.Model)
}

func (i *imlLocalModelController) RemoveModel(ctx *gin.Context, model string) error {
	return i.module.RemoveModel(ctx, model)
}

func (i *imlLocalModelController) Update(ctx *gin.Context, model string, input *ai_local_dto.Update) error {
	switch input.Disable {
	case true:
		return i.module.Disable(ctx, model)
	default:
		return i.module.Enable(ctx, model)
	}
}
