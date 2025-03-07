package ai_model

import (
	model_dto "github.com/APIParkLab/APIPark/module/ai-model/dto"
	"github.com/gin-gonic/gin"
	"reflect"

	"github.com/eolinker/go-common/autowire"
)

type IProviderModelModule interface {
	AddProviderModel(ctx *gin.Context, provider string, input *model_dto.Model) (*model_dto.SimpleModel, error)
	UpdateProviderModel(ctx *gin.Context, provider string, input *model_dto.EditModel) error
	DeleteProviderModel(ctx *gin.Context, provider string, id string) error
}

func init() {
	autowire.Auto[IProviderModelModule](func() reflect.Value {
		module := new(imlProviderModelModule)
		return reflect.ValueOf(module)
	})
}
