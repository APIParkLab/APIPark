package ai_model

import (
	"fmt"
	model_runtime "github.com/APIParkLab/APIPark/ai-provider/model-runtime"
	model_dto "github.com/APIParkLab/APIPark/module/ai-model/dto"
	"github.com/APIParkLab/APIPark/service/ai"
	ai_api "github.com/APIParkLab/APIPark/service/ai-api"
	ai_model "github.com/APIParkLab/APIPark/service/ai-model"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"slices"

	"github.com/eolinker/go-common/store"
)

var (
	_ IProviderModelModule = (*imlProviderModelModule)(nil)
)

type imlProviderModelModule struct {
	providerService      ai.IProviderService            `autowired:""`
	aiApiService         ai_api.IAPIService             `autowired:""`
	providerModelService ai_model.IProviderModelService `autowired:""`
	transaction          store.ITransaction             `autowired:""`
}

func (i *imlProviderModelModule) GetModelParametersTemplate(ctx *gin.Context) ([]*model_dto.ModelParametersTemplate, error) {
	templates := make([]*model_dto.ModelParametersTemplate, 0)
	providerNames := []string{"openai", "google", "anthropic", "deepseek", "tongyi"}
	providers := model_runtime.Providers()
	for _, provider := range providers {
		if slices.Contains(providerNames, provider.ID()) {
			defaultModel, _ := provider.DefaultModel(model_runtime.ModelTypeLLM)
			templates = append(templates, &model_dto.ModelParametersTemplate{
				Id:              provider.ID(),
				ProviderName:    provider.Name(),
				ModelName:       defaultModel.Name(),
				ModelParameters: defaultModel.DefaultConfig(),
			})
		}
	}

	return templates, nil
}

func (i *imlProviderModelModule) UpdateProviderModel(ctx *gin.Context, provider string, input *model_dto.EditModel) error {
	p, has := model_runtime.GetProvider(provider)
	if !has {
		return fmt.Errorf("ai provider not found")
	}
	// check provider exist
	providerInfo, err := i.providerService.Get(ctx, provider)
	if err != nil {
		return err
	}
	if providerInfo == nil {
		return fmt.Errorf("provider not found")
	}
	modelInfo, _ := i.providerModelService.Get(ctx, input.Id)
	if modelInfo == nil || modelInfo.Provider != provider {
		return fmt.Errorf("model not found")
	}
	// check model name duplicate
	if has := i.providerModelService.CheckNameDuplicate(ctx, provider, input.Name, input.Id); has {
		return fmt.Errorf("model name: `%s` duplicate", input.Name)
	}
	if err := i.providerModelService.Save(ctx, input.Id, &ai_model.Model{
		Name:                &input.Name,
		AccessConfiguration: &input.AccessConfiguration,
		ModelParameters:     &input.ModelParameters,
	}); err != nil {
		return err
	}
	// update provider model
	iModel, _ := model_runtime.NewCustomizeModel(input.Id, input.Name, p.Logo(), input.AccessConfiguration, input.ModelParameters)
	p.SetModel(input.Id, iModel)

	return nil
}

func (i *imlProviderModelModule) DeleteProviderModel(ctx *gin.Context, provider string, id string) error {
	p, has := model_runtime.GetProvider(provider)
	// check provider exist
	providerInfo, err := i.providerService.Get(ctx, provider)
	if err != nil {
		return err
	}
	if providerInfo == nil || !has {
		return fmt.Errorf("provider not found")
	}
	modelInfo, _ := i.providerModelService.Get(ctx, id)
	if modelInfo == nil || modelInfo.Provider != provider {
		return fmt.Errorf("model not found")
	}
	// check model in use
	countMapByModel, _ := i.aiApiService.CountMapByModel(ctx, "", map[string]interface{}{"model": id})
	if countValue, has := countMapByModel[id]; has && countValue > 0 {
		return fmt.Errorf("model in use")
	}
	if err := i.providerModelService.Delete(ctx, id); err != nil {
		return err
	}
	p.RemoveModel(id)

	return nil
}

func (i *imlProviderModelModule) AddProviderModel(ctx *gin.Context, provider string, input *model_dto.Model) (*model_dto.SimpleModel, error) {
	p, has := model_runtime.GetProvider(provider)
	if !has {
		return nil, fmt.Errorf("ai provider not found")
	}
	// check model name duplicate
	if has := i.providerModelService.CheckNameDuplicate(ctx, provider, input.Name, ""); has {
		return nil, fmt.Errorf("model name: `%s` duplicate", input.Name)
	}
	id := uuid.New().String()
	typeValue := "chat"
	if err := i.providerModelService.Save(ctx, id, &ai_model.Model{
		Name:                &input.Name,
		Type:                &typeValue,
		Provider:            &provider,
		AccessConfiguration: &input.AccessConfiguration,
		ModelParameters:     &input.ModelParameters,
	}); err != nil {
		return nil, err
	}
	// update provider model
	iModel, _ := model_runtime.NewCustomizeModel(id, input.Name, p.Logo(), input.AccessConfiguration, input.ModelParameters)
	p.SetModel(id, iModel)
	return &model_dto.SimpleModel{
		Id:   id,
		Name: input.Name,
	}, nil
}
