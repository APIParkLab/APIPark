package strategy_filter

import (
	"context"
	"fmt"
	"regexp"
	"strings"

	"github.com/eolinker/eosc"

	strategy_dto "github.com/APIParkLab/APIPark/module/strategy/dto"
)

var (
	filterHandler = NewHandler()
)

type Option struct {
	Name    string
	Title   string
	Type    string
	Pattern *regexp.Regexp
	Options []string
}

const (
	TypeRemote  = "remote"
	TypePattern = "pattern"
	TypeStatic  = "static"

	ValuesALL = "ALL"

	ScopeGlobal  = "global"
	ScopeTeam    = "team"
	ScopeService = "service"
)

const (
	HttpALL = "ALL"
)

func CheckFilters(name string, scope strategy_dto.Scope, filters []*strategy_dto.Filter) error {
	fs, ok := filterHandler.Options(scope.String())
	if !ok {
		return fmt.Errorf("unknown scope %s", scope)
	}
	filterNameSet := make(map[string]struct{})
	for _, filter := range filters {
		op, ok := fs[filter.Name]
		if !ok {
			return fmt.Errorf("%s filter %s not found", name, filter.Name)
		}
		for _, value := range filter.Values {
			if op.Pattern != nil && !op.Pattern.MatchString(value) {
				return fmt.Errorf("%s filter %s value %s not match pattern", name, filter.Name, value)
			}
		}

		if len(filter.Values) == 0 {
			return fmt.Errorf("%s.Options can't be null. filter.Name:%s ", name, filter.Name)
		}

		if _, has := filterNameSet[filter.Name]; has {
			return fmt.Errorf("%s.Name %s is reduplicative. ", name, filter.Name)
		}
		filterNameSet[filter.Name] = struct{}{}
	}

	return nil
}

type OptionTitle struct {
	Field string `json:"field"`
	Title string `json:"title" aoi18n:""`
}

type IRemoteFilter interface {
	IFilter
	Titles() []OptionTitle
	Key() string
	Target() string
	RemoteList(ctx context.Context, keyword string, condition map[string]interface{}, page int, pageSize int) ([]any, int64, error)
}

type IFilter interface {
	Name() string
	Title() string
	Labels(values ...string) []string
	Type() string
	Scopes() []string
	Option() *Option
}

type IFilterHandler interface {
	RemoteFilter(name string) (IRemoteFilter, bool)
	Options(scope string) (map[string]*Option, bool)
	FilterLabel(name string, values []string) (*Info, error)
}

type Info struct {
	Title string
	Label string
}

type ScopeFilterOption eosc.Untyped[string, *Option]

type Handler struct {
	filters       eosc.Untyped[string, IFilter]
	remoteFilters eosc.Untyped[string, IRemoteFilter]
	options       eosc.Untyped[string, ScopeFilterOption]
}

func NewHandler() *Handler {
	return &Handler{
		filters:       eosc.BuildUntyped[string, IFilter](),
		remoteFilters: eosc.BuildUntyped[string, IRemoteFilter](),
		options:       eosc.BuildUntyped[string, ScopeFilterOption](),
	}
}

func (f *Handler) RemoteFilter(name string) (IRemoteFilter, bool) {
	return f.remoteFilters.Get(name)
}

func (f *Handler) RegisterRemoteFilter(filter IRemoteFilter) {
	f.remoteFilters.Set(filter.Name(), filter)
	f.setScopes(filter)
}

func (f *Handler) RegisterFilter(filter IFilter) {
	f.filters.Set(filter.Name(), filter)
	f.setScopes(filter)
}

func (f *Handler) setScopes(filter IFilter) {
	for _, scope := range filter.Scopes() {
		tmp, has := f.options.Get(scope)
		if !has {
			tmp = eosc.BuildUntyped[string, *Option]()
			f.options.Set(scope, tmp)
		}
		tmp.Set(filter.Name(), filter.Option())
	}
}

func (f *Handler) Options(scope string) (map[string]*Option, bool) {
	options, has := f.options.Get(scope)
	if !has {
		return nil, false
	}
	return options.All(), true
}

func (f *Handler) FilterLabel(name string, values []string) (*Info, error) {
	if tmp, has := f.remoteFilters.Get(name); has {
		return &Info{
			Title: tmp.Title(),
			Label: strings.Join(tmp.Labels(values...), ","),
		}, nil
	}
	if tmp, has := f.filters.Get(name); has {
		return &Info{
			Title: tmp.Title(),
			Label: strings.Join(tmp.Labels(values...), ","),
		}, nil
	}
	return nil, fmt.Errorf("filter %s not found", name)
}

func RegisterRemoteFilter(filter IRemoteFilter) {
	filterHandler.RegisterRemoteFilter(filter)
}

func RemoteFilter(name string) (IRemoteFilter, bool) {
	return filterHandler.RemoteFilter(name)
}

func Options(scope string) (map[string]*Option, bool) {
	return filterHandler.Options(scope)
}

func FilterLabel(name string, values []string) (*Info, error) {
	return filterHandler.FilterLabel(name, values)
}

func FilterGet(name string) (IFilter, bool) {
	f, has := filterHandler.remoteFilters.Get(name)
	if has {
		return f, true
	}
	return filterHandler.filters.Get(name)
}
