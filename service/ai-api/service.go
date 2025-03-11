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
	CountMapByModel(ctx context.Context, keyword string, conditions map[string]interface{}) (map[string]int64, error)
	CountByModel(ctx context.Context, model string) (int64, error)
	CountByProvider(ctx context.Context, provider string) (int64, error)
	UpdateAIProvider(ctx context.Context, providerId string, ids ...string) error
	DeleteByService(ctx context.Context, serviceId string) error
}

type IAPIUseService interface {
	SumByApis(ctx context.Context, providerId string, start, end int64, apiIds ...string) ([]*APIUse, error)
	SumByApisPage(ctx context.Context, providerId string, start, end int64, page, pageSize int, order string, apiIds ...string) ([]*APIUse, int64, error)
	Incr(ctx context.Context, incr *IncrAPIUse) error
}

func init() {
	autowire.Auto[IAPIService](func() reflect.Value {
		return reflect.ValueOf(new(imlAPIService))
	})
	autowire.Auto[IAPIUseService](func() reflect.Value {
		return reflect.ValueOf(new(imlAPIUseService))
	})
}
