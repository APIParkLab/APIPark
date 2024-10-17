package ai

import (
	"context"
	"github.com/APIParkLab/APIPark/service/universally"
	"github.com/eolinker/go-common/autowire"
	"reflect"
)

type IProviderService interface {
	universally.IServiceGet[Provider]
	Save(ctx context.Context, id string, cfg *SetProvider) error
}

func init() {
	autowire.Auto[IProviderService](func() reflect.Value {
		return reflect.ValueOf(new(imlProviderService))
	})
}
