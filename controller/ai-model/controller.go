package ai_model

import (
	model_dto "github.com/APIParkLab/APIPark/module/ai-model/dto"
	"github.com/eolinker/go-common/autowire"
	"github.com/gin-gonic/gin"
	"reflect"
)

type IProviderModelController interface {
	AddProviderModel(ctx *gin.Context, provider string, input *model_dto.Model) (*model_dto.SimpleModel, error)
	UpdateProviderModel(ctx *gin.Context, provider string, input *model_dto.EditModel) error
	DeleteProviderModel(ctx *gin.Context, provider string, id string) error
	GetModelParametersTemplate(ctx *gin.Context) ([]*model_dto.ModelParametersTemplate, error)
}

func init() {
	autowire.Auto[IProviderModelController](func() reflect.Value {
		return reflect.ValueOf(&imlProviderModelController{})
	})
}
