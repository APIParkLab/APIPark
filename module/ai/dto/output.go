package ai_dto

import (
	"github.com/eolinker/go-common/auto"
)

type SimpleModel struct {
	Id   string `json:"id"`
	Name string `json:"name"`
}

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
	Status      ProviderStatus `json:"status"`
	Configured  bool           `json:"configured"`
	ModelConfig ModelConfig    `json:"model_config"`
}

type ModelConfig struct {
	AccessConfigurationStatus bool   `json:"access_configuration_status"`
	AccessConfigurationDemo   string `json:"access_configuration_demo"`
}

type ConfiguredProviderItem struct {
	Id         string         `json:"id"`
	Name       string         `json:"name"`
	Logo       string         `json:"logo"`
	DefaultLLM string         `json:"default_llm"`
	Status     ProviderStatus `json:"status"`
	APICount   int64          `json:"api_count"`
	KeyCount   int64          `json:"key_count"`
	ModelCount int64          `json:"model_count"`
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
	Type       int    `json:"type"` // 0:default 1:customize
}

type SimpleProviderItem struct {
	Id            string         `json:"id"`
	Name          string         `json:"name"`
	Logo          string         `json:"logo"`
	Configured    bool           `json:"configured"`
	DefaultConfig string         `json:"default_config"`
	Status        ProviderStatus `json:"status"`
	Model         *BasicInfo     `json:"model,omitempty"`
	Type          string         `json:"type"`
}

type BackupProvider struct {
	Id    string     `json:"id"`
	Name  string     `json:"name"`
	Model *BasicInfo `json:"model,omitempty"`
	Type  string     `json:"type"`
}

type LLMItem struct {
	Id                  string   `json:"id"`
	Logo                string   `json:"logo"`
	Config              string   `json:"config"`
	AccessConfiguration string   `json:"access_configuration"`
	ModelParameters     string   `json:"model_parameters"`
	Scopes              []string `json:"scopes"`
	Type                string   `json:"type"`
	IsSystem            bool     `json:"is_system"`
	ApiCount            int64    `json:"api_count"`
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
