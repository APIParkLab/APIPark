package service

import (
	"context"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/eolinker/go-common/pm3"

	"github.com/APIParkLab/APIPark/module/system"

	"github.com/getkin/kin-openapi/openapi3"

	api_doc "github.com/APIParkLab/APIPark/module/api-doc"

	upstream_dto "github.com/APIParkLab/APIPark/module/upstream/dto"

	"github.com/eolinker/eosc/log"

	application_authorization "github.com/APIParkLab/APIPark/module/application-authorization"
	application_authorization_dto "github.com/APIParkLab/APIPark/module/application-authorization/dto"

	"github.com/APIParkLab/APIPark/model/plugin_model"
	"github.com/APIParkLab/APIPark/service/api"

	router_dto "github.com/APIParkLab/APIPark/module/router/dto"

	model_runtime "github.com/APIParkLab/APIPark/ai-provider/model-runtime"
	"github.com/APIParkLab/APIPark/module/ai"
	ai_api "github.com/APIParkLab/APIPark/module/ai-api"
	ai_api_dto "github.com/APIParkLab/APIPark/module/ai-api/dto"
	"github.com/APIParkLab/APIPark/module/router"
	"github.com/APIParkLab/APIPark/module/service"
	service_dto "github.com/APIParkLab/APIPark/module/service/dto"
	"github.com/APIParkLab/APIPark/module/upstream"
	"github.com/eolinker/go-common/store"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

var (
	_ IServiceController = (*imlServiceController)(nil)

	_ IAppController = (*imlAppController)(nil)
)

type imlServiceController struct {
	module         service.IServiceModule    `autowired:""`
	docModule      service.IServiceDocModule `autowired:""`
	aiAPIModule    ai_api.IAPIModule         `autowired:""`
	routerModule   router.IRouterModule      `autowired:""`
	apiDocModule   api_doc.IAPIDocModule     `autowired:""`
	providerModule ai.IProviderModule        `autowired:""`
	upstreamModule upstream.IUpstreamModule  `autowired:""`
	settingModule  system.ISettingModule     `autowired:""`
	transaction    store.ITransaction        `autowired:""`
}

var (
	loader = openapi3.NewLoader()
)

func (i *imlServiceController) swagger(ctx *gin.Context, id string) (*openapi3.T, error) {
	doc, err := i.apiDocModule.GetDoc(ctx, id)
	if err != nil {
		return nil, err
	}
	tmp, err := loader.LoadFromData([]byte(doc.Content))
	if err != nil {
		return nil, err
	}
	cfg := i.settingModule.Get(ctx)

	tmp.AddServer(&openapi3.Server{
		URL: cfg.InvokeAddress,
	})
	return tmp, nil
}

func (i *imlServiceController) ExportSwagger(ctx *gin.Context) {
	id, has := ctx.Params.Get("id")
	if !has {
		ctx.JSON(200, &pm3.Response{
			Code:    -1,
			Success: "fail",
			Message: fmt.Sprintf("id is required"),
		})
		return
	}
	s, err := i.module.Get(ctx, id)
	if err != nil {
		ctx.JSON(200, &pm3.Response{
			Code:    -1,
			Success: "fail",
			Message: err.Error(),
		})
		return
	}
	tmp, err := i.swagger(ctx, id)
	if err != nil {
		ctx.JSON(200, &pm3.Response{
			Code:    -1,
			Success: "fail",
			Message: err.Error(),
		})
		return
	}

	data, _ := tmp.MarshalJSON()
	ctx.Status(200)
	// 设置响应头
	ctx.Header("Content-Disposition", fmt.Sprintf("attachment; filename=%s.json", strings.Replace(s.Name, " ", "_", -1)))
	ctx.Header("Content-Type", "application/octet-stream")
	ctx.Header("Content-Transfer-Encoding", "binary")
	ctx.Writer.Write(data)
	return
}

func (i *imlServiceController) Swagger(ctx *gin.Context) {
	id, has := ctx.Params.Get("id")
	if !has {
		ctx.JSON(200, &pm3.Response{
			Code:    -1,
			Success: "fail",
			Message: fmt.Sprintf("id is required"),
		})
		return
	}
	tmp, err := i.swagger(ctx, id)
	if err != nil {
		ctx.JSON(200, &pm3.Response{
			Code:    -1,
			Success: "fail",
			Message: err.Error(),
		})
		return
	}
	ctx.JSON(200, tmp)
	return
}

func (i *imlServiceController) Simple(ctx *gin.Context) ([]*service_dto.SimpleServiceItem, error) {
	return i.module.Simple(ctx)
}

func (i *imlServiceController) MySimple(ctx *gin.Context) ([]*service_dto.SimpleServiceItem, error) {
	return i.module.MySimple(ctx)
}

func (i *imlServiceController) editAIService(ctx *gin.Context, id string, input *service_dto.EditService) (*service_dto.Service, error) {

	if input.Provider == nil {
		return nil, fmt.Errorf("provider is required")
	}
	p, has := model_runtime.GetProvider(*input.Provider)
	if !has {
		return nil, fmt.Errorf("provider not found")
	}
	info, err := i.module.Get(ctx, id)
	if err != nil {

	}
	err = i.transaction.Transaction(ctx, func(txCtx context.Context) error {
		info, err = i.module.Edit(ctx, id, input)
		if err != nil {
			return err
		}
		_, err = i.upstreamModule.Save(ctx, id, newAIUpstream(id, *input.Provider, p.URI()))
		return err
	})
	if err != nil {
		return nil, err
	}

	return info, nil
}

func (i *imlServiceController) createAIService(ctx *gin.Context, teamID string, input *service_dto.CreateService) (*service_dto.Service, error) {
	if input.Provider == nil {
		return nil, fmt.Errorf("provider is required")
	}

	if input.Id == "" {
		input.Id = uuid.New().String()
	}
	if input.Prefix == "" {
		if len(input.Id) < 9 {
			input.Prefix = input.Id
		} else {
			input.Prefix = input.Id[:8]
		}
	}
	pv, err := i.providerModule.Provider(ctx, *input.Provider)
	if err != nil {
		return nil, err
	}
	p, has := model_runtime.GetProvider(*input.Provider)
	if !has {
		return nil, fmt.Errorf("provider not found")
	}
	m, has := p.GetModel(pv.DefaultLLM)
	if !has {
		return nil, fmt.Errorf("model %s not found", pv.DefaultLLM)
	}

	var info *service_dto.Service
	err = i.transaction.Transaction(ctx, func(txCtx context.Context) error {
		var err error
		info, err = i.module.Create(ctx, teamID, input)
		if err != nil {
			return err
		}
		path := fmt.Sprintf("/%s/demo_translation_api", strings.Trim(input.Prefix, "/"))
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
			Id:       m.ID(),
			Config:   m.DefaultConfig(),
			Provider: *input.Provider,
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
				"provider": fmt.Sprintf("%s@ai-provider", info.Provider.Id),
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
			Disable:  false,
			Upstream: info.Provider.Id,
		})
		if err != nil {
			return err
		}

		return i.docModule.SaveServiceDoc(ctx, info.Id, &service_dto.SaveServiceDoc{
			Doc: "The Translation API allows developers to translate text from one language to another. It supports multiple languages and enables easy integration of high-quality translation features into applications. With simple API requests, you can quickly translate content into different target languages.",
		})
	})

	return info, err
}

