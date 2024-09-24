package ai

import (
	"context"
	ai_dto "github.com/APIParkLab/APIPark/module/ai/dto"
	"github.com/APIParkLab/APIPark/module/ai/provider/openAI"
	"github.com/eolinker/go-common/autowire"
	"reflect"
)

type IProviderModule interface {
	Providers(ctx context.Context) ([]*ai_dto.ProviderItem, error)
	SimpleProviders(ctx context.Context) ([]*ai_dto.SimpleProviderItem, error)
	Provider(ctx context.Context, id string) (*ai_dto.Provider, error)
	LLMs(ctx context.Context, driver string) ([]*ai_dto.LLMItem, error)
	UpdateProviderStatus(ctx context.Context, id string, enable bool) error
	UpdateProviderConfig(ctx context.Context, id string, input *ai_dto.UpdateConfig) error
	UpdateProviderDefaultLLM(ctx context.Context, id string, input *ai_dto.UpdateLLM) error
}

func init() {
	openAI.Register()
	autowire.Auto[IProviderModule](func() reflect.Value {
		return reflect.ValueOf(&imlProviderModule{})
	})
}
