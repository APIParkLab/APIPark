package system

import (
	"archive/zip"
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/eolinker/eosc/log"

	ai_dto "github.com/APIParkLab/APIPark/module/ai/dto"

	"github.com/APIParkLab/APIPark/model/plugin_model"
	"github.com/APIParkLab/APIPark/service/api"

	ai_api "github.com/APIParkLab/APIPark/module/ai-api"

	model_runtime "github.com/APIParkLab/APIPark/ai-provider/model-runtime"
	ai_api_dto "github.com/APIParkLab/APIPark/module/ai-api/dto"
	router_dto "github.com/APIParkLab/APIPark/module/router/dto"

	"github.com/eolinker/go-common/store"

	"github.com/APIParkLab/APIPark/module/ai"

	catalogue_dto "github.com/APIParkLab/APIPark/module/catalogue/dto"

	application_authorization_dto "github.com/APIParkLab/APIPark/module/application-authorization/dto"
	service_dto "github.com/APIParkLab/APIPark/module/service/dto"
	team_dto "github.com/APIParkLab/APIPark/module/team/dto"
	"github.com/eolinker/go-common/register"
	"github.com/eolinker/go-common/server"
	"github.com/eolinker/go-common/utils"
	"github.com/google/uuid"

	system_dto "github.com/APIParkLab/APIPark/module/system/dto"

	application_authorization "github.com/APIParkLab/APIPark/module/application-authorization"
	"github.com/APIParkLab/APIPark/module/catalogue"
	"github.com/APIParkLab/APIPark/module/router"
	"github.com/APIParkLab/APIPark/module/service"
	"github.com/APIParkLab/APIPark/module/subscribe"
	"github.com/APIParkLab/APIPark/module/system"
	"github.com/APIParkLab/APIPark/module/team"
	"github.com/APIParkLab/APIPark/module/upstream"
	"github.com/gin-gonic/gin"
)

var _ IExportConfigController = (*imlExportConfigController)(nil)

type imlExportConfigController struct {
	teamModule                     team.ITeamExportModule                               `autowired:""`
	serviceModule                  service.IExportServiceModule                         `autowired:""`
	appModule                      service.IExportAppModule                             `autowired:""`
	routerModule                   router.IExportRouterModule                           `autowired:""`
	upstreamModule                 upstream.IExportUpstreamModule                       `autowired:""`
	applicationAuthorizationModule application_authorization.IExportAuthorizationModule `autowired:""`
	catalogueModule                catalogue.IExportCatalogueModule                     `autowired:""`
	subscribeModule                subscribe.IExportSubscribeModule                     `autowired:""`
	applyModule                    subscribe.IExportSubscribeApprovalModule             `autowired:""`
}

type ExportFile struct {
	Driver string      `json:"driver"`
	Data   interface{} `json:"data"`
}

func (e *ExportFile) Byte() []byte {
	b, _ := json.Marshal(e.Data)
	return b
}

func zipFile(files []*ExportFile) (*bytes.Buffer, error) {
	// 创建一个缓冲区用于存储 ZIP 文件内容
	buf := new(bytes.Buffer)
	zipWriter := zip.NewWriter(buf)
	now := time.Now()
	// 将文件写入 ZIP
	for _, file := range files {
		header := &zip.FileHeader{
			Name:     fmt.Sprintf("%s.json", file.Driver),
			Method:   zip.Deflate,
			Modified: now,
		}
		f, err := zipWriter.CreateHeader(header)
		if err != nil {
			return nil, fmt.Errorf("failed to create zip file: %v", err)
		}
		_, err = f.Write(file.Byte())
		if err != nil {
			return nil, fmt.Errorf("failed to write to zip file: %v", err)
		}
	}

	// 关闭 ZIP writer，完成压缩过程
	err := zipWriter.Close()
	if err != nil {
		return nil, fmt.Errorf("failed to close zip writer: %v", err)
	}
	return buf, nil
}

