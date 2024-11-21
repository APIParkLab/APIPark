package strategy

import (
	"encoding/json"
	"fmt"
	"strconv"

	"github.com/APIParkLab/APIPark/module/service"
	"github.com/APIParkLab/APIPark/module/strategy"
	strategy_dto "github.com/APIParkLab/APIPark/module/strategy/dto"
	"github.com/gin-gonic/gin"
)

var _ IStrategyController = (*imlStrategyController)(nil)

type imlStrategyController struct {
	strategyModule strategy.IStrategyModule `autowired:""`
	serviceModule  service.IServiceModule   `autowired:""`
}

func (i *imlStrategyController) GetStrategy(ctx *gin.Context, id string) (*strategy_dto.Strategy, error) {
	return i.strategyModule.Get(ctx, id)
}

func (i *imlStrategyController) search(ctx *gin.Context, keyword string, scope strategy_dto.Scope, target string, driver string, page string, pageSize string, order string, sort string, filters string) ([]*strategy_dto.StrategyItem, int64, error) {
	p, err := strconv.Atoi(page)
	if err != nil {
		if page != "" {
			return nil, 0, fmt.Errorf("page error: %s", err)
		}
		p = 1
	}
	ps, err := strconv.Atoi(pageSize)
	if err != nil {
		if pageSize != "" {
			return nil, 0, fmt.Errorf("page size error: %s", err)
		}
		ps = 20
	}
	ss := make([]string, 0)
	json.Unmarshal([]byte(sort), &ss)
	fs := make([]string, 0)
	json.Unmarshal([]byte(filters), &fs)
	list, total, err := i.strategyModule.Search(ctx, keyword, driver, scope, target, p, ps, fs, ss...)
	if err != nil {
		return nil, 0, err
	}

	return list, total, nil
}

func (i *imlStrategyController) GlobalStrategyList(ctx *gin.Context, keyword string, driver string, page string, pageSize string, order string, sort string, filters string) ([]*strategy_dto.StrategyItem, int64, error) {

	return i.search(ctx, keyword, strategy_dto.ToScope(strategy_dto.ScopeSystem), "", driver, page, pageSize, order, sort, filters)
}

func (i *imlStrategyController) CreateGlobalStrategy(ctx *gin.Context, driver string, input *strategy_dto.Create) error {
	input.Driver = driver
	input.Scope = strategy_dto.ToScope(strategy_dto.ScopeSystem)

	return i.strategyModule.Create(ctx, input)
}

func (i *imlStrategyController) PublishGlobalStrategy(ctx *gin.Context) error {
	return i.strategyModule.Publish(ctx, strategy_dto.ScopeSystem, "")
}

func (i *imlStrategyController) ServiceStrategyList(ctx *gin.Context, keyword string, serviceId string, driver string, page string, pageSize string, order string, sort string, filters string) ([]*strategy_dto.StrategyItem, int64, error) {

	return i.search(ctx, keyword, strategy_dto.ToScope(strategy_dto.ScopeService), serviceId, driver, page, pageSize, order, sort, filters)
}

func (i *imlStrategyController) CreateServiceStrategy(ctx *gin.Context, serviceId string, driver string, input *strategy_dto.Create) error {
	_, err := i.serviceModule.Get(ctx, serviceId)
	if err != nil {
		return fmt.Errorf("create service strategy error: %s", err)
	}
	input.Driver = driver
	input.Scope = strategy_dto.ToScope(strategy_dto.ScopeService)
	input.Target = serviceId

	return i.strategyModule.Create(ctx, input)
}

func (i *imlStrategyController) EditStrategy(ctx *gin.Context, id string, input *strategy_dto.Edit) error {
	return i.EditStrategy(ctx, id, input)
}

func (i *imlStrategyController) EnableStrategy(ctx *gin.Context, id string) error {
	return i.EnableStrategy(ctx, id)
}

func (i *imlStrategyController) DisableStrategy(ctx *gin.Context, id string) error {
	return i.strategyModule.Disable(ctx, id)
}

func (i *imlStrategyController) DeleteStrategy(ctx *gin.Context, id string) error {
	return i.strategyModule.Delete(ctx, id)
}
