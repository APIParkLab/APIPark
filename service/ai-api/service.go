package ai_api

import (
	"context"
	"reflect"

	"github.com/APIParkLab/APIPark/service/universally"
	"github.com/eolinker/go-common/autowire"
)

type IAPIService interface {
	universally.IServiceGet[API]
	universally.IServiceCreate[Create]
	universally.IServiceEdit[Edit]
	universally.IServiceDelete
	CountMapByProvider(ctx context.Context, keyword string, conditions map[string]interface{}) (map[string]int64, error)

	//ListByServices(ctx context.Context, serviceIds ...string) ([]*API, error)
}

func init() {
	autowire.Auto[IAPIService](func() reflect.Value {
		return reflect.ValueOf(new(imlAPIService))
	})
}