func (i *imlExportConfigController) ExportAll(ctx *gin.Context) error {
	files, err := i.appendFiles(ctx)
	if err != nil {
		return err
	}
	buf, err := zipFile(files)
	if err != nil {

	}

	ctx.DataFromReader(http.StatusOK, int64(buf.Len()), "application/zip", buf, map[string]string{
		"Content-Disposition": "attachment; filename=\"export.zip\"",
	})
	return nil
}

func (i *imlExportConfigController) appendFiles(ctx *gin.Context) ([]*ExportFile, error) {
	type exportConfig struct {
		exportFunc func(ctx *gin.Context) (interface{}, error)
		driver     string
	}

	exports := []exportConfig{
		{
			exportFunc: func(ctx *gin.Context) (interface{}, error) {
				return i.teamModule.ExportAll(ctx)
			},
			driver: "team",
		},
		{
			exportFunc: func(ctx *gin.Context) (interface{}, error) {
				return i.serviceModule.ExportAll(ctx)
			},
			driver: "service",
		},
		{
			exportFunc: func(ctx *gin.Context) (interface{}, error) {
				return i.appModule.ExportAll(ctx)
			},
			driver: "app",
		},
		{
			exportFunc: func(ctx *gin.Context) (interface{}, error) {
				return i.routerModule.ExportAll(ctx)
			},
			driver: "api",
		},
		{
			exportFunc: func(ctx *gin.Context) (interface{}, error) {
				return i.upstreamModule.ExportAll(ctx)
			},
			driver: "upstream",
		},
		{
			exportFunc: func(ctx *gin.Context) (interface{}, error) {
				return i.applicationAuthorizationModule.ExportAll(ctx)
			},
			driver: "authorization",
		},
		{
			exportFunc: func(ctx *gin.Context) (interface{}, error) {
				return i.catalogueModule.ExportAll(ctx)
			},
			driver: "catalogue",
		},
		{
			exportFunc: func(ctx *gin.Context) (interface{}, error) {
				return i.subscribeModule.ExportAll(ctx)
			},
			driver: "subscribe",
		},
		{
			exportFunc: func(ctx *gin.Context) (interface{}, error) {
				return i.applyModule.ExportAll(ctx)
			},
			driver: "apply",
		},
	}

	files := make([]*ExportFile, 0, len(exports))
	for _, config := range exports {
		data, err := config.exportFunc(ctx)
		if err != nil {
			return nil, fmt.Errorf("[%s] failed to export data: %v", config.driver, err)
		}

		files = append(files, &ExportFile{
			Driver: config.driver,
			Data:   data,
		})
	}

	return files, nil
}

var (
	_ ISettingController = (*imlSettingController)(nil)
)

type imlSettingController struct {
	settingModule system.ISettingModule `autowired:""`
}

func (i *imlSettingController) Get(ctx *gin.Context) (*system_dto.Setting, error) {
	return i.settingModule.Get(ctx), nil
}

func (i *imlSettingController) Set(ctx *gin.Context, input *system_dto.InputSetting) error {
	return i.settingModule.Set(ctx, input)
}

type imlInitController struct {
	teamModule                     team.ITeamModule                               `autowired:""`
	appModule                      service.IAppModule                             `autowired:""`
	serviceModule                  service.IServiceModule                         `autowired:""`
	applicationAuthorizationModule application_authorization.IAuthorizationModule `autowired:""`
	catalogueModule                catalogue.ICatalogueModule                     `autowired:""`
	providerModule                 ai.IProviderModule                             `autowired:""`
	transaction                    store.ITransaction                             `autowired:""`
	aiAPIModule                    ai_api.IAPIModule                              `autowired:""`
	docModule                      service.IServiceDocModule                      `autowired:""`
	routerModule                   router.IRouterModule                           `autowired:""`
}

