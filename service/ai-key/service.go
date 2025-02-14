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
	CountMapByProvider(ctx context.Context, keyword string, conditions map[string]interface{}) (map[string]int64, error)
	MaxPriority(ctx context.Context, providerId string) (int, error)
	SortBefore(ctx context.Context, provider string, originID string, targetID string) ([]*Key, error)
	SortAfter(ctx context.Context, provider string, originID string, targetID string) ([]*Key, error)
	KeysAfterPriority(ctx context.Context, providerId string, priority int) ([]*Key, error)
	SearchUnExpiredByPage(ctx context.Context, w map[string]interface{}, page, pageSize int, order string) ([]*Key, int64, error)
	IncrUseToken(ctx context.Context, id string, useToken int) error
}

func init() {
	autowire.Auto[IKeyService](func() reflect.Value {
		return reflect.ValueOf(new(imlAIKeyService))
	})
}
