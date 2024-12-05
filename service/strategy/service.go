package strategy

import (
	"context"
	"reflect"

	"github.com/APIParkLab/APIPark/service/universally/commit"

	"github.com/eolinker/go-common/autowire"

	"github.com/APIParkLab/APIPark/service/universally"
)

type IStrategyService interface {
	universally.IServiceCreate[Create]
	universally.IServiceEdit[Edit]
	All(ctx context.Context, scope int, target string) ([]*Strategy, error)
	AllByDriver(ctx context.Context, driver string, scope int, target string) ([]*Strategy, error)
	SearchByDriver(ctx context.Context, keyword string, driver string, scope int, target string, page int, pageSize int, filters []string, order ...string) ([]*Strategy, int64, error)
	SearchAllByDriver(ctx context.Context, keyword string, driver string, scope int, target string) ([]*Strategy, error)
	Get(ctx context.Context, id string) (*Strategy, error)
	SortDelete(ctx context.Context, id string) error
	Delete(ctx context.Context, id ...string) error

	Restore(ctx context.Context, id string) error

	CommitStrategy(ctx context.Context, scope string, target string, strategyId string, data *Strategy) error
	GetStrategyCommit(ctx context.Context, commitId string) (*commit.Commit[Commit], error)
	LatestStrategyCommit(ctx context.Context, scope string, target string, strategyId string) (*commit.Commit[Commit], error)
	ListLatestStrategyCommit(ctx context.Context, scope string, target string, strategyIds ...string) ([]*commit.Commit[Commit], error)
	ListStrategyCommit(ctx context.Context, commitIds ...string) ([]*commit.Commit[Commit], error)
}

func init() {
	autowire.Auto[IStrategyService](func() reflect.Value {
		return reflect.ValueOf(new(imlStrategyService))
	})
	commit.InitCommitService[Commit]("strategy")
}
