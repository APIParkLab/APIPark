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
}

type IAPIUseService interface {
	SumByApis(ctx context.Context, providerId string, start, end int64, apiIds ...string) ([]*APIUse, error)
	SumByApisPage(ctx context.Context, providerId string, start, end int64, page, pageSize int, order string, apiIds ...string) ([]*APIUse, int64, error)
}

func init() {
	autowire.Auto[IAPIService](func() reflect.Value {
		return reflect.ValueOf(new(imlAPIService))
	})
	autowire.Auto[IAPIUseService](func() reflect.Value {
		return reflect.ValueOf(new(imlAPIUseService))
	})
}
