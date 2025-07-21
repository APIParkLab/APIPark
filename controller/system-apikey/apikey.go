package system_apikey

import (
	"reflect"

	system_apikey_dto "github.com/APIParkLab/APIPark/module/system-apikey/dto"
	"github.com/eolinker/go-common/autowire"
	"github.com/gin-gonic/gin"
)

type IAPIKeyController interface {
	Create(ctx *gin.Context, input *system_apikey_dto.Create) error
	Update(ctx *gin.Context, id string, input *system_apikey_dto.Update) error
	Delete(ctx *gin.Context, id string) error
	Get(ctx *gin.Context, id string) (*system_apikey_dto.APIKey, error)
	Search(ctx *gin.Context, keyword string) ([]*system_apikey_dto.Item, error)
	SimpleList(ctx *gin.Context) ([]*system_apikey_dto.SimpleItem, error)
	MyAPIKeys(ctx *gin.Context) ([]*system_apikey_dto.SimpleItem, error)
	MyAPIKeysByService(ctx *gin.Context, serviceId string, appId string) ([]*system_apikey_dto.AuthorizationItem, error)
}

func init() {
	autowire.Auto[IAPIKeyController](func() reflect.Value {
		return reflect.ValueOf(new(imlAPIKeyController))
	})
}
