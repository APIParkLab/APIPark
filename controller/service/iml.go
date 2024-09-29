package service

import (
	"fmt"
	"github.com/APIParkLab/APIPark/module/ai"
	ai_api "github.com/APIParkLab/APIPark/module/ai-api"
	ai_api_dto "github.com/APIParkLab/APIPark/module/ai-api/dto"
	"github.com/APIParkLab/APIPark/module/service"
	service_dto "github.com/APIParkLab/APIPark/module/service/dto"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"strings"
)

var (
	_ IServiceController = (*imlServiceController)(nil)

	_ IAppController = (*imlAppController)(nil)
)

type imlServiceController struct {
	module         service.IServiceModule    `autowired:""`
	docModule      service.IServiceDocModule `autowired:""`
	aiAPIModule    ai_api.IAPIModule         `autowired:""`
	providerModule ai.IProviderModule        `autowired:""`
}

func (i *imlServiceController) CreateAIService(ctx *gin.Context, teamID string, input *service_dto.CreateService) (*service_dto.Service, error) {
	kind := "ai"
	input.Kind = &kind
	if input.Provider == nil {
		return nil, fmt.Errorf("provider is required")
	}
	p, err := i.providerModule.Provider(ctx, *input.Provider)
	if err != nil {
		return nil, err
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
	info, err := i.module.Create(ctx, teamID, input)
	if err != nil {
		return nil, err
	}
	_, err = i.aiAPIModule.Create(
		ctx,
		info.Id,
		&ai_api_dto.CreateAPI{
			Name:        "Default API",
			Path:        fmt.Sprintf("/%s", strings.Trim(input.Prefix, "/")),
			Description: "Default API for service",
			Disable:     false,
			AiPrompt: &ai_api_dto.AiPrompt{
				Variables: []*ai_api_dto.AiPromptVariable{
					{
						Key:         "Query",
						Description: "",
						Require:     true,
					},
				},
				Prompt: "{{Query}}",
			},
			AiModel: &ai_api_dto.AiModel{
				Id:     p.DefaultLLM,
				Config: p.DefaultLLMConfig,
			},
			Timeout: 300000,
			Retry:   0,
		},
	)
	if err != nil {
		i.module.Delete(ctx, info.Id, "ai")
		return nil, err
	}
	return info, nil
}

func (i *imlServiceController) DeleteAIService(ctx *gin.Context, id string) error {
	return i.module.Delete(ctx, id, "ai")
}

func (i *imlServiceController) SearchMyAIServices(ctx *gin.Context, teamID string, keyword string) ([]*service_dto.ServiceItem, error) {
	return i.module.SearchMyServicesByKind(ctx, teamID, keyword, "ai")
}

func (i *imlServiceController) SearchAIServices(ctx *gin.Context, teamID string, keyword string) ([]*service_dto.ServiceItem, error) {
	return i.module.Search(ctx, teamID, keyword, "ai")
}

func (i *imlServiceController) SearchMyServices(ctx *gin.Context, teamId string, keyword string) ([]*service_dto.ServiceItem, error) {
	return i.module.SearchMyServicesByKind(ctx, teamId, keyword, "")
}

//func (i *imlServiceController) Simple(ctx *gin.Context, keyword string) ([]*service_dto.SimpleServiceItem, error) {
//	return i.module.Simple(ctx, keyword)
//}
//
//func (i *imlServiceController) MySimple(ctx *gin.Context, keyword string) ([]*service_dto.SimpleServiceItem, error) {
//	return i.module.MySimple(ctx, keyword)
//}

func (i *imlServiceController) Get(ctx *gin.Context, id string) (*service_dto.Service, error) {
	return i.module.Get(ctx, id)
}

func (i *imlServiceController) Search(ctx *gin.Context, teamID string, keyword string) ([]*service_dto.ServiceItem, error) {
	return i.module.Search(ctx, teamID, keyword, "")
}

func (i *imlServiceController) Create(ctx *gin.Context, teamID string, input *service_dto.CreateService) (*service_dto.Service, error) {
	return i.module.Create(ctx, teamID, input)
}

func (i *imlServiceController) Edit(ctx *gin.Context, id string, input *service_dto.EditService) (*service_dto.Service, error) {
	return i.module.Edit(ctx, id, input)
}

func (i *imlServiceController) Delete(ctx *gin.Context, id string) error {
	return i.module.Delete(ctx, id, "")
}

func (i *imlServiceController) ServiceDoc(ctx *gin.Context, id string) (*service_dto.ServiceDoc, error) {
	return i.docModule.ServiceDoc(ctx, id)
}

func (i *imlServiceController) SaveServiceDoc(ctx *gin.Context, id string, input *service_dto.SaveServiceDoc) error {
	return i.docModule.SaveServiceDoc(ctx, id, input)
}

type imlAppController struct {
	module service.IAppModule `autowired:""`
}

func (i *imlAppController) Search(ctx *gin.Context, teamId string, keyword string) ([]*service_dto.AppItem, error) {
	return i.module.Search(ctx, teamId, keyword)
}

func (i *imlAppController) CreateApp(ctx *gin.Context, teamID string, input *service_dto.CreateApp) (*service_dto.App, error) {
	return i.module.CreateApp(ctx, teamID, input)
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
