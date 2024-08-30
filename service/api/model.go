package api

import (
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"github.com/APIParkLab/APIPark/model/plugin_model"

	"github.com/APIParkLab/APIPark/stores/api"
)

type API struct {
	UUID      string
	Service   string
	Team      string
	Creator   string
	Method    []string
	Path      string
	Protocols []string
	CreateAt  time.Time
	IsDelete  bool
}

type Info struct {
	UUID        string
	Name        string
	Description string
	CreateAt    time.Time
	UpdateAt    time.Time
	Service     string
	Team        string
	Creator     string
	Updater     string
	Methods     []string
	Protocols   []string
	Path        string
	Match       string
	Disable     bool
}

func FromEntity(e *api.Api) *API {
	methods := make([]string, 0)
	if e.Method != "" {
		err := json.Unmarshal([]byte(e.Method), &methods)
		if err != nil {
			m := strings.ToUpper(e.Method)
			if m == http.MethodGet || m == http.MethodPost || m == http.MethodPut || m == http.MethodDelete || m == http.MethodPatch || m == http.MethodHead || m == http.MethodOptions {
				methods = append(methods, m)
			}
		}
	}
	return &API{
		UUID:      e.UUID,
		CreateAt:  e.CreateAt,
		IsDelete:  e.IsDelete != 0,
		Service:   e.Service,
		Team:      e.Team,
		Creator:   e.Creator,
		Method:    methods,
		Path:      e.Path,
		Protocols: e.Protocol,
	}
}

func FromEntityInfo(e *api.Info) *Info {
	methods := make([]string, 0)
	if e.Method != "" {
		err := json.Unmarshal([]byte(e.Method), &methods)
		if err != nil {
			m := strings.ToUpper(e.Method)
			if m == http.MethodGet || m == http.MethodPost || m == http.MethodPut || m == http.MethodDelete || m == http.MethodPatch || m == http.MethodHead || m == http.MethodOptions {
				methods = append(methods, m)
			}
		}
	}
	return &Info{
		UUID:        e.UUID,
		Name:        e.Name,
		Description: e.Description,
		CreateAt:    e.CreateAt,
		UpdateAt:    e.UpdateAt,
		Service:     e.Service,
		Team:        e.Team,
		Creator:     e.Creator,
		Updater:     e.Updater,
		Methods:     methods,
		Protocols:   e.Protocol,
		Path:        e.Path,
		Match:       e.Match,
		Disable:     e.Disable,
	}
}

type CreateAPI struct {
	UUID        string
	Name        string
	Description string
	Service     string
	Team        string
	Method      string
	Path        string
	Match       string
}

type EditAPI struct {
	Name        *string
	Upstream    *string
	Description *string
}

type ExistAPI struct {
	Path   string
	Method string
}

type Document struct {
	Content string `json:"content"`
}
type PluginSetting struct {
	Disable bool                    `json:"disable"`
	Config  plugin_model.ConfigType `json:"config"`
}
type Proxy struct {
	Path    string                   `json:"path"`
	Timeout int                      `json:"timeout"`
	Retry   int                      `json:"retry"`
	Plugins map[string]PluginSetting `json:"plugins"`
	Extends map[string]any           `json:"extends"`
	Headers []*Header                `json:"headers"`
}

type Header struct {
	Key   string `json:"key"`
	Value string `json:"value"`
	Opt   string `json:"opt"`
}

type Router struct {
	Method     string   `json:"method"`
	Path       string   `json:"path"`
	MatchRules []*Match `json:"match"`
}

type Match struct {
	Position  string `json:"position"`
	MatchType string `json:"match_type"`
	Key       string `json:"key"`
	Pattern   string `json:"pattern"`
}
