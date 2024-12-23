package ai

import (
	"context"
	"reflect"

	"github.com/APIParkLab/APIPark/service/universally"
	"github.com/eolinker/go-common/autowire"
)

type IProviderService interface {
	universally.IServiceGet[Provider]
	Save(ctx context.Context, id string, cfg *SetProvider) error
	MaxPriority(ctx context.Context) (int, error)
}

func init() {
	autowire.Auto[IProviderService](func() reflect.Value {
		return reflect.ValueOf(new(imlProviderService))
	})
}
