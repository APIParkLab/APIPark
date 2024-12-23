package ai_key

import (
	"context"
	"reflect"

	"github.com/eolinker/go-common/autowire"

	"github.com/APIParkLab/APIPark/service/universally"
)

type IKeyService interface {
	universally.IServiceGet[Key]
	universally.IServiceCreate[Create]
	universally.IServiceEdit[Edit]
	universally.IServiceDelete
	DefaultKey(ctx context.Context, providerId string) (*Key, error)
	KeysByProvider(ctx context.Context, providerId string) ([]*Key, error)
	MaxPriority(ctx context.Context, providerId string) (int, error)
	SortBefore(ctx context.Context, provider string, originID string, targetID string) ([]*Key, error)
	SortAfter(ctx context.Context, provider string, originID string, targetID string) ([]*Key, error)
	KeysAfterPriority(ctx context.Context, providerId string, priority int) ([]*Key, error)
}

func init() {
	autowire.Auto[IKeyService](func() reflect.Value {
		return reflect.ValueOf(new(imlAIKeyService))
	})
}
