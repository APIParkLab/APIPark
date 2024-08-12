package api_dto

import (
	"encoding/json"
	
	"github.com/eolinker/go-common/utils"
	
	"github.com/APIParkLab/APIPark/service/api"
	"github.com/eolinker/go-common/auto"
)

type ApiItem struct {
	Id         string         `json:"id"`
	Name       string         `json:"name"`
	Method     string         `json:"method"`
	Path       string         `json:"request_path"`
	Creator    auto.Label     `json:"creator" aolabel:"user"`
	Updater    auto.Label     `json:"updater" aolabel:"user"`
	CreateTime auto.TimeLabel `json:"create_time"`
	UpdateTime auto.TimeLabel `json:"update_time"`
	CanDelete  bool           `json:"can_delete"`
}

type ApiSimpleItem struct {
	Id     string `json:"id"`
	Name   string `json:"name"`
	Method string `json:"method"`
	Path   string `json:"request_path"`
}

type ApiDetail struct {
	ApiSimpleDetail
	Proxy *Proxy                 `json:"proxy"`
	Doc   map[string]interface{} `json:"doc"`
}

func GenApiSimpleDetail(api *api.Info) *ApiSimpleDetail {
	match := make([]Match, 0)
	if api.Match == "" {
		api.Match = "[]"
	}
	json.Unmarshal([]byte(api.Match), &match)
	
	return &ApiSimpleDetail{
		Id:          api.UUID,
		Name:        api.Name,
		Description: api.Description,
		Method:      api.Method,
		Path:        api.Path,
		MatchRules:  match,
		Creator:     auto.UUID(api.Creator),
		Updater:     auto.UUID(api.Updater),
		CreateTime:  auto.TimeLabel(api.CreateAt),
		UpdateTime:  auto.TimeLabel(api.UpdateAt),
	}
}

type ApiSimpleDetail struct {
	Id          string         `json:"id"`
	Name        string         `json:"name"`
	Description string         `json:"description"`
	Method      string         `json:"method"`
	Path        string         `json:"path"`
	MatchRules  []Match        `json:"match"`
	Creator     auto.Label     `json:"creator" aolabel:"user"`
	Updater     auto.Label     `json:"updater" aolabel:"user"`
	CreateTime  auto.TimeLabel `json:"create_time"`
	UpdateTime  auto.TimeLabel `json:"update_time"`
}

type ApiDocDetail struct {
	ApiSimpleDetail
	Doc map[string]interface{} `json:"doc"`
}

type ApiProxyDetail struct {
	ApiSimpleDetail
	Proxy *Proxy `json:"proxy"`
}

func FromServiceProxy(proxy *api.Proxy) *Proxy {
	if proxy == nil {
		return nil
	}
	
	return &Proxy{
		Path:    proxy.Path,
		Timeout: proxy.Timeout,
		Retry:   proxy.Retry,
		Headers: utils.SliceToSlice(proxy.Headers, func(header *api.Header) *Header {
			return &Header{
				Key:   header.Key,
				Value: header.Value,
				Opt:   header.Opt,
			}
		}),
		Extends: proxy.Extends,
		Plugins: proxy.Plugins,
	}
}

type Proxy struct {
	Path    string                       `json:"path"`
	Timeout int                          `json:"timeout"`
	Retry   int                          `json:"retry"`
	Headers []*Header                    `json:"headers"`
	Extends map[string]any               `json:"extends"`
	Plugins map[string]api.PluginSetting `json:"plugins"`
}

type Header struct {
	Key   string `json:"key"`
	Value string `json:"value"`
	Opt   string `json:"opt"`
}
