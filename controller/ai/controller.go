package ai

import (
	ai_dto "github.com/APIParkLab/APIPark/module/ai/dto"
	"github.com/eolinker/go-common/autowire"
	"github.com/gin-gonic/gin"
	"reflect"
)

type IProviderController interface {
	Providers(ctx *gin.Context) ([]*ai_dto.ProviderItem, error)
	SimpleProviders(ctx *gin.Context) ([]*ai_dto.SimpleProviderItem, error)
	Provider(ctx *gin.Context, id string) (*ai_dto.Provider, error)
	LLMs(ctx *gin.Context, driver string) ([]*ai_dto.LLMItem, *ai_dto.ProviderItem, error)
	Enable(ctx *gin.Context, id string) error
	Disable(ctx *gin.Context, id string) error
	UpdateProviderConfig(ctx *gin.Context, id string, input *ai_dto.UpdateConfig) error
	UpdateProviderDefaultLLM(ctx *gin.Context, id string, input *ai_dto.UpdateLLM) error
}

func init() {
	autowire.Auto[IProviderController](func() reflect.Value {
		return reflect.ValueOf(&imlProviderController{})
	})
}
