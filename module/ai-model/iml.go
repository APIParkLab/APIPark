package ai_model

import (
	"context"
	"errors"
	"fmt"
	"slices"
	"time"

	"gorm.io/gorm"

	"github.com/APIParkLab/APIPark/service/cluster"

	"github.com/APIParkLab/APIPark/gateway"

	model_runtime "github.com/APIParkLab/APIPark/ai-provider/model-runtime"
	model_dto "github.com/APIParkLab/APIPark/module/ai-model/dto"
	"github.com/APIParkLab/APIPark/service/ai"
	ai_api "github.com/APIParkLab/APIPark/service/ai-api"
	ai_model "github.com/APIParkLab/APIPark/service/ai-model"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"github.com/eolinker/eosc/log"
	"github.com/eolinker/go-common/store"
)

var (
	_ IProviderModelModule = (*imlProviderModelModule)(nil)
)

type imlProviderModelModule struct {
	providerService      ai.IProviderService            `autowired:""`
	aiApiService         ai_api.IAPIService             `autowired:""`
	providerModelService ai_model.IProviderModelService `autowired:""`
	clusterService       cluster.IClusterService        `autowired:""`
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
	_, err := i.providerService.Get(ctx, provider)
	if err != nil {
		return err
	}
	modelInfo, _ := i.providerModelService.Get(ctx, input.Id)
	if modelInfo == nil || modelInfo.Provider != provider {
		return fmt.Errorf("model not found")
	}
	return i.transaction.Transaction(ctx, func(ctx context.Context) error {
		if err = i.providerModelService.Save(ctx, input.Id, &ai_model.Model{
			AccessConfiguration: &input.AccessConfiguration,
			ModelParameters:     &input.ModelParameters,
		}); err != nil {
			return err
		}

		// update provider model
		iModel, err := model_runtime.NewCustomizeModel(input.Id, input.Name, p.Logo(), input.AccessConfiguration, input.ModelParameters)
		if err != nil {
			return err
		}
		// 判断是否需要发布model
		if p.GetModelConfig().AccessConfigurationStatus {
			if err := i.syncGateway(ctx, cluster.DefaultClusterID, []*gateway.DynamicRelease{
				newModel(provider, input.Name, input.AccessConfiguration),
			}, true); err != nil {
				return err
			}
		}

		p.SetModel(input.Id, iModel)
		return nil
	})

	return nil
}

func (i *imlProviderModelModule) DeleteProviderModel(ctx *gin.Context, provider string, id string) error {
	p, has := model_runtime.GetProvider(provider)
	if !has {
		return fmt.Errorf("ai provider not found")
	}
	// check provider exist
	_, err := i.providerService.Get(ctx, provider)
	if err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return fmt.Errorf("provider not found")
		}
		return err
	}
	modelInfo, _ := i.providerModelService.Get(ctx, id)
	if modelInfo == nil || modelInfo.Provider != provider {
		return fmt.Errorf("model not found")
	}
	return i.transaction.Transaction(ctx, func(ctx context.Context) error {
		// check model in use
		count, err := i.aiApiService.CountByModel(ctx, id)
		if err != nil {
			return err
		}
		if count > 0 {
			return fmt.Errorf("model in use")
		}
		if err := i.providerModelService.Delete(ctx, id); err != nil {
			return err
		}
		if p.GetModelConfig().AccessConfigurationStatus {
			err = i.syncGateway(ctx, cluster.DefaultClusterID, []*gateway.DynamicRelease{
				{
					BasicItem: &gateway.BasicItem{
						ID:       fmt.Sprintf("%s$%s", provider, modelInfo.Name),
						Resource: "ai-model",
					},
					Attr: nil,
				},
			}, false)
			if err != nil {
				return err
			}
		}

		p.RemoveModel(id)
		return nil
	})

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
	// check provider model exist
	if _, has := p.GetModel(input.Name); has {
		return nil, fmt.Errorf("provider model already exist")
	}
	id := uuid.New().String()
	err := i.transaction.Transaction(ctx, func(ctx context.Context) error {
		typeValue := "chat"
		err := i.providerModelService.Save(ctx, id, &ai_model.Model{
			Name:                &input.Name,
			Type:                &typeValue,
			Provider:            &provider,
			AccessConfiguration: &input.AccessConfiguration,
			ModelParameters:     &input.ModelParameters,
		})
		if err != nil {
			return err
		}
		// update provider model
		iModel, err := model_runtime.NewCustomizeModel(id, input.Name, p.Logo(), input.AccessConfiguration, input.ModelParameters)
		if err != nil {
			return err
		}
		// 判断是否需要发布model
		if p.GetModelConfig().AccessConfigurationStatus {
			if err := i.syncGateway(ctx, cluster.DefaultClusterID, []*gateway.DynamicRelease{
				newModel(provider, input.Name, input.AccessConfiguration),
			}, true); err != nil {
				return err
			}
		}

		p.SetModel(id, iModel)
		return nil
	})
	if err != nil {
		return nil, err
	}
	return &model_dto.SimpleModel{
		Id:   id,
		Name: input.Name,
	}, nil
}

func newModel(provider string, model string, config string) *gateway.DynamicRelease {
	if config == "" {
		config = "{}"
	}
	return &gateway.DynamicRelease{
		BasicItem: &gateway.BasicItem{
			ID:          fmt.Sprintf("%s$%s", provider, model),
			Description: fmt.Sprintf("auto generated model: %s, provider: %s", model, provider),
			Resource:    "ai-model",
			Version:     time.Now().Format("20060102150405"),
			MatchLabels: map[string]string{
				"module": "ai-model",
			},
		},
		Attr: map[string]interface{}{
			"provider":      provider,
			"model":         model,
			"access_config": config,
		},
	}
}

func (i *imlProviderModelModule) syncGateway(ctx context.Context, clusterId string, releases []*gateway.DynamicRelease, online bool) error {
	client, err := i.clusterService.GatewayClient(ctx, clusterId)
	if err != nil {
		log.Errorf("get apinto client error: %v", err)
		return nil
	}
	defer func() {
		err := client.Close(ctx)
		if err != nil {
			log.Warn("close apinto client:", err)
		}
	}()
	for _, releaseInfo := range releases {
		dynamicClient, err := client.Dynamic(releaseInfo.Resource)
		if err != nil {
			return err
		}
		if online {
			err = dynamicClient.Online(ctx, releaseInfo)
		} else {
			err = dynamicClient.Offline(ctx, releaseInfo)
		}
		if err != nil {
			return err
		}
	}

	return nil
}
