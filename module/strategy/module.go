package strategy

import (
	"context"
	"reflect"
	"time"

	"github.com/APIParkLab/APIPark/gateway"

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
	Publish(ctx context.Context, driver string, scope string, target string) error
	Delete(ctx context.Context, id string) error
	ToPublish(ctx context.Context, driver string) ([]*strategy_dto.ToPublishItem, error)
	Restore(ctx context.Context, id string) error

	DeleteServiceStrategy(ctx context.Context, serviceId string, id string) error

	StrategyLogInfo(ctx context.Context, id string) (*strategy_dto.LogInfo, error)
	GetStrategyLogs(ctx context.Context, keyword string, strategyID string, start time.Time, end time.Time, limit int64, offset int64) ([]*strategy_dto.LogItem, int64, error)
}

func init() {
	strategyModule := new(imlStrategyModule)
	autowire.Auto[IStrategyModule](func() reflect.Value {
		gateway.RegisterInitHandleFunc(strategyModule.initGateway)
		return reflect.ValueOf(strategyModule)
	})
}