func (i *imlServiceController) SearchMyServices(ctx *gin.Context, teamId string, keyword string) ([]*service_dto.ServiceItem, error) {
	return i.module.SearchMyServices(ctx, teamId, keyword)
}

func (i *imlServiceController) Get(ctx *gin.Context, id string) (*service_dto.Service, error) {
	now := time.Now()
	defer func() {
		log.Infof("get service %s cost %d ms", id, time.Since(now).Milliseconds())
	}()
	return i.module.Get(ctx, id)
}

func (i *imlServiceController) Search(ctx *gin.Context, teamID string, keyword string) ([]*service_dto.ServiceItem, error) {
	return i.module.Search(ctx, teamID, keyword)
}

func (i *imlServiceController) Create(ctx *gin.Context, teamID string, input *service_dto.CreateService) (*service_dto.Service, error) {
	if input.Kind == "ai" {
		return i.createAIService(ctx, teamID, input)
	}
	var err error
	var info *service_dto.Service
	err = i.transaction.Transaction(ctx, func(txCtx context.Context) error {
		info, err = i.module.Create(txCtx, teamID, input)
		if err != nil {
			return err
		}
		path := fmt.Sprintf("/%s/", strings.Trim(input.Prefix, "/"))
		_, err = i.routerModule.Create(txCtx, info.Id, &router_dto.Create{
			Id:          uuid.New().String(),
			Name:        "",
			Path:        path + "*",
			Methods:     []string{http.MethodGet, http.MethodPost, http.MethodPut, http.MethodDelete, http.MethodPatch, http.MethodOptions},
			Description: "auto create by create service",
			Protocols:   []string{"http", "https"},
			MatchRules:  nil,
			Upstream:    "",
			Proxy: &router_dto.InputProxy{
				Path:    path,
				Timeout: 30000,
				Retry:   0,
			},
			Disable: false,
		})
		return err
	})
	return info, err
}

