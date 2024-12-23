package ai_key

import (
	"context"
	"reflect"

	ai_key_dto "github.com/APIParkLab/APIPark/module/ai-key/dto"
	"github.com/eolinker/go-common/autowire"
)

type IKeyModule interface {
	Create(ctx context.Context, providerId string, input *ai_key_dto.Create) error
	Edit(ctx context.Context, providerId string, id string, input *ai_key_dto.Edit) error
	Delete(ctx context.Context, providerId string, id string) error
	Get(ctx context.Context, providerId string, id string) (*ai_key_dto.Key, error)
	List(ctx context.Context, providerId string, keyword string, page, pageSize int) ([]*ai_key_dto.Item, int64, error)
	UpdateKeyStatus(ctx context.Context, providerId string, id string, enable bool) error
	Sort(ctx context.Context, providerId string, input *ai_key_dto.Sort) error
}

func init() {
	autowire.Auto[IKeyModule](func() reflect.Value {
		return reflect.ValueOf(new(imlKeyModule))
	})
}
