package strategy

import (
	"context"
	"reflect"

	"github.com/eolinker/go-common/autowire"

	_ "github.com/APIParkLab/APIPark/module/strategy/driver/data-masking"
	strategy_dto "github.com/APIParkLab/APIPark/module/strategy/dto"
)

type IStrategyModule interface {
	Search(ctx context.Context, keyword string, driver string, scope strategy_dto.Scope, target string, page int, pageSize int, filters []string, order ...string) ([]*strategy_dto.StrategyItem, int64, error)
	Get(ctx context.Context, id string) (*strategy_dto.Strategy, error)
	Create(ctx context.Context, i *strategy_dto.Create) error
	Edit(ctx context.Context, id string, i *strategy_dto.Edit) error
	Enable(ctx context.Context, id string) error
	Disable(ctx context.Context, id string) error
	Publish(ctx context.Context, scope string, target string) error
	Delete(ctx context.Context, id string) error
}

func init() {
	strategyModule := new(imlStrategyModule)
	autowire.Auto[IStrategyModule](func() reflect.Value {
		return reflect.ValueOf(strategyModule)
	})
}
