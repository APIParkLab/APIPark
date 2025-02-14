package ai_dto

import (
	"github.com/eolinker/go-common/auto"
)

type SimpleProvider struct {
	Id            string `json:"id"`
	Name          string `json:"name"`
	DefaultConfig string `json:"default_config"`
	Logo          string `json:"logo"`
	GetAPIKeyUrl  string `json:"get_apikey_url"`
}

type Provider struct {
	Id               string `json:"id"`
	Name             string `json:"name"`
	Config           string `json:"config"`
	GetAPIKeyUrl     string `json:"get_apikey_url"`
	DefaultLLM       string `json:"default_llm"`
	DefaultLLMConfig string `json:"-"`
	//Priority         int            `json:"priority"`
	Status     ProviderStatus `json:"status"`
	Configured bool           `json:"configured"`
}

type ConfiguredProviderItem struct {
	Id         string         `json:"id"`
	Name       string         `json:"name"`
	Logo       string         `json:"logo"`
	DefaultLLM string         `json:"default_llm"`
	Status     ProviderStatus `json:"status"`
	APICount   int64          `json:"api_count"`
	KeyCount   int64          `json:"key_count"`
	CanDelete  bool           `json:"can_delete"`
}

type KeyStatus struct {
	Id       string `json:"id"`
	Name     string `json:"name"`
	Status   string `json:"status"`
	Priority int    `json:"-"`
}

type ProviderItem struct {
	Id         string `json:"id"`
	Name       string `json:"name"`
	Logo       string `json:"logo"`
	DefaultLLM string `json:"default_llm"`
	Sort       int    `json:"-"`
}

type SimpleProviderItem struct {
	Id            string         `json:"id"`
	Name          string         `json:"name"`
	Logo          string         `json:"logo"`
	Configured    bool           `json:"configured"`
	DefaultConfig string         `json:"default_config"`
	Status        ProviderStatus `json:"status"`
	Model         *BasicInfo     `json:"model,omitempty"`
	Priority      int            `json:"-"`
}

type BackupProvider struct {
	Id    string     `json:"id"`
	Name  string     `json:"name"`
	Model *BasicInfo `json:"model,omitempty"`
}

type LLMItem struct {
	Id     string   `json:"id"`
	Logo   string   `json:"logo"`
	Config string   `json:"config"`
	Scopes []string `json:"scopes"`
}

type APIItem struct {
	Id          string         `json:"id"`
	Name        string         `json:"name"`
	Service     auto.Label     `json:"service" aolabel:"service"`
	Team        auto.Label     `json:"team" aolabel:"team"`
	Method      string         `json:"method"`
	RequestPath string         `json:"request_path"`
	Model       auto.Label     `json:"model"`
	UpdateTime  auto.TimeLabel `json:"update_time"`
	UseToken    int            `json:"use_token"`
	Disable     bool           `json:"disable"`
}

type Condition struct {
	Models   []*BasicInfo `json:"models"`
	Services []*BasicInfo `json:"services"`
}

type BasicInfo struct {
	Id   string `json:"id"`
	Name string `json:"name"`
}
