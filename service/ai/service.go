package ai

import (
	"context"
	"reflect"

	"github.com/APIParkLab/APIPark/service/universally"
	"github.com/eolinker/go-common/autowire"
)

type IProviderService interface {
	universally.IServiceGet[Provider]
	universally.IServiceCreate[CreateProvider]
	universally.IServiceEdit[SetProvider]
	universally.IServiceDelete
	//Save(ctx context.Context, id string, cfg *SetProvider) error
	//MaxPriority(ctx context.Context) (int, error)
	CheckUuidDuplicate(ctx context.Context, uuid string) bool
}

func init() {
	autowire.Auto[IProviderService](func() reflect.Value {
		return reflect.ValueOf(new(imlProviderService))
	})
}