func (i *imlInitController) OnInit() {
	register.Handle(func(v server.Server) {
		ctx := utils.SetUserId(context.Background(), "admin")

		err := i.transaction.Transaction(ctx, func(ctx context.Context) error {
			teams, err := i.teamModule.Search(ctx, "")
			if err != nil {
				return fmt.Errorf("get teams error: %v", err)
			}
			if len(teams) > 0 {
				return nil
			}
			items, err := i.catalogueModule.Search(ctx, "")
			if err != nil {
				return fmt.Errorf("get catalogue error: %v", err)
			}
			catalogueId := uuid.New().String()
			if len(items) == 0 {
				err = i.catalogueModule.Create(ctx, &catalogue_dto.CreateCatalogue{
					Id:   catalogueId,
					Name: "Default Catalogue",
				})
				if err != nil {
					return fmt.Errorf("create default catalogue error: %v", err)
				}
			} else {
				catalogueId = items[0].Id
			}

			info, err := i.teamModule.Create(ctx, &team_dto.CreateTeam{
				Name:        "Default Team",
				Description: "Auto created By APIPark",
			})
			if err != nil {
				return fmt.Errorf("create default team error: %v", err)
			}
			// 创建Rest服务
			restPath := "/rest-demo"
			serviceInfo, err := i.serviceModule.Create(ctx, info.Id, &service_dto.CreateService{
				Name:         "REST Demo Service",
				Prefix:       "/rest-demo",
				Description:  "Auto created By APIPark",
				ServiceType:  "public",
				Catalogue:    catalogueId,
				ApprovalType: "auto",
				Kind:         "rest",
			})
			if err != nil {
				return fmt.Errorf("create default service error: %v", err)
			}
			path := fmt.Sprintf("/%s/", strings.Trim(restPath, "/"))
			_, err = i.routerModule.Create(ctx, serviceInfo.Id, &router_dto.Create{
				Id:          uuid.NewString(),
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
			if err != nil {
				return fmt.Errorf("create default router error: %v", err)
			}
			// 创建AI服务
			err = i.createAIService(ctx, info.Id, &service_dto.CreateService{
				Name:         "AI Demo Service",
				Prefix:       "/ai-demo",
				Description:  "Auto created By APIPark",
				ServiceType:  "public",
				Catalogue:    catalogueId,
				ApprovalType: "auto",
				Kind:         "ai",
			})
			if err != nil {
				return err
			}
			app, err := i.appModule.CreateApp(ctx, info.Id, &service_dto.CreateApp{
				Name:        "Demo Application",
				Description: "Auto created By APIPark",
			})
			if err != nil {
				return fmt.Errorf("create default app error: %v", err)
			}
			_, err = i.applicationAuthorizationModule.AddAuthorization(ctx, app.Id, &application_authorization_dto.CreateAuthorization{
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
				return fmt.Errorf("create default api key error: %v", err)
			}
			return nil
		})
		if err != nil {
			log.Errorf("init iml error: %v", err)
		}
	})
}
func (i *imlInitController) createAIService(ctx context.Context, teamID string, input *service_dto.CreateService) error {

	providerId := "fakegpt"
	err := i.providerModule.UpdateProviderConfig(ctx, providerId, &ai_dto.UpdateConfig{
		Config: "{\n  \"apikey\": \"xxx\" \n}",
	})
	if err != nil {
		return fmt.Errorf("update %s config error: %v", providerId, err)
	}
	input.Provider = &providerId
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
		return err
	}
	p, has := model_runtime.GetProvider(*input.Provider)
	if !has {
		return fmt.Errorf("provider not found")
	}
	m, has := p.GetModel(pv.DefaultLLM)
	if !has {
		return fmt.Errorf("model %s not found", pv.DefaultLLM)
	}

	var info *service_dto.Service
	err = i.transaction.Transaction(ctx, func(txCtx context.Context) error {
		var err error
		info, err = i.serviceModule.Create(ctx, teamID, input)
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
			Provider: providerId,
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

	return err
}
