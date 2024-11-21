package strategy

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/eolinker/go-common/store"

	"github.com/APIParkLab/APIPark/service/universally/commit"

	"github.com/eolinker/go-common/utils"

	"github.com/google/uuid"

	strategy_driver "github.com/APIParkLab/APIPark/module/strategy/driver"

	strategy_dto "github.com/APIParkLab/APIPark/module/strategy/dto"

	"github.com/APIParkLab/APIPark/service/strategy"
)

var _ IStrategyModule = (*imlStrategyModule)(nil)

type imlStrategyModule struct {
	strategyService strategy.IStrategyService `autowired:""`
	transaction     store.ITransaction        `autowired:""`
}

func (i *imlStrategyModule) Search(ctx context.Context, keyword string, driver string, scope strategy_dto.Scope, target string, page int, pageSize int, filters []string, order ...string) ([]*strategy_dto.StrategyItem, int64, error) {
	list, total, err := i.strategyService.Search(ctx, keyword, driver, scope.Int(), target, page, pageSize, filters, order...)
	if err != nil {
		return nil, 0, err
	}
	strategyIds := utils.SliceToSlice(list, func(l *strategy.Strategy) string { return l.Id })
	commits, err := i.strategyService.ListLatestStrategyCommit(ctx, scope.String(), target, strategyIds...)
	if err != nil {
		return nil, 0, err
	}
	commitMap := utils.SliceToMapO(commits, func(c *commit.Commit[strategy.StrategyCommit]) (string, string) { return c.Key, c.Data.Version })
	items := make([]*strategy_dto.StrategyItem, 0, len(list))
	for _, l := range list {
		item := strategy_dto.ToStrategyItem(l, commitMap[l.Id])
		items = append(items, item)
	}
	return items, total, nil
}

func (i *imlStrategyModule) Get(ctx context.Context, id string) (*strategy_dto.Strategy, error) {
	info, err := i.strategyService.Get(ctx, id)
	if err != nil {
		return nil, err
	}
	return strategy_dto.ToStrategy(info), nil
}

func (i *imlStrategyModule) Create(ctx context.Context, input *strategy_dto.Create) error {
	if input.Name == "" {
		return fmt.Errorf("name required")
	}
	if input.ID == "" {
		input.ID = uuid.NewString()
	}

	if input.Priority < 1 {
		input.Priority = 1000
	}
	err := strategy_driver.CheckFilters(input.Driver, input.Scope, input.Filters)
	if err != nil {
		return err
	}

	err = strategy_driver.CheckConfig(input.Driver, input.Config)
	if err != nil {
		return err
	}
	filters, _ := json.Marshal(input.Filters)
	cfg, _ := json.Marshal(input.Config)
	return i.strategyService.Create(ctx, &strategy.Create{
		Id:       input.ID,
		Name:     input.Name,
		Priority: input.Priority,
		Desc:     input.Desc,
		Filters:  string(filters),
		Config:   string(cfg),
		Scope:    input.Scope.Int(),
		Target:   input.Target,
		Driver:   input.Driver,
	})
}

func (i *imlStrategyModule) Edit(ctx context.Context, id string, input *strategy_dto.Edit) error {
	if input.Name != nil && *input.Name == "" {
		return fmt.Errorf("name required")
	}
	info, err := i.strategyService.Get(ctx, id)
	if err != nil {
		return err
	}
	if input.Priority != nil && *input.Priority < 1 {
		*input.Priority = 1000
	}
	filters := info.Filters
	if input.Filters != nil {
		err = strategy_driver.CheckFilters(info.Driver, strategy_dto.Scope(info.Scope), *input.Filters)
		if err != nil {
			return err
		}
		data, _ := json.Marshal(input.Filters)
		filters = string(data)
	}
	cfg := info.Config
	if input.Config != nil {
		err = strategy_driver.CheckConfig(info.Driver, input.Config)
		if err != nil {
			return err
		}
		data, _ := json.Marshal(input.Config)
		cfg = string(data)
	}

	return i.strategyService.Save(ctx, id, &strategy.Edit{
		Name:     input.Name,
		Priority: input.Priority,
		Desc:     input.Desc,
		Filters:  &filters,
		Config:   &cfg,
	})
}

func (i *imlStrategyModule) Enable(ctx context.Context, id string) error {
	stop := false
	return i.strategyService.Save(ctx, id, &strategy.Edit{IsStop: &stop})
}

func (i *imlStrategyModule) Disable(ctx context.Context, id string) error {
	stop := true
	return i.strategyService.Save(ctx, id, &strategy.Edit{IsStop: &stop})
}

func (i *imlStrategyModule) Publish(ctx context.Context, scope string, target string) error {
	list, err := i.strategyService.AllByScope(ctx, strategy_dto.ToScope(scope).Int(), target)
	if err != nil {
		return err
	}
	return i.transaction.Transaction(ctx, func(txCtx context.Context) error {
		for _, l := range list {
			if l.IsDelete {
				err = i.strategyService.Delete(ctx, l.Id)
				if err != nil {
					return err
				}
			}

			// TODO:同步到网关
			err = i.strategyService.CommitStrategy(txCtx, scope, target, l.Id, l)
			if err != nil {
				return err
			}
		}
		return nil
	})
}

func (i *imlStrategyModule) Delete(ctx context.Context, id string) error {
	return i.strategyService.SortDelete(ctx, id)
}
