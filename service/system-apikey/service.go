package system_apikey

import (
	"reflect"

	"github.com/APIParkLab/APIPark/service/universally"
	"github.com/eolinker/go-common/autowire"
)

type IAPIKeyService interface {
	universally.IServiceGet[APIKey]
	universally.IServiceDelete
	universally.IServiceCreate[Create]
	universally.IServiceEdit[Update]
}

func init() {
	autowire.Auto[IAPIKeyService](func() reflect.Value {
		return reflect.ValueOf(new(imlAPIKeyService))
	})
}
