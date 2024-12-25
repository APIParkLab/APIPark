package ai

import (
	"reflect"

	"github.com/eolinker/go-common/auto"

	ai_dto "github.com/APIParkLab/APIPark/module/ai/dto"
	"github.com/eolinker/go-common/autowire"
	"github.com/gin-gonic/gin"
)

type IProviderController interface {
	ConfiguredProviders(ctx *gin.Context) ([]*ai_dto.ConfiguredProviderItem, *auto.Label, error)
	UnConfiguredProviders(ctx *gin.Context) ([]*ai_dto.ProviderItem, error)
	SimpleProviders(ctx *gin.Context) ([]*ai_dto.SimpleProviderItem, error)
	Provider(ctx *gin.Context, id string) (*ai_dto.Provider, error)
	SimpleProvider(ctx *gin.Context, id string) (*ai_dto.SimpleProvider, error)
	LLMs(ctx *gin.Context, driver string) ([]*ai_dto.LLMItem, *ai_dto.ProviderItem, error)
	Enable(ctx *gin.Context, id string) error
	Disable(ctx *gin.Context, id string) error
	UpdateProviderConfig(ctx *gin.Context, id string, input *ai_dto.UpdateConfig) error
	UpdateProviderDefaultLLM(ctx *gin.Context, id string, input *ai_dto.UpdateLLM) error
	Sort(ctx *gin.Context, input *ai_dto.Sort) error
}

type IStatisticController interface {
	APIs(ctx *gin.Context, keyword string, providerId string, start string, end string, page string, pageSize string, sortCondition string, asc string) ([]*ai_dto.APIItem, int64, error)
}

func init() {
	autowire.Auto[IProviderController](func() reflect.Value {
		return reflect.ValueOf(&imlProviderController{})
	})
	autowire.Auto[IStatisticController](func() reflect.Value {
		return reflect.ValueOf(&imlStatisticController{})
	})
}
