package strategy

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"sort"
	"strconv"
	"time"

	"github.com/eolinker/go-common/utils"

	strategy_filter "github.com/APIParkLab/APIPark/strategy-filter"

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

func (i *imlStrategyController) Restore(ctx *gin.Context, id string) error {
	return i.strategyModule.Restore(ctx, id)
}

func (i *imlStrategyController) DeleteServiceStrategy(ctx *gin.Context, serviceId string, id string) error {
	return i.strategyModule.DeleteServiceStrategy(ctx, serviceId, id)
}

func (i *imlStrategyController) ToPublish(ctx *gin.Context, driver string) ([]*strategy_dto.ToPublishItem, string, string, bool, error) {
	list, err := i.strategyModule.ToPublish(ctx, driver)
	if err != nil {
		return nil, "", "", false, err
	}
	data, _ := json.Marshal(list)
	source := base64.StdEncoding.EncodeToString(data)
	return list, source, time.Now().Format("20060102150405") + "-release", len(list) > 0, nil
}

func (i *imlStrategyController) FilterGlobalRemote(ctx *gin.Context, name string) ([]*strategy_dto.Title, []any, int64, string, string, error) {
	f, has := strategy_filter.RemoteFilter(name)
	if !has {
		return nil, nil, 0, "", "", fmt.Errorf("filter not found: %s", name)
	}
	scopeAllow := false
	for _, s := range f.Scopes() {
		if s == strategy_filter.ScopeGlobal {
			scopeAllow = true
			break
		}
	}
	if !scopeAllow {
		return nil, nil, 0, "", "", fmt.Errorf("scope not allowed: %s", name)
	}

	list, total, err := f.RemoteList(ctx, "", nil, -1, -1)
	if err != nil {
		return nil, nil, 0, "", "", err
	}
	return utils.SliceToSlice(f.Titles(), func(l strategy_filter.OptionTitle) *strategy_dto.Title {
		return &strategy_dto.Title{
			Field: l.Field,
			Title: l.Title,
		}
	}), list, total, f.Key(), f.Key(), nil
}

func (i *imlStrategyController) FilterServiceRemote(ctx *gin.Context, serviceId string, name string) ([]*strategy_dto.Title, []any, int64, string, string, error) {
	f, has := strategy_filter.RemoteFilter(name)
	if !has {
		return nil, nil, 0, "", "", fmt.Errorf("filter not found: %s", name)
	}
	scopeAllow := false
	for _, s := range f.Scopes() {
		if s == strategy_filter.ScopeService {
			scopeAllow = true
			break
		}
	}
	if !scopeAllow {
		return nil, nil, 0, "", "", fmt.Errorf("scope not allowed: %s", name)
	}
	list, total, err := f.RemoteList(ctx, "", map[string]interface{}{"service": serviceId}, -1, -1)
	if err != nil {
		return nil, nil, 0, "", "", err
	}
	return utils.SliceToSlice(f.Titles(), func(l strategy_filter.OptionTitle) *strategy_dto.Title {
		return &strategy_dto.Title{
			Field: l.Field,
			Title: l.Title,
		}
	}), list, total, f.Key(), "list", nil

}

func (i *imlStrategyController) filterOptions(ctx *gin.Context, scope string) ([]*strategy_dto.FilterOption, error) {
	m, has := strategy_filter.Options(scope)
	if !has {
		return nil, fmt.Errorf("scope not found: %s", scope)
	}

	list := utils.MapToSlice(m, func(key string, value *strategy_filter.Option) *strategy_dto.FilterOption {
		pattern := ""
		if value.Pattern != nil {
			pattern = value.Pattern.String()
		}
		return &strategy_dto.FilterOption{
			Name:    value.Name,
			Title:   value.Title,
			Type:    value.Type,
			Pattern: pattern,
			Options: value.Options,
		}
	})
	sort.Slice(list, func(i, j int) bool {
		return list[i].Name < list[j].Name
	})
	return list, nil
}

func (i *imlStrategyController) FilterServiceOptions(ctx *gin.Context) ([]*strategy_dto.FilterOption, error) {
	return i.filterOptions(ctx, strategy_filter.ScopeService)
}

func (i *imlStrategyController) FilterGlobalOptions(ctx *gin.Context) ([]*strategy_dto.FilterOption, error) {
	return i.filterOptions(ctx, strategy_filter.ScopeGlobal)
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

	return i.search(ctx, keyword, strategy_dto.ToScope(strategy_dto.ScopeGlobal), "", driver, page, pageSize, order, sort, filters)
}

func (i *imlStrategyController) CreateGlobalStrategy(ctx *gin.Context, driver string, input *strategy_dto.Create) error {
	input.Driver = driver
	input.Scope = strategy_dto.ToScope(strategy_dto.ScopeGlobal)

	return i.strategyModule.Create(ctx, input)
}

func (i *imlStrategyController) PublishGlobalStrategy(ctx *gin.Context, driver string) error {
	return i.strategyModule.Publish(ctx, driver, strategy_dto.ScopeGlobal, "")
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
	return i.strategyModule.Edit(ctx, id, input)
}

func (i *imlStrategyController) EnableStrategy(ctx *gin.Context, id string) error {
	return i.strategyModule.Enable(ctx, id)
}

func (i *imlStrategyController) DisableStrategy(ctx *gin.Context, id string) error {
	return i.strategyModule.Disable(ctx, id)
}

func (i *imlStrategyController) DeleteStrategy(ctx *gin.Context, id string) error {
	return i.strategyModule.Delete(ctx, id)
}

func genTime(t string, defaultValue time.Time) (time.Time, error) {
	if t == "" {
		return defaultValue, nil
	}

	s, err := strconv.ParseInt(t, 10, 64)
	if err != nil {
		return time.Time{}, err
	}
	return time.Unix(s, 0), nil
}

func (i *imlStrategyController) GetStrategyLogs(ctx *gin.Context, keyword string, strategyId string, start string, end string, limit string, offset string) ([]*strategy_dto.LogItem, int64, error) {
	now := time.Now()

	s, err := genTime(start, now.Add(-time.Hour*24*30))
	if err != nil {
		return nil, 0, fmt.Errorf("start time error: %s", err)
	}
	e, err := genTime(end, now)
	if err != nil {

		return nil, 0, fmt.Errorf("end time error: %s", err)
	}
	if s.After(e) {
		return nil, 0, fmt.Errorf("start time must be less than end time")
	}
	l, err := strconv.ParseInt(limit, 10, 64)
	if err != nil && limit != "" {

		return nil, 0, err
	}
	o, err := strconv.ParseInt(offset, 10, 64)
	if err != nil && offset != "" {
		return nil, 0, err
	}
	if l < 1 {
		l = 15
	}
	if o < 1 {
		o = 1
	}
	return i.strategyModule.GetStrategyLogs(ctx, keyword, strategyId, s, e, l, o)
}

func (i *imlStrategyController) LogInfo(ctx *gin.Context, id string) (*strategy_dto.LogInfo, error) {

	return i.strategyModule.StrategyLogInfo(ctx, id)
}
