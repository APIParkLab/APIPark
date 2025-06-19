package ai_api

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strings"

	service_overview "github.com/APIParkLab/APIPark/service/service-overview"

	ai_provider_local "github.com/APIParkLab/APIPark/ai-provider/local"

	model_runtime "github.com/APIParkLab/APIPark/ai-provider/model-runtime"
	ai_model "github.com/APIParkLab/APIPark/service/ai-model"

	"github.com/eolinker/eosc/log"

	ai_api_dto "github.com/APIParkLab/APIPark/module/ai-api/dto"
	ai_api "github.com/APIParkLab/APIPark/service/ai-api"
	"github.com/APIParkLab/APIPark/service/api"
	api_doc "github.com/APIParkLab/APIPark/service/api-doc"
	"github.com/APIParkLab/APIPark/service/service"
	"github.com/eolinker/go-common/auto"
	"github.com/eolinker/go-common/store"
	"github.com/eolinker/go-common/utils"
	"github.com/getkin/kin-openapi/openapi3"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

var _ IAPIModule = (*imlAPIModule)(nil)

var (
	openapi3Loader = openapi3.NewLoader()
)

type imlAPIModule struct {
	serviceService         service.IServiceService           `autowired:""`
	serviceOverviewService service_overview.IOverviewService `autowired:""`
	apiDocService          api_doc.IAPIDocService            `autowired:""`
	aiAPIService           ai_api.IAPIService                `autowired:""`
	aiModelService         ai_model.IProviderModelService    `autowired:""`
	apiService             api.IAPIService                   `autowired:""`
	transaction            store.ITransaction                `autowired:""`
}

func (i *imlAPIModule) getAPIDoc(ctx context.Context, serviceId string) (*openapi3.T, error) {
	doc, err := i.apiDocService.GetDoc(ctx, serviceId)
	if err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, err
		}
		info, err := i.serviceService.Get(ctx, serviceId)
		if err != nil {
			return nil, fmt.Errorf("get service info error:%v", err)
		}
		return genOpenAPI3Template(info.Name, info.Description), nil
	}
	return openapi3Loader.LoadFromData([]byte(doc.Content))
}

func (i *imlAPIModule) updateAPIDoc(ctx context.Context, serviceId, serviceName, orgPath, path, summary, description string, aiPrompt *ai_api_dto.AiPrompt) error {
	doc, err := i.getAPIDoc(ctx, serviceId)
	if err != nil {
		return err
	}

	var variables []*ai_api_dto.AiPromptVariable
	if aiPrompt != nil {
		variables = aiPrompt.Variables
	}
	if doc.Paths != nil {
		doc.Paths.Delete(orgPath)
	}

	doc.AddOperation(path, http.MethodPost, genOperation(summary, description, variables))
	result, err := doc.MarshalJSON()
	if err != nil {
		return err
	}
	return i.transaction.Transaction(ctx, func(ctx context.Context) error {
		count, err := i.apiDocService.UpdateDoc(ctx, serviceId, &api_doc.UpdateDoc{
			ID:      uuid.New().String(),
			Content: string(result),
		})
		if err != nil {
			return fmt.Errorf("update api doc error:%v", err)
		}
		return i.serviceOverviewService.Update(ctx, serviceId, &service_overview.Update{
			ApiCount: &count,
		})
	})
}

func (i *imlAPIModule) deleteAPIDoc(ctx context.Context, serviceId string, path string) error {
	doc, err := i.getAPIDoc(ctx, serviceId)
	if err != nil {
		return err
	}
	doc.Paths.Delete(path)
	result, err := doc.MarshalJSON()
	if err != nil {
		return err
	}
	return i.transaction.Transaction(ctx, func(ctx context.Context) error {
		count, err := i.apiDocService.UpdateDoc(ctx, serviceId, &api_doc.UpdateDoc{
			ID:      uuid.New().String(),
			Content: string(result),
		})
		if err != nil {
			return fmt.Errorf("update api doc error:%v", err)
		}
		return i.serviceOverviewService.Update(ctx, serviceId, &service_overview.Update{
			ApiCount: &count,
		})
	})

}

