package api_dto

import (
	"encoding/json"
	"errors"
	"fmt"
	"github.com/eolinker/go-common/utils"
	"strings"
	
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

type CreateApi struct {
	Id          string      `json:"id"`
	Name        string      `json:"name"`
	Path        string      `json:"path"`
	Method      string      `json:"method"`
	Description string      `json:"description"`
	MatchRules  []Match     `json:"match"`
	Proxy       *InputProxy `json:"proxy"`
}

type InputProxy struct {
	Path string `json:"path"`
	//Upstream string    `json:"upstream" aocheck:"upstream"`
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

func (a *CreateApi) Validate() error {
	if a.Id == "" {
		return errors.New("id is null")
	}
	if a.Name == "" {
		return errors.New("name is null")
	}
	a.Path = fmt.Sprintf("/%s", strings.TrimPrefix(a.Path, "/"))
	a.Method = strings.ToUpper(a.Method)
	if _, ok := validMethods[a.Method]; !ok {
		return fmt.Errorf("method(%s) is invalid", a.Method)
	}
	return nil
}

func (a *CreateApi) ToServiceRouter() *api.Router {
	router := &api.Router{
		Method: a.Method,
		Path:   a.Path,
	}
	for _, match := range a.MatchRules {
		router.MatchRules = append(router.MatchRules, &api.Match{
			Position:  match.Position,
			MatchType: match.MatchType,
			Key:       match.Key,
			Pattern:   match.Pattern,
		})
	}
	return router
}

type EditApi struct {
	Info struct {
		Name        *string `json:"name"`
		Description *string `json:"description"`
	} `json:"info"`
	Proxy *InputProxy             `json:"proxy"`
	Doc   *map[string]interface{} `json:"doc"`
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
		Path: proxy.Path,
		//Upstream: proxy.Upstream,
		Timeout: proxy.Timeout,
		Retry:   proxy.Retry,
		Extends: proxy.Extends,
		Plugins: proxy.Plugins,
		Headers: headers,
	}
}

func ToServiceDocument(doc map[string]interface{}) *api.Document {
	if doc == nil {
		return &api.Document{
			Content: "{}",
		}
	}
	content, _ := json.Marshal(doc)
	
	return &api.Document{
		Content: string(content),
	}
}

type ListInput struct {
	Projects []string `json:"projects"`
}
