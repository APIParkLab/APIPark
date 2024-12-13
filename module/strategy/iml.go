package strategy

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"sort"
	"strings"
	"time"

	"github.com/APIParkLab/APIPark/service/service"

	"github.com/eolinker/go-common/auto"

	"github.com/APIParkLab/APIPark/service/cluster"

	"github.com/APIParkLab/APIPark/gateway"
	"github.com/eolinker/eosc"

	log2 "github.com/APIParkLab/APIPark/service/log"
	"github.com/eolinker/eosc/log"
	"gorm.io/gorm"

	strategy_filter "github.com/APIParkLab/APIPark/strategy-filter"

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
	appService      service.IServiceService   `autowired:""`
	logService      log2.ILogService          `autowired:""`
	clusterService  cluster.IClusterService   `autowired:""`
	transaction     store.ITransaction        `autowired:""`
}

func (i *imlStrategyModule) StrategyLogInfo(ctx context.Context, id string) (*strategy_dto.LogInfo, error) {
	c, err := i.clusterService.Get(ctx, cluster.DefaultClusterID)
	if err != nil {
		return nil, fmt.Errorf("cluster %s not found", cluster.DefaultClusterID)
	}

	info, err := i.logService.LogInfo(ctx, "loki", c.Cluster, id)
	if err != nil {
		return nil, err
	}
	return &strategy_dto.LogInfo{
		ID:                info.ID,
		ContentType:       info.ContentType,
		ProxyResponseBody: info.ProxyResponseBody,
		ResponseBody:      info.ResponseBody,
	}, nil
}

func (i *imlStrategyModule) GetStrategyLogs(ctx context.Context, keyword string, strategyID string, start time.Time, end time.Time, limit int64, offset int64) ([]*strategy_dto.LogItem, int64, error) {
	if strategyID == "" {
		return nil, 0, errors.New("strategy id required")
	}
	conditions := map[string]string{
		"strategy": strategyID,
	}
	if keyword != "" {
		// 查询符合条件的应用ID
		apps, err := i.appService.Search(ctx, keyword, map[string]interface{}{
			"as_app": true,
		})
		if err != nil {
			return nil, 0, err
		}
		orCondition := fmt.Sprintf("request_uri =~ \".*%s.*\"", keyword)
		if len(apps) > 0 {
			appIds := utils.SliceToSlice(apps, func(a *service.Service) string { return a.Id })
			orCondition = fmt.Sprintf("%s or application =~ \"%s\"", orCondition, strings.Join(appIds, "|"))
		}
		conditions["#1"] = orCondition
	}

	c, err := i.clusterService.Get(ctx, cluster.DefaultClusterID)
	if err != nil {
		return nil, 0, fmt.Errorf("cluster %s not found", cluster.DefaultClusterID)
	}
	items, total, err := i.logService.Logs(ctx, "loki", c.Cluster, conditions, start, end, limit, offset)
	if err != nil {
		return nil, 0, err
	}
	result := make([]*strategy_dto.LogItem, 0, len(items))
	for _, item := range items {
		result = append(result, &strategy_dto.LogItem{
			ID:            item.ID,
			Service:       auto.UUID(item.Service),
			Method:        item.Method,
			Url:           item.Url,
			RemoteIP:      item.RemoteIP,
			Consumer:      auto.UUID(item.Consumer),
			Authorization: auto.UUID(item.Authorization),
			RecordTime:    auto.TimeLabel(item.RecordTime),
		})
	}
	return result, total, nil
}

func (i *imlStrategyModule) Restore(ctx context.Context, id string) error {
	return i.strategyService.Restore(ctx, id)
}

func (i *imlStrategyModule) DeleteServiceStrategy(ctx context.Context, serviceId string, id string) error {
	_, err := i.strategyService.LatestStrategyCommit(ctx, strategy_dto.ScopeService, serviceId, id)
	if err != nil {
		// 判断是否已经发布，如果未发布则直接删除
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return err
		}
		return i.strategyService.Delete(ctx, id)
	}
	return i.strategyService.SortDelete(ctx, id)
}

func (i *imlStrategyModule) ToPublish(ctx context.Context, driver string) ([]*strategy_dto.ToPublishItem, error) {
	scope := strategy_dto.ToScope(strategy_dto.ScopeGlobal)
	list, err := i.strategyService.SearchAllByDriver(ctx, "", driver, scope.Int(), "")
	if err != nil {
		return nil, err
	}
	strategyIds := utils.SliceToSlice(list, func(l *strategy.Strategy) string { return l.Id })
	commits, err := i.strategyService.ListLatestStrategyCommit(ctx, scope.String(), "", strategyIds...)
	if err != nil {
		return nil, err
	}
	commitMap := utils.SliceToMapO(commits, func(c *commit.Commit[strategy.Commit]) (string, string) { return c.Data.Id, c.Data.Version })
	items := make([]*strategy_dto.ToPublishItem, 0, len(list))
	for _, l := range list {
		status := strategy_dto.StrategyStatus(l, commitMap[l.Id])
		if status == strategy_dto.PublishStatusOnline {
			continue
		}
		items = append(items, &strategy_dto.ToPublishItem{
			Name:     l.Name,
			Priority: l.Priority,
			Status:   status,
			OptTime:  l.UpdateAt,
		})
	}
	sort.Slice(items, func(i, j int) bool {
		return items[i].Priority < items[j].Priority
	})
	return items, nil
}