func (i *imlAPIModule) Create(ctx context.Context, serviceId string, input *ai_api_dto.CreateAPI) error {
	info, err := i.serviceService.Get(ctx, serviceId)
	if err != nil {
		return err
	}
	if info.Kind != service.AIService {
		return fmt.Errorf("service kind is not ai service")
	}
	if input.Id == "" {
		input.Id = uuid.New().String()
	}
	return i.transaction.Transaction(ctx, func(txCtx context.Context) error {
		err = i.updateAPIDoc(ctx, serviceId, info.Name, "", input.Path, input.Name, input.Description, input.AiPrompt)
		if err != nil {
			return err
		}

		return i.aiAPIService.Create(ctx, &ai_api.Create{
			ID:          input.Id,
			Name:        input.Name,
			Service:     serviceId,
			Path:        input.Path,
			Disable:     input.Disable,
			Description: input.Description,
			Timeout:     input.Timeout,
			Retry:       input.Retry,
			Model:       input.AiModel.Id,
			Provider:    input.AiModel.Provider,
			Type:        ai_api_dto.ModelType(input.AiModel.Type).Int(),
			AdditionalConfig: map[string]interface{}{
				"ai_prompt": input.AiPrompt,
				"ai_model":  input.AiModel,
			},
		})
	})

}

func (i *imlAPIModule) Edit(ctx context.Context, serviceId string, apiId string, input *ai_api_dto.EditAPI) error {
	info, err := i.serviceService.Get(ctx, serviceId)
	if err != nil {
		return err
	}
	if info.Kind != service.AIService {
		return fmt.Errorf("service kind is not ai service")
	}

	return i.transaction.Transaction(ctx, func(txCtx context.Context) error {
		apiInfo, err := i.aiAPIService.Get(ctx, apiId)
		if err != nil {
			return err
		}
		orgPath := apiInfo.Path
		if input.Path != nil {
			apiInfo.Path = *input.Path
		}
		if input.Description != nil {
			apiInfo.Description = *input.Description
		}
		err = i.updateAPIDoc(ctx, serviceId, info.Name, orgPath, apiInfo.Path, apiInfo.Name, apiInfo.Description, input.AiPrompt)
		if err != nil {
			return err
		}
		var modelId *string
		var providerId *string
		if input.AiModel != nil {
			modelId = &input.AiModel.Id
			providerId = &input.AiModel.Provider
		}
		if input.AiPrompt != nil {
			apiInfo.AdditionalConfig["ai_prompt"] = input.AiPrompt
		}
		if input.AiModel != nil {
			apiInfo.AdditionalConfig["ai_model"] = input.AiModel
		}
		typ := ai_api_dto.ModelType(input.AiModel.Type).Int()
		return i.aiAPIService.Save(ctx, apiId, &ai_api.Edit{
			Name:             input.Name,
			Path:             input.Path,
			Description:      input.Description,
			Timeout:          input.Timeout,
			Retry:            input.Retry,
			Model:            modelId,
			Provider:         providerId,
			Type:             &typ,
			AdditionalConfig: &apiInfo.AdditionalConfig,
			Disable:          input.Disable,
		})
	})
}

func (i *imlAPIModule) Delete(ctx context.Context, serviceId string, apiId string) error {
	info, err := i.serviceService.Get(ctx, serviceId)
	if err != nil {
		return err
	}
	if info.Kind != service.AIService {
		return fmt.Errorf("service kind is not ai service")
	}
	return i.transaction.Transaction(ctx, func(txCtx context.Context) error {
		apiInfo, err := i.aiAPIService.Get(ctx, apiId)
		if err != nil {
			return err
		}
		err = i.deleteAPIDoc(ctx, serviceId, apiInfo.Path)
		if err != nil {
			return err
		}
		return i.aiAPIService.Delete(ctx, apiId)
	})
}

