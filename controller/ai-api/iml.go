package ai_api

import (
	"context"
	"fmt"
	"github.com/APIParkLab/APIPark/model/plugin_model"
	ai_api "github.com/APIParkLab/APIPark/module/ai-api"
	ai_api_dto "github.com/APIParkLab/APIPark/module/ai-api/dto"
	"github.com/APIParkLab/APIPark/module/router"
	router_dto "github.com/APIParkLab/APIPark/module/router/dto"
	"github.com/APIParkLab/APIPark/module/service"
	"github.com/APIParkLab/APIPark/service/api"
	"github.com/eolinker/go-common/store"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"net/http"
	"strings"
)

var _ IAPIController = (*imlAPIController)(nil)

type imlAPIController struct {
	module        ai_api.IAPIModule      `autowired:""`
	routerModule  router.IRouterModule   `autowired:""`
	serviceModule service.IServiceModule `autowired:""`
	transaction   store.ITransaction     `autowired:""`
}

func (i *imlAPIController) Create(ctx *gin.Context, serviceId string, input *ai_api_dto.CreateAPI) (*ai_api_dto.API, error) {
	info, err := i.serviceModule.Get(ctx, serviceId)
	if err != nil {
		return nil, err
	}
	if input.Id == "" {
		input.Id = uuid.New().String()
	}
	err = i.transaction.Transaction(ctx, func(txCtx context.Context) error {
		err = i.module.Create(ctx, serviceId, input)
		if err != nil {
			return err
		}
		plugins := make(map[string]api.PluginSetting)
		if input.AiPrompt != nil {
			plugins["ai_prompt"] = api.PluginSetting{
				Config: plugin_model.ConfigType{
					"prompt":    input.AiPrompt.Prompt,
					"variables": input.AiPrompt.Variables,
				},
			}
		}
		if input.AiModel != nil {
			plugins["ai_formatter"] = api.PluginSetting{
				Config: plugin_model.ConfigType{
					"model":    input.AiModel.Id,
					"provider": fmt.Sprintf("%s@ai-provider", info.Provider.Id),
					"config":   input.AiModel.Config,
				},
			}
		}

		_, err = i.routerModule.Create(ctx, serviceId, &router_dto.Create{
			Id:   input.Id,
			Path: input.Path,
			Methods: []string{
				http.MethodPost,
			},
			Description: input.Description,
			Protocols:   []string{"http", "https"},
			MatchRules:  nil,
			Proxy: &router_dto.InputProxy{
				Path:    input.Path,
				Timeout: input.Timeout,
				Retry:   input.Retry,
				Plugins: plugins,
			},
			Disable: false,
		})

		return err
	})
	if err != nil {
		return nil, err
	}
	return i.module.Get(ctx, serviceId, input.Id)
}

func (i *imlAPIController) Edit(ctx *gin.Context, serviceId string, apiId string, input *ai_api_dto.EditAPI) (*ai_api_dto.API, error) {
	info, err := i.serviceModule.Get(ctx, serviceId)
	if err != nil {
		return nil, err
	}
	err = i.transaction.Transaction(ctx, func(txCtx context.Context) error {
		apiInfo, err := i.routerModule.Detail(ctx, serviceId, apiId)
		if err != nil {
			return err
		}
		proxy := &router_dto.InputProxy{
			Path:    apiInfo.Proxy.Path,
			Timeout: apiInfo.Proxy.Timeout,
			Retry:   apiInfo.Proxy.Retry,
			Plugins: apiInfo.Proxy.Plugins,
		}
		if input.AiModel != nil {
			proxy.Plugins["ai_formatter"] = api.PluginSetting{
				Config: plugin_model.ConfigType{
					"model":    input.AiModel.Id,
					"provider": fmt.Sprintf("%s@ai-provider", info.Provider.Id),
					"config":   input.AiModel.Config,
				},
			}
		}
		if input.AiPrompt != nil {
			proxy.Plugins["ai_prompt"] = api.PluginSetting{
				Config: plugin_model.ConfigType{
					"prompt":    input.AiPrompt.Prompt,
					"variables": input.AiPrompt.Variables,
				},
			}
		}
		path := apiInfo.Path
		if input.Path != nil {
			inputPath := *input.Path
			prefix, err := i.module.Prefix(ctx, serviceId)
			if err != nil {
				return err
			}
			if !strings.HasSuffix(inputPath, prefix) {
				if inputPath[0] != '/' {
					inputPath = fmt.Sprintf("/%s", inputPath)
				}
				path = fmt.Sprintf("%s%s", prefix, inputPath)
			} else {
				path = inputPath
			}
		}
		proxy.Path = path
		input.Path = &path
		_, err = i.routerModule.Edit(ctx, serviceId, apiId, &router_dto.Edit{
			Description: input.Description,
			Proxy:       proxy,
			Path:        input.Path,
			Disable:     input.Disable,
			Methods:     &apiInfo.Methods,
		})
		if err != nil {
			return err
		}

		return i.module.Edit(ctx, serviceId, apiId, input)
	})
	if err != nil {
		return nil, err
	}

	return i.module.Get(ctx, serviceId, apiId)
}

func (i *imlAPIController) Delete(ctx *gin.Context, serviceId string, apiId string) error {
	return i.transaction.Transaction(ctx, func(txCtx context.Context) error {
		err := i.routerModule.Delete(ctx, serviceId, apiId)
		if err != nil {
			return err
		}
		return i.module.Delete(ctx, serviceId, apiId)
	})

}

func (i *imlAPIController) List(ctx *gin.Context, keyword string, serviceId string) ([]*ai_api_dto.APIItem, error) {
	return i.module.List(ctx, keyword, serviceId)
}

func (i *imlAPIController) Get(ctx *gin.Context, serviceId string, apiId string) (*ai_api_dto.API, error) {
	return i.module.Get(ctx, serviceId, apiId)
}