func (i *imlStrategyModule) Search(ctx context.Context, keyword string, driver string, scope strategy_dto.Scope, target string, page int, pageSize int, filters []string, order ...string) ([]*strategy_dto.StrategyItem, int64, error) {
	list, total, err := i.strategyService.SearchByDriver(ctx, keyword, driver, scope.Int(), target, page, pageSize, filters, order...)
	if err != nil {
		return nil, 0, err
	}
	if len(list) < 1 {
		return nil, 0, nil
	}
	strategyIds := utils.SliceToSlice(list, func(l *strategy.Strategy) string { return l.Id })
	commits, err := i.strategyService.ListLatestStrategyCommit(ctx, scope.String(), target, strategyIds...)
	if err != nil {
		return nil, 0, err
	}
	commitMap := utils.SliceToMapO(commits, func(c *commit.Commit[strategy.Commit]) (string, string) { return c.Data.Id, c.Data.Version })
	items := make([]*strategy_dto.StrategyItem, 0, len(list))
	countMap := make(map[string]int64)
	c, err := i.clusterService.Get(ctx, cluster.DefaultClusterID)
	if err == nil {
		countMap, err = i.logService.LogCount(ctx, "loki", c.Cluster, map[string]string{
			"#1": fmt.Sprintf("strategy =~ \"%s\"", strings.Join(strategyIds, "|")),
		}, 720,
			"strategy")
		if err != nil {
			log.Errorf("get log count error: %v", err)
		}
	}

	for _, l := range list {
		fs := make([]*strategy_dto.Filter, 0)

		json.Unmarshal([]byte(l.Filters), &fs)
		filterList := make([]string, 0, len(fs))
		for _, f := range fs {
			info, err := strategy_filter.FilterLabel(f.Name, f.Values)
			if err != nil {
				log.Errorf("get filter label error: %v", err)
				continue
			}
			filterList = append(filterList, fmt.Sprintf("[%s:%s]", info.Title, info.Label))
		}
		item := strategy_dto.ToStrategyItem(l, commitMap[l.Id], strings.Join(filterList, ";"), countMap[l.Id])
		items = append(items, item)
	}
	sort.Slice(items, func(i, j int) bool {
		return items[i].Priority < items[j].Priority
	})
	return items, total, nil
}

func (i *imlStrategyModule) Get(ctx context.Context, id string) (*strategy_dto.Strategy, error) {
	info, err := i.strategyService.Get(ctx, id)
	if err != nil {
		return nil, err
	}
	s := strategy_dto.ToStrategy(info)
	for _, f := range s.Filters {
		ff, has := strategy_filter.FilterGet(f.Name)
		if !has {
			return nil, fmt.Errorf("filter not found: %s", f.Name)
		}
		f.Title = ff.Title()
		f.Type = ff.Type()
		f.Label = strings.Join(ff.Labels(f.Values...), ",")
	}
	return s, nil
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
	err := strategy_filter.CheckFilters(input.Driver, input.Scope, input.Filters)
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
		err = strategy_filter.CheckFilters(info.Driver, strategy_dto.Scope(info.Scope), *input.Filters)
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

func (i *imlStrategyModule) Publish(ctx context.Context, driver string, scope string, target string) error {
	d, has := strategy_driver.GetDriver(driver)
	if !has {
		return fmt.Errorf("driver not found: %s", driver)
	}
	list, err := i.strategyService.AllByDriver(ctx, driver, strategy_dto.ToScope(scope).Int(), target)
	if err != nil {
		return err
	}

	return i.transaction.Transaction(ctx, func(txCtx context.Context) error {
		publishStrategies := make([]*eosc.Base[gateway.StrategyRelease], 0, len(list))
		for _, l := range list {
			if l.IsDelete {
				err = i.strategyService.Delete(ctx, l.Id)
				if err != nil {
					return err
				}
			}
			publishStrategies = append(publishStrategies, d.ToRelease(strategy_dto.ToStrategy(l), nil, 5000))

			err = i.strategyService.CommitStrategy(txCtx, scope, target, l.Id, l)
			if err != nil {
				return err
			}
		}
		client, err := i.clusterService.GatewayClient(ctx, cluster.DefaultClusterID)
		if err != nil {
			return err
		}
		defer func() {
			_ = client.Close(ctx)
		}()
		return client.Strategy().Online(ctx, publishStrategies...)
	})
}

func (i *imlStrategyModule) Delete(ctx context.Context, id string) error {
	_, err := i.strategyService.LatestStrategyCommit(ctx, strategy_dto.ScopeGlobal, "", id)
	if err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return nil
		}
		return i.strategyService.Delete(ctx, id)
	}
	return i.strategyService.SortDelete(ctx, id)
}

func (i *imlStrategyModule) initGateway(ctx context.Context, clusterId string, clientDriver gateway.IClientDriver) error {
	commits, err := i.strategyService.ListLatestStrategyCommit(ctx, strategy_dto.ScopeGlobal, "")
	if err != nil {
		return err
	}
	publishStrategies := make([]*eosc.Base[gateway.StrategyRelease], 0, len(commits))
	for _, c := range commits {
		l := c.Data
		if l.IsDelete {
			err = i.strategyService.Delete(ctx, l.Id)
			if err != nil {
				return err
			}
		}
		d, has := strategy_driver.GetDriver(l.Driver)
		if !has {
			continue
		}
		publishStrategies = append(publishStrategies, d.ToRelease(strategy_dto.ToStrategy(&strategy.Strategy{
			Id:       l.Id,
			Name:     l.Name,
			Priority: l.Priority,
			Filters:  l.Filters,
			Config:   l.Config,
			Driver:   l.Driver,
			IsStop:   l.IsStop,
			IsDelete: l.IsDelete,
		}), nil, 5000))
	}

	return clientDriver.Strategy().Online(ctx, publishStrategies...)
}