func (i *imlAPIModule) List(ctx context.Context, keyword string, serviceId string) ([]*ai_api_dto.APIItem, error) {
	info, err := i.serviceService.Get(ctx, serviceId)
	if err != nil {
		return nil, err
	}
	if info.Kind != service.AIService {
		return nil, fmt.Errorf("service kind is not ai service")
	}
	apis, err := i.aiAPIService.Search(ctx, keyword, map[string]interface{}{
		"service": serviceId,
	}, "update_at desc")
	if err != nil {
		return nil, err
	}
	return utils.SliceToSlice(apis, func(t *ai_api.API) *ai_api_dto.APIItem {
		item := &ai_api_dto.APIItem{
			Id:          t.ID,
			Name:        t.Name,
			RequestPath: t.Path,
			Description: t.Description,
			Disable:     t.Disable,
			Creator:     auto.UUID(t.Creator),
			Updater:     auto.UUID(t.Updater),
			CreateTime:  auto.TimeLabel(t.CreateAt),
			UpdateTime:  auto.TimeLabel(t.UpdateAt),
		}
		aiModel, err := ConvertStruct[ai_api_dto.AiModel](t.AdditionalConfig["ai_model"])
		if err != nil {
			return item
		}
		item.ModelType = ai_api_dto.ModelType(aiModel.Type)
		if item.ModelType == ai_api_dto.ModelTypeLocal {
			item.Model = ai_api_dto.ModelItem{
				Id:   aiModel.Id,
				Name: aiModel.Id,
			}
			item.Provider = ai_api_dto.ProviderItem{
				Id:   ai_provider_local.ProviderLocal,
				Name: ai_provider_local.ProviderLocal,
				Logo: "",
			}
		} else {
			p, has := model_runtime.GetProvider(aiModel.Provider)
			if has {
				item.Provider = ai_api_dto.ProviderItem{
					Id:   p.ID(),
					Name: p.Name(),
					Logo: "",
				}
				m, has := p.GetModel(t.Model)
				if has {
					item.Model = ai_api_dto.ModelItem{
						Id:   m.ID(),
						Name: m.Name(),
						Logo: "",
					}
				}
			} else {
				item.Model = ai_api_dto.ModelItem{
					Id:   aiModel.Id,
					Name: "unknown",
				}
			}
		}

		return item
	}), nil
}

func (i *imlAPIModule) Get(ctx context.Context, serviceId string, apiId string) (*ai_api_dto.API, error) {
	info, err := i.serviceService.Get(ctx, serviceId)
	if err != nil {
		return nil, err
	}
	if info.Kind != service.AIService {
		return nil, fmt.Errorf("service kind is not ai service")
	}
	apiInfo, err := i.aiAPIService.Get(ctx, apiId)
	if err != nil {
		return nil, err
	}
	prompt, err := ConvertStruct[ai_api_dto.AiPrompt](apiInfo.AdditionalConfig["ai_prompt"])
	if err != nil {
		return nil, err
	}
	aiModel, err := ConvertStruct[ai_api_dto.AiModel](apiInfo.AdditionalConfig["ai_model"])
	if err != nil {
		return nil, err
	}
	if aiModel.Name == "" {
		// get provider model
		modelInfo, _ := i.aiModelService.Get(ctx, aiModel.Id)
		if modelInfo != nil {
			aiModel.Name = modelInfo.Name
		} else {
			aiModel.Name = aiModel.Id
		}
	}

	return &ai_api_dto.API{
		Id:          apiInfo.ID,
		Name:        apiInfo.Name,
		Path:        apiInfo.Path,
		Description: apiInfo.Description,
		Disable:     apiInfo.Disable,
		AiPrompt:    prompt,
		AiModel:     aiModel,
		Timeout:     apiInfo.Timeout,
		Retry:       apiInfo.Retry,
	}, nil
}

func ConvertStruct[T any](data interface{}) (*T, error) {
	b, err := json.Marshal(data)
	if err != nil {
		return nil, err
	}
	var t T
	err = json.Unmarshal(b, &t)
	if err != nil {
		return nil, err
	}
	return &t, nil
}

func (i *imlAPIModule) Prefix(ctx context.Context, serviceId string) (string, error) {
	pInfo, err := i.serviceService.Check(ctx, serviceId, map[string]bool{"as_server": true})
	if err != nil {
		return "", err
	}

	if pInfo.Prefix != "" {
		if pInfo.Prefix[0] != '/' {
			pInfo.Prefix = fmt.Sprintf("/%s", strings.TrimSuffix(pInfo.Prefix, "/"))
		}
	}
	return strings.TrimSuffix(pInfo.Prefix, "/"), nil
}

func (i *imlAPIModule) OnInit() {
	ctx := context.Background()
	list, err := i.aiAPIService.List(ctx)
	if err != nil {
		return
	}
	for _, item := range list {
		if item.Provider == "" {
			aiModel, err := ConvertStruct[ai_api_dto.AiModel](item.AdditionalConfig["ai_model"])
			if err != nil {
				log.Errorf("convert ai model error:%v", err)
				continue
			}
			err = i.aiAPIService.Save(ctx, item.ID, &ai_api.Edit{
				Provider: &aiModel.Provider,
			})
			if err != nil {
				log.Errorf("update ai api provider error:%v", err)
				continue
			}
		}
	}
}