func (i *imlServiceController) Edit(ctx *gin.Context, id string, input *service_dto.EditService) (*service_dto.Service, error) {
	info, err := i.Get(ctx, id)
	if err != nil {
		return nil, err
	}
	if info.ServiceKind == "ai" {
		return i.editAIService(ctx, id, input)
	}
	return i.module.Edit(ctx, id, input)
}

func (i *imlServiceController) Delete(ctx *gin.Context, id string) error {
	return i.module.Delete(ctx, id)
}

func (i *imlServiceController) ServiceDoc(ctx *gin.Context, id string) (*service_dto.ServiceDoc, error) {
	return i.docModule.ServiceDoc(ctx, id)
}

func (i *imlServiceController) SaveServiceDoc(ctx *gin.Context, id string, input *service_dto.SaveServiceDoc) error {
	return i.docModule.SaveServiceDoc(ctx, id, input)
}

type imlAppController struct {
	module     service.IAppModule                             `autowired:""`
	authModule application_authorization.IAuthorizationModule `autowired:""`
}

func (i *imlAppController) SearchCanSubscribe(ctx *gin.Context, serviceId string) ([]*service_dto.SimpleAppItem, error) {
	return i.module.SearchCanSubscribe(ctx, serviceId)
}

func (i *imlAppController) Search(ctx *gin.Context, teamId string, keyword string) ([]*service_dto.AppItem, error) {
	return i.module.Search(ctx, teamId, keyword)
}

func (i *imlAppController) CreateApp(ctx *gin.Context, teamID string, input *service_dto.CreateApp) (*service_dto.App, error) {
	app, err := i.module.CreateApp(ctx, teamID, input)
	if err != nil {
		return nil, err
	}
	_, err = i.authModule.AddAuthorization(ctx, app.Id, &application_authorization_dto.CreateAuthorization{
		Name:       "Default API Key",
		Driver:     "apikey",
		Position:   "Header",
		TokenName:  "Authorization",
		ExpireTime: 0,
		Config: map[string]interface{}{
			"apikey": uuid.New().String(),
		},
	})
	if err != nil {
		i.module.DeleteApp(ctx, app.Id)
		return nil, err
	}
	return app, nil
}
func (i *imlAppController) UpdateApp(ctx *gin.Context, appId string, input *service_dto.UpdateApp) (*service_dto.App, error) {
	return i.module.UpdateApp(ctx, appId, input)
}

func (i *imlAppController) SearchMyApps(ctx *gin.Context, teamId string, keyword string) ([]*service_dto.AppItem, error) {
	return i.module.SearchMyApps(ctx, teamId, keyword)
}

func (i *imlAppController) SimpleApps(ctx *gin.Context, keyword string) ([]*service_dto.SimpleAppItem, error) {
	return i.module.SimpleApps(ctx, keyword)
}

func (i *imlAppController) MySimpleApps(ctx *gin.Context, keyword string) ([]*service_dto.SimpleAppItem, error) {
	return i.module.MySimpleApps(ctx, keyword)
}

func (i *imlAppController) GetApp(ctx *gin.Context, appId string) (*service_dto.App, error) {
	return i.module.GetApp(ctx, appId)
}

func (i *imlAppController) DeleteApp(ctx *gin.Context, appId string) error {
	return i.module.DeleteApp(ctx, appId)
}

func newAIUpstream(id string, provider string, uri model_runtime.IProviderURI) *upstream_dto.Upstream {
	return &upstream_dto.Upstream{
		Type:            "http",
		Balance:         "round-robin",
		Timeout:         300000,
		Retry:           0,
		Remark:          fmt.Sprintf("auto create by ai service %s,provider is %s", id, provider),
		LimitPeerSecond: 0,
		ProxyHeaders:    nil,
		Scheme:          uri.Scheme(),
		PassHost:        "node",
		Nodes: []*upstream_dto.NodeConfig{
			{
				Address: uri.Host(),
				Weight:  100,
			},
		},
	}
}
