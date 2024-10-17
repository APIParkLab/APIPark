package ai_api

import (
	"github.com/APIParkLab/APIPark/service/universally"
	"github.com/eolinker/go-common/autowire"
	"reflect"
)

type IAPIService interface {
	universally.IServiceGet[API]
	universally.IServiceCreate[Create]
	universally.IServiceEdit[Edit]
	universally.IServiceDelete

	//ListByServices(ctx context.Context, serviceIds ...string) ([]*API, error)
}

func init() {
	autowire.Auto[IAPIService](func() reflect.Value {
		return reflect.ValueOf(new(imlAPIService))
	})
}
