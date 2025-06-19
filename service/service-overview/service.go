package service_overview

import (
	"context"
	"reflect"

	"github.com/eolinker/go-common/autowire"
)

type IOverviewService interface {
	Update(ctx context.Context, serviceId string, update *Update) error
	List(ctx context.Context, serviceIds ...string) ([]*Overview, error)
	Map(ctx context.Context, serviceIds ...string) (map[string]*Overview, error)
}

func init() {
	autowire.Auto[IOverviewService](func() reflect.Value {
		return reflect.ValueOf(new(imlOverviewService))
	})
}
