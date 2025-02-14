package ai

import (
	"reflect"

	ai_dto "github.com/APIParkLab/APIPark/module/ai/dto"
	"github.com/eolinker/go-common/autowire"
	"github.com/gin-gonic/gin"
)

type IProviderController interface {
	ConfiguredProviders(ctx *gin.Context, keyword string) ([]*ai_dto.ConfiguredProviderItem, error)
	UnConfiguredProviders(ctx *gin.Context) ([]*ai_dto.ProviderItem, error)
	SimpleProviders(ctx *gin.Context) ([]*ai_dto.SimpleProviderItem, error)
	SimpleConfiguredProviders(ctx *gin.Context, all string) ([]*ai_dto.SimpleProviderItem, *ai_dto.BackupProvider, error)
	Provider(ctx *gin.Context, id string) (*ai_dto.Provider, error)
	SimpleProvider(ctx *gin.Context, id string) (*ai_dto.SimpleProvider, error)
	LLMs(ctx *gin.Context, driver string) ([]*ai_dto.LLMItem, *ai_dto.ProviderItem, error)
	Enable(ctx *gin.Context, id string) error
	Disable(ctx *gin.Context, id string) error
	UpdateProviderConfig(ctx *gin.Context, id string, input *ai_dto.UpdateConfig) error
	UpdateProviderDefaultLLM(ctx *gin.Context, id string, input *ai_dto.UpdateLLM) error
	Delete(ctx *gin.Context, id string) error
	//Sort(ctx *gin.Context, input *ai_dto.Sort) error
}

type IStatisticController interface {
	APIs(ctx *gin.Context, keyword string, providerId string, start string, end string, page string, pageSize string, sortCondition string, asc string, models string, services string) ([]*ai_dto.APIItem, *ai_dto.Condition, int64, error)
}

func init() {
	autowire.Auto[IProviderController](func() reflect.Value {
		return reflect.ValueOf(&imlProviderController{})
	})
	autowire.Auto[IStatisticController](func() reflect.Value {
		return reflect.ValueOf(&imlStatisticController{})
	})
}
