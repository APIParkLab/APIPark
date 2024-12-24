package ai_api_dto

import (
	"github.com/eolinker/go-common/auto"
)

type API struct {
	Id          string    `json:"id"`
	Name        string    `json:"name"`
	Path        string    `json:"path"`
	Description string    `json:"description"`
	Disable     bool      `json:"disable"`
	AiPrompt    *AiPrompt `json:"ai_prompt"`
	AiModel     *AiModel  `json:"ai_model"`
	Timeout     int       `json:"timeout"`
	Retry       int       `json:"retry"`
}

type APIItem struct {
	Id          string         `json:"id"`
	Name        string         `json:"name"`
	RequestPath string         `json:"request_path"`
	Description string         `json:"description"`
	Disable     bool           `json:"disable"`
	Creator     auto.Label     `json:"creator" aolabel:"user"`
	Updater     auto.Label     `json:"updater" aolabel:"user"`
	CreateTime  auto.TimeLabel `json:"create_time"`
	UpdateTime  auto.TimeLabel `json:"update_time"`
	Provider    ProviderItem   `json:"provider"`
	Model       ModelItem      `json:"model"`
}

type AIAPIItem struct {
	Id          string         `json:"id"`
	Name        string         `json:"name"`
	Service     auto.Label     `json:"service" aolabel:"service"`
	Method      string         `json:"method"`
	RequestPath string         `json:"request_path"`
	Model       ModelItem      `json:"model"`
	Provider    ProviderItem   `json:"provider"`
	UpdateTime  auto.TimeLabel `json:"update_time"`
	UseToken    int64          `json:"use_token"`
	Disable     bool           `json:"disable"`
}

type ModelItem struct {
	Id   string `json:"id"`
	Logo string `json:"logo"`
}

type ProviderItem struct {
	Id   string `json:"id"`
	Name string `json:"name"`
	Logo string `json:"logo"`
}
