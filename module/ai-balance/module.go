package ai_balance

import (
	"context"
	"reflect"

	"github.com/eolinker/go-common/autowire"

	ai_balance_dto "github.com/APIParkLab/APIPark/module/ai-balance/dto"
)

type IBalanceModule interface {
	Create(ctx context.Context, input *ai_balance_dto.Create) error
	Sort(ctx context.Context, input *ai_balance_dto.Sort) error
	List(ctx context.Context, keyword string) ([]*ai_balance_dto.Item, error)
	Delete(ctx context.Context, id string) error
}

func init() {
	autowire.Auto[IBalanceModule](func() reflect.Value {
		return reflect.ValueOf(new(imlBalanceModule))
	})
}
