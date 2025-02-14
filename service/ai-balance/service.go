package ai_balance

import (
	"context"
	"reflect"

	"github.com/eolinker/go-common/autowire"

	"github.com/APIParkLab/APIPark/service/universally"
)

type IBalanceService interface {
	universally.IServiceGet[Balance]
	universally.IServiceCreate[Create]
	universally.IServiceEdit[Edit]
	universally.IServiceDelete
	MaxPriority(ctx context.Context) (int, error)
	SortBefore(ctx context.Context, originID string, targetID string) ([]*Balance, error)
	SortAfter(ctx context.Context, originID string, targetID string) ([]*Balance, error)
}

func init() {
	autowire.Auto[IBalanceService](func() reflect.Value {
		return reflect.ValueOf(new(imlBalanceService))
	})
}
