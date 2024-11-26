package router_dto

import (
	"errors"
	"fmt"
	"strings"

	"github.com/eolinker/go-common/utils"

	"github.com/APIParkLab/APIPark/service/api"
)

var validMethods = map[string]struct{}{
	"GET":     {},
	"POST":    {},
	"PUT":     {},
	"DELETE":  {},
	"PATCH":   {},
	"HEAD":    {},
	"OPTIONS": {},
}

type Create struct {
	Id          string      `json:"id"`
	Name        string      `json:"name"`
	Path        string      `json:"path"`
	Methods     []string    `json:"methods"`
	Description string      `json:"description"`
	Protocols   []string    `json:"protocols"`
	MatchRules  []Match     `json:"match"`
	Upstream    string      `json:"upstream"`
	Proxy       *InputProxy `json:"proxy"`
	Disable     bool        `json:"disable"`
}

type InputProxy struct {
	Path    string                       `json:"path"`
	Timeout int                          `json:"timeout"`
	Retry   int                          `json:"retry"`
	Headers []*Header                    `json:"headers"`
	Extends map[string]any               `json:"extends"`
	Plugins map[string]api.PluginSetting `json:"plugins"`
}
type Match struct {
	Position  string `json:"position"`
	MatchType string `json:"match_type"`
	Key       string `json:"key"`
	Pattern   string `json:"pattern"`
}

func (a *Create) Validate() error {
	if a.Id == "" {
		return errors.New("id is null")
	}
	a.Path = fmt.Sprintf("/%s", strings.TrimPrefix(a.Path, "/"))
	for _, method := range a.Methods {
		if _, ok := validMethods[method]; !ok {
			return fmt.Errorf("method(%s) is invalid", method)
		}
	}

	return nil
}

type Edit struct {
	Description *string     `json:"description"`
	Proxy       *InputProxy `json:"proxy"`
	Path        *string     `json:"path"`
	Methods     *[]string   `json:"methods"`
	Protocols   *[]string   `json:"protocols"`
	MatchRules  *[]Match    `json:"match"`
	Disable     *bool       `json:"disable"`
	Upstream    *string     `json:"upstream"`
}

func ToServiceProxy(proxy *InputProxy) *api.Proxy {
	if proxy == nil {
		return &api.Proxy{}
	}
	headers := utils.SliceToSlice(proxy.Headers, func(h *Header) *api.Header {
		return &api.Header{
			Key:   h.Key,
			Value: h.Value,
			Opt:   h.Opt,
		}
	})

	return &api.Proxy{
		Path:    proxy.Path,
		Timeout: proxy.Timeout,
		Retry:   proxy.Retry,
		Extends: proxy.Extends,
		Plugins: proxy.Plugins,
		Headers: headers,
	}
}

type ListInput struct {
	Projects []string `json:"projects"`
}

type UpdateDoc struct {
	Content string `json:"content"`
}

type InputSimpleAPI struct {
	Services []string `json:"services"`
}
