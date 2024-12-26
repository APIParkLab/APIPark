package ai

import (
	"context"
	"reflect"

	"github.com/eolinker/go-common/auto"

	"github.com/APIParkLab/APIPark/gateway"
	ai_dto "github.com/APIParkLab/APIPark/module/ai/dto"
	"github.com/eolinker/go-common/autowire"
)

type IProviderModule interface {
	ConfiguredProviders(ctx context.Context) ([]*ai_dto.ConfiguredProviderItem, *auto.Label, error)
	UnConfiguredProviders(ctx context.Context) ([]*ai_dto.ProviderItem, error)
	SimpleProviders(ctx context.Context) ([]*ai_dto.SimpleProviderItem, error)
	Provider(ctx context.Context, id string) (*ai_dto.Provider, error)
	SimpleProvider(ctx context.Context, id string) (*ai_dto.SimpleProvider, error)
	LLMs(ctx context.Context, driver string) ([]*ai_dto.LLMItem, *ai_dto.ProviderItem, error)
	UpdateProviderStatus(ctx context.Context, id string, enable bool) error
	UpdateProviderConfig(ctx context.Context, id string, input *ai_dto.UpdateConfig) error
	UpdateProviderDefaultLLM(ctx context.Context, id string, input *ai_dto.UpdateLLM) error
	Sort(ctx context.Context, input *ai_dto.Sort) error
}

type IAIAPIModule interface {
	APIs(ctx context.Context, keyword string, providerId string, start int64, end int64, page int, pageSize int, sortCondition string, asc bool) ([]*ai_dto.APIItem, int64, error)
}

func init() {
	autowire.Auto[IProviderModule](func() reflect.Value {
		module := new(imlProviderModule)
		gateway.RegisterInitHandleFunc(module.initGateway)
		return reflect.ValueOf(module)
	})

	autowire.Auto[IAIAPIModule](func() reflect.Value {
		return reflect.ValueOf(new(imlAIApiModule))
	})
}
