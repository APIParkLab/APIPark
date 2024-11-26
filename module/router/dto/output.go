package router_dto

import (
	"encoding/json"

	"github.com/eolinker/go-common/utils"

	"github.com/APIParkLab/APIPark/service/api"
	"github.com/eolinker/go-common/auto"
)

type Item struct {
	Id          string         `json:"id"`
	Methods     []string       `json:"methods"`
	Protocols   []string       `json:"protocols"`
	Path        string         `json:"request_path"`
	Description string         `json:"description"`
	Disable     bool           `json:"disable"`
	Creator     auto.Label     `json:"creator" aolabel:"user"`
	Updater     auto.Label     `json:"updater" aolabel:"user"`
	CreateTime  auto.TimeLabel `json:"create_time"`
	UpdateTime  auto.TimeLabel `json:"update_time"`
	CanDelete   bool           `json:"can_delete"`
}

type SimpleItem struct {
	Id      string   `json:"id"`
	Methods []string `json:"methods"`
	Name    string   `json:"name"`
	Path    string   `json:"request_path"`
}

type Detail struct {
	SimpleDetail
	Proxy     *Proxy   `json:"proxy"`
	Protocols []string `json:"protocols"`
	Disable   bool     `json:"disable"`
	//Doc   map[string]interface{} `json:"doc"`
}

func GenSimpleDetail(api *api.Info) *SimpleDetail {
	match := make([]Match, 0)
	if api.Match == "" {
		api.Match = "[]"
	}
	json.Unmarshal([]byte(api.Match), &match)

	return &SimpleDetail{
		Id:          api.UUID,
		Name:        api.Name,
		Description: api.Description,
		Methods:     api.Methods,
		Path:        api.Path,
		MatchRules:  match,
		Creator:     auto.UUID(api.Creator),
		Updater:     auto.UUID(api.Updater),
		CreateTime:  auto.TimeLabel(api.CreateAt),
		UpdateTime:  auto.TimeLabel(api.UpdateAt),
	}
}

type SimpleDetail struct {
	Id          string         `json:"id"`
	Name        string         `json:"name"`
	Description string         `json:"description"`
	Methods     []string       `json:"methods"`
	Path        string         `json:"path"`
	Protocols   []string       `json:"protocols"`
	MatchRules  []Match        `json:"match"`
	Creator     auto.Label     `json:"creator" aolabel:"user"`
	Updater     auto.Label     `json:"updater" aolabel:"user"`
	CreateTime  auto.TimeLabel `json:"create_time"`
	UpdateTime  auto.TimeLabel `json:"update_time"`
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

type Export struct {
	Id          string                 `json:"id"`
	Name        string                 `json:"name"`
	Description string                 `json:"description"`
	Method      []string               `json:"method"`
	Path        string                 `json:"path"`
	MatchRules  []Match                `json:"match"`
	Service     string                 `json:"service"`
	Team        string                 `json:"team"`
	Proxy       *Proxy                 `json:"proxy"`
	Doc         map[string]interface{} `json:"doc"`
}
