package strategy_driver

import (
	"fmt"
	"regexp"

	strategy_dto "github.com/APIParkLab/APIPark/module/strategy/dto"
)

type FilterOptionsItem struct {
	Name    string
	Title   string
	Type    string
	Pattern *regexp.Regexp
	Options []string
}

const (
	FilterMethod      = "method"
	FilterPath        = "path"
	FilterIP          = "ip"
	FilterApplication = "application"
	FilterApi         = "api"
	FilterService     = "service"
	FilterAppKey      = "appkey"

	FilterTypeRemote  = "remote"
	FilterTypePattern = "pattern"
	FilterTypeStatic  = "static"

	FilterValuesALL = "ALL"
)

const (
	ApiPathRegexp = `^\*?[\w-/]+\*?$`
	CIDRIpv4Exp   = `^(?:(?:[0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}(?:[0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(\/([1-9]|[1-2]\d|3[0-2]))?$`
)

const (
	HttpALL     = "ALL"
	HttpGET     = "GET"
	HttpPOST    = "POST"
	HttpPUT     = "PUT"
	HttpDELETE  = "DELETE"
	HttpPATCH   = "PATCH"
	HttpHEADER  = "HEADER"
	HttpOPTIONS = "OPTIONS"
)

var (
	staticOptions = []*FilterOptionsItem{
		{
			Name:    FilterMethod,
			Title:   "API请求方式",
			Type:    FilterTypeStatic,
			Options: []string{HttpALL, HttpGET, HttpPOST, HttpPUT, HttpDELETE, HttpPATCH, HttpHEADER, HttpOPTIONS},
		}, {
			Name:    FilterPath,
			Title:   "API路径",
			Type:    FilterTypePattern,
			Pattern: regexp.MustCompile(ApiPathRegexp),
		}, {
			Name:    FilterIP,
			Title:   "IP",
			Type:    FilterTypePattern,
			Pattern: regexp.MustCompile(CIDRIpv4Exp),
		},
	}
	globalFilters  = map[string]struct{}{}
	serviceFilters = map[string]struct{}{}
)

func init() {
	for _, option := range staticOptions {
		globalFilters[option.Name] = struct{}{}
	}
	for _, option := range staticOptions {
		serviceFilters[option.Name] = struct{}{}
	}
}

func CheckFilters(name string, scope strategy_dto.Scope, filters []*strategy_dto.Filter) error {
	var fs map[string]struct{}
	switch scope.String() {
	case strategy_dto.ScopeSystem:
		fs = globalFilters
	case strategy_dto.ScopeService:
		fs = serviceFilters
	default:
		return fmt.Errorf("unknown scope %s", scope)
	}
	filterNameSet := make(map[string]struct{})
	for _, filter := range filters {
		_, ok := fs[filter.Name]
		if !ok {
			return fmt.Errorf("%s filter %s not found", name, filter.Name)
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

type FilterOptionConfig struct {
	Title  string
	Titles []OptionTitle
	Key    string
}

type IFilterOptionHandler interface {
	Name() string
	Config() FilterOptionConfig
	GetOptions(keyword, conditions map[string]interface{}, pageNum, pageSize int) ([]any, int)
	Labels(values ...string) []string
	Label(value string) string
}

type IFilterFactory interface {
	GetHandler(name string) IFilterOptionHandler
}
