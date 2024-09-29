package ai_api

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	model_runtime "github.com/APIParkLab/APIPark/ai-provider/model-runtime"
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
	"net/http"
	"strings"
)

var _ IAPIModule = (*imlAPIModule)(nil)

var (
	openapi3Loader = openapi3.NewLoader()
)

type imlAPIModule struct {
	serviceService service.IServiceService `autowired:""`
	apiDocService  api_doc.IAPIDocService  `autowired:""`
	aiAPIService   ai_api.IAPIService      `autowired:""`
	apiService     api.IAPIService         `autowired:""`
	transaction    store.ITransaction      `autowired:""`
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

func (i *imlAPIModule) updateAPIDoc(ctx context.Context, serviceId string, path string, description string, aiPrompt *ai_api_dto.AiPrompt) error {
	doc, err := i.getAPIDoc(ctx, serviceId)
	if err != nil {
		return err
	}
	var variables []*ai_api_dto.AiPromptVariable
	if aiPrompt != nil {
		variables = aiPrompt.Variables
	}
	doc.AddOperation(path, http.MethodPost, genOperation(description, variables))
	result, err := doc.MarshalJSON()
	if err != nil {
		return err
	}
	return i.apiDocService.UpdateDoc(ctx, serviceId, &api_doc.UpdateDoc{
		ID:      uuid.New().String(),
		Content: string(result),
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
	return i.apiDocService.UpdateDoc(ctx, serviceId, &api_doc.UpdateDoc{
		ID:      uuid.New().String(),
		Content: string(result),
	})
}

func (i *imlAPIModule) Create(ctx context.Context, serviceId string, input *ai_api_dto.CreateAPI) (*ai_api_dto.API, error) {
	info, err := i.serviceService.Get(ctx, serviceId)
	if err != nil {
		return nil, err
	}
	if info.Kind != service.AIService {
		return nil, fmt.Errorf("service kind is not ai service")
	}
	if input.Id == "" {
		input.Id = uuid.New().String()
	}
	err = i.transaction.Transaction(ctx, func(txCtx context.Context) error {
		err = i.apiService.Exist(ctx, "", &api.Exist{Path: input.Path, Methods: []string{http.MethodPost}})
		if err != nil {
			return err
		}
		err = i.apiService.Create(ctx, &api.Create{
			UUID:        input.Id,
			Description: input.Description,
			Service:     serviceId,
			Team:        info.Team,
			Methods: []string{
				http.MethodPost,
			},
			Protocols: []string{
				"http",
				"https",
			},
			Disable: false,
			Path:    input.Path,
			Match:   "{}",
		})
		if err != nil {
			return err
		}
		err = i.updateAPIDoc(ctx, serviceId, input.Path, input.Description, input.AiPrompt)
		if err != nil {
			return err
		}
		return i.aiAPIService.Create(ctx, &ai_api.Create{
			ID:          input.Id,
			Name:        input.Name,
			Service:     serviceId,
			Path:        input.Path,
			Description: input.Description,
			Timeout:     input.Timeout,
			Retry:       input.Retry,
			Model:       input.AiModel.Id,
			AdditionalConfig: map[string]interface{}{
				"ai_prompt": input.AiPrompt,
				"ai_model":  input.AiModel,
			},
		})
	})
	if err != nil {
		return nil, err
	}

	return i.Get(ctx, serviceId, input.Id)
}

func (i *imlAPIModule) Edit(ctx context.Context, serviceId string, apiId string, input *ai_api_dto.EditAPI) (*ai_api_dto.API, error) {
	info, err := i.serviceService.Get(ctx, serviceId)
	if err != nil {
		return nil, err
	}
	if info.Kind != service.AIService {
		return nil, fmt.Errorf("service kind is not ai service")
	}

	err = i.transaction.Transaction(ctx, func(txCtx context.Context) error {
		apiInfo, err := i.aiAPIService.Get(ctx, apiId)
		if err != nil {
			return err
		}
		if input.Path != nil {
			apiInfo.Path = *input.Path
			prefix, err := i.Prefix(ctx, serviceId)
			if err != nil {
				return err
			}
			if !strings.HasSuffix(apiInfo.Path, prefix) {
				if apiInfo.Path[0] != '/' {
					apiInfo.Path = fmt.Sprintf("/%s", apiInfo.Path)
				}
				apiInfo.Path = fmt.Sprintf("%s%s", prefix, apiInfo.Path)
				err := i.apiService.Exist(ctx, apiId, &api.Exist{Path: apiInfo.Path, Methods: []string{http.MethodPost}})
				if err != nil {
					return err
				}
				err = i.apiService.Save(ctx, apiId, &api.Edit{
					Path: &apiInfo.Path,
				})
				if err != nil {
					return err
				}
			}
		}
		if input.Description != nil {
			apiInfo.Description = *input.Description
		}
		err = i.updateAPIDoc(ctx, serviceId, apiInfo.Path, apiInfo.Description, input.AiPrompt)
		if err != nil {
			return err
		}
		var modelId *string
		if input.AiModel != nil {
			modelId = &input.AiModel.Id
		}
		if input.AiPrompt != nil {
			apiInfo.AdditionalConfig["ai_prompt"] = input.AiPrompt
		}
		if input.AiModel != nil {
			apiInfo.AdditionalConfig["ai_model"] = input.AiModel
		}
		return i.aiAPIService.Save(ctx, apiId, &ai_api.Edit{
			Name:             input.Name,
			Path:             input.Path,
			Description:      input.Description,
			Timeout:          input.Timeout,
			Retry:            input.Retry,
			Model:            modelId,
			AdditionalConfig: &apiInfo.AdditionalConfig,
		})
	})
	if err != nil {
		return nil, err
	}

	return i.Get(ctx, serviceId, apiId)
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
	p, has := model_runtime.GetProvider(info.AdditionalConfig["provider"])
	if !has {
		return nil, fmt.Errorf("provider not found")
	}
	return utils.SliceToSlice(apis, func(t *ai_api.API) *ai_api_dto.APIItem {
		modelItem := ai_api_dto.ModelItem{
			Id: t.Model,
		}
		model, has := p.DefaultModel(t.Model)
		if has {
			modelItem.Logo = model.Logo()
		}
		return &ai_api_dto.APIItem{
			Id:          t.ID,
			Name:        t.Name,
			RequestPath: t.Path,
			Description: t.Description,
			Disable:     t.Disable,
			Creator:     auto.UUID(t.Creator),
			Updater:     auto.UUID(t.Updater),
			CreateTime:  auto.TimeLabel(t.CreateAt),
			UpdateTime:  auto.TimeLabel(t.UpdateAt),
			Model:       modelItem,
		}
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
