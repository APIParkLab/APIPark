package service_model_mapping

import (
	"context"
	"reflect"

	"github.com/eolinker/go-common/autowire"
)

type IServiceModelMappingService interface {
	Get(ctx context.Context, sid string) (*ModelMapping, error)
	Save(ctx context.Context, input *Save) error
}

func init() {
	autowire.Auto[IServiceModelMappingService](func() reflect.Value {
		return reflect.ValueOf(new(imlServiceModelMappingService))
	})
}
