package ai_key

import (
	"reflect"

	ai_key_dto "github.com/APIParkLab/APIPark/module/ai-key/dto"
	"github.com/eolinker/go-common/autowire"
	"github.com/gin-gonic/gin"
)

type IKeyController interface {
	Create(ctx *gin.Context, providerId string, input *ai_key_dto.Create) error
	Edit(ctx *gin.Context, providerId string, id string, input *ai_key_dto.Edit) error
	Delete(ctx *gin.Context, providerId string, id string) error
	Get(ctx *gin.Context, providerId string, id string) (*ai_key_dto.Key, error)
	List(ctx *gin.Context, providerId string, keyword string, page string, pageSize string) ([]*ai_key_dto.Item, int64, error)
	Enable(ctx *gin.Context, providerId string, id string) error
	Disable(ctx *gin.Context, providerId string, id string) error
	Sort(ctx *gin.Context, providerId string, input *ai_key_dto.Sort) error
}

func init() {
	autowire.Auto[IKeyController](func() reflect.Value {
		return reflect.ValueOf(new(imlAIKeyController))
	})
}
