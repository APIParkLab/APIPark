package ai_api

import (
	ai_api_dto "github.com/APIParkLab/APIPark/module/ai-api/dto"
	"github.com/eolinker/go-common/autowire"
	"github.com/gin-gonic/gin"
	"reflect"
)

type IAPIController interface {
	Create(ctx *gin.Context, serviceId string, input *ai_api_dto.CreateAPI) (*ai_api_dto.API, error)
	Edit(ctx *gin.Context, serviceId string, apiId string, input *ai_api_dto.EditAPI) (*ai_api_dto.API, error)
	Delete(ctx *gin.Context, serviceId string, apiId string) error
	List(ctx *gin.Context, keyword string, serviceId string) ([]*ai_api_dto.APIItem, error)
	Get(ctx *gin.Context, serviceId string, apiId string) (*ai_api_dto.API, error)
}

func init() {
	autowire.Auto[IAPIController](func() reflect.Value {
		m := new(imlAPIController)
		return reflect.ValueOf(m)
	})
}
