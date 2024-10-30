package entity

import (
	"fmt"
	"net/textproto"
	"strings"

	"github.com/APIParkLab/APIPark/common"

	"github.com/APIParkLab/APIPark/common/enum"
	"github.com/APIParkLab/APIPark/gateway"
)

const apintoRestfulRegexp = "([0-9a-zA-Z-_]+)"

type Router struct {
	*BasicInfo
	Listen    int                `json:"listen"`
	Host      []string           `json:"host"`
	Method    []string           `json:"method"`
	Protocols []string           `json:"protocols"`
	Location  string             `json:"location"`
	Rules     []*Rule            `json:"rules"`
	Service   string             `json:"service"`
	Plugins   map[string]*Plugin `json:"plugins"`
	Retry     int                `json:"retry"`
	TimeOut   int                `json:"time_out"`
	Labels    map[string]string  `json:"labels"`
}

type Rule struct {
	Type  string `json:"type"`
	Name  string `json:"name"`
	Value string `json:"value"`
}

type Plugin struct {
	Disable bool        `json:"disable"`
	Config  interface{} `json:"config"`
}

type PluginProxyRewriteV2Config struct {
	PathType    string            `json:"path_type"`
	StaticPath  string            `json:"static_path,omitempty"` //path_type=static启用
	PrefixPath  []*PrefixPath     `json:"prefix_path,omitempty"` //path_type=prefix 启用
	RegexPath   []*RegexPath      `json:"regex_path,omitempty"`  //path_type=regex 启用
	NotMatchErr bool              `json:"not_match_err"`
	HostRewrite bool              `json:"host_rewrite"`
	Host        string            `json:"host,omitempty"`
	Headers     map[string]string `json:"headers"`
}

type RegexPath struct {
	RegexPathMatch   string `json:"regex_path_match"`
	RegexPathReplace string `json:"regex_path_replace"`
}

type PrefixPath struct {
	PrefixPathMatch   string `json:"prefix_path_match"`
	PrefixPathReplace string `json:"prefix_path_replace"`
}

func ToRouter(r *gateway.ApiRelease, version string, matches map[string]string) *Router {
	headers := make(map[string]string)
	for _, h := range r.ProxyHeaders {
		key := textproto.CanonicalMIMEHeaderKey(h.Key)
		switch h.Opt {
		case enum.HeaderOptTypeAdd:
			headers[key] = h.Value
		case enum.HeaderOptTypeDelete:
			headers[key] = ""
		}
	}
	rewritePlugin := PluginProxyRewriteV2Config{
		NotMatchErr: true,
		HostRewrite: false,
		Headers:     headers,
	}
	//若请求路径包含restful参数
	if common.IsRestfulPath(r.Path) {
		rewritePlugin.PathType = "regex" //正则替换

		//如果转发路径包含restful参数
		if common.IsRestfulPath(r.ProxyPath) {
			r.ProxyPath = formatProxyPath(r.Path, r.ProxyPath)
		}
		rewritePlugin.RegexPath = []*RegexPath{
			{
				RegexPathMatch:   fmt.Sprintf("^%s$", common.ReplaceRestfulPath(r.Path, apintoRestfulRegexp)),
				RegexPathReplace: r.ProxyPath,
			},
		}
		r.Path = fmt.Sprintf("~=^%s$", common.ReplaceRestfulPath(r.Path, apintoRestfulRegexp))
	} else {
		rewritePlugin.PathType = "prefix" //前缀替换
		rewritePlugin.PrefixPath = []*PrefixPath{
			{
				PrefixPathMatch:   strings.TrimSuffix(r.Path, "*"),
				PrefixPathReplace: r.ProxyPath,
			},
		}
	}

	rules := make([]*Rule, 0, len(r.Rules))
	for _, m := range r.Rules {
		rule := &Rule{
			Type:  m.Position,
			Name:  m.Key,
			Value: "",
		}

		if m.Position == enum.MatchPositionHeader {
			rule.Name = textproto.CanonicalMIMEHeaderKey(rule.Name)
		}

		switch m.MatchType {
		case enum.MatchTypeEqual:
			rule.Value = m.Pattern
		case enum.MatchTypePrefix:
			rule.Value = fmt.Sprintf("%s*", m.Pattern)
		case enum.MatchTypeSuffix:
			rule.Value = fmt.Sprintf("*%s", m.Pattern)
		case enum.MatchTypeSubstr:
			rule.Value = fmt.Sprintf("*%s*", m.Pattern)
		case enum.MatchTypeUnEqual:
			rule.Value = fmt.Sprintf("!=%s", m.Pattern)
		case enum.MatchTypeNull:
			rule.Value = "$"
		case enum.MatchTypeExist:
			rule.Value = "**"
		case enum.MatchTypeUnExist:
			rule.Value = "!"
		case enum.MatchTypeRegexp:
			rule.Value = fmt.Sprintf("~=%s", m.Pattern)
		case enum.MatchTypeRegexpG:
			rule.Value = fmt.Sprintf("~*=%s", m.Pattern)
		case enum.MatchTypeAny:
			rule.Value = "*"
		}

		rules = append(rules, rule)
	}
	plugin := map[string]*Plugin{
		"proxy_rewrite": {
			Disable: false,
			Config:  rewritePlugin,
		},
	}
	for k, v := range r.Plugins {
		plugin[k] = &Plugin{
			Disable: v.Disable,
			Config:  v.Config,
		}
	}
	hosts := make([]string, 0, len(r.Host))
	if len(r.Host) > 0 {
		hosts = r.Host
	}
	labels := make(map[string]string)
	if r.Labels != nil {
		labels = r.Labels
	}

	return &Router{
		BasicInfo: &BasicInfo{
			ID:          fmt.Sprintf("%s@router", r.ID),
			Name:        r.ID,
			Description: r.Description,
			Driver:      "http",
			Version:     version,
			Matches:     matches,
		},
		Host:      hosts,
		Method:    r.Methods,
		Location:  r.Path,
		Rules:     rules,
		Service:   fmt.Sprintf("%s@service", r.Service),
		Plugins:   plugin,
		Retry:     r.Retry,
		TimeOut:   r.Timeout,
		Labels:    labels,
		Protocols: []string{"http", "https"},
	}
}

// formatProxyPath 格式化转发路径上，用于转发重写插件正则替换 比如 请求路径 /path/{A}/{B} 原转发路径：/path/{B}  格式化后 新转发路径： /path/$2
func formatProxyPath(requestPath, proxyPath string) string {
	restfulSet := make(map[string]string)
	newProxyPath := proxyPath
	rList := strings.Split(requestPath, "/")
	i := 1
	for _, param := range rList {
		if common.IsRestfulParam(param) {
			restfulSet[param] = fmt.Sprintf("$%d", i)
			i += 1
		}
	}

	for param, order := range restfulSet {
		newProxyPath = strings.ReplaceAll(newProxyPath, param, order)
	}
	return newProxyPath
}
