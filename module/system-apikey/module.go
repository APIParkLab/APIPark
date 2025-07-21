package system_apikey

import (
	"context"
	"reflect"

	"github.com/eolinker/go-common/autowire"

	"github.com/APIParkLab/APIPark/gateway"
	system_apikey_dto "github.com/APIParkLab/APIPark/module/system-apikey/dto"
)

type IAPIKeyModule interface {
	Create(ctx context.Context, input *system_apikey_dto.Create) error
	Update(ctx context.Context, id string, input *system_apikey_dto.Update) error
	Delete(ctx context.Context, id string) error
	Get(ctx context.Context, id string) (*system_apikey_dto.APIKey, error)
	Search(ctx context.Context, keyword string) ([]*system_apikey_dto.Item, error)
	SimpleList(ctx context.Context) ([]*system_apikey_dto.SimpleItem, error)
	MyAPIKeys(ctx context.Context) ([]*system_apikey_dto.SimpleItem, error)
	MyAPIKeysByService(ctx context.Context, serviceId string) ([]*system_apikey_dto.AuthorizationItem, error)
	MyAPIKeysByApp(ctx context.Context, appId string) ([]*system_apikey_dto.AuthorizationItem, error)
}

func init() {
	apikeyModule := new(imlAPIKeyModule)
	autowire.Auto[IAPIKeyModule](func() reflect.Value {
		gateway.RegisterInitHandleFunc(apikeyModule.initGateway)
		return reflect.ValueOf(apikeyModule)
	})
}
