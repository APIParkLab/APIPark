package ai_dto

import (
	"github.com/eolinker/go-common/auto"
)

type SimpleProvider struct {
	Id           string `json:"id"`
	Name         string `json:"name"`
	Logo         string `json:"logo"`
	GetAPIKeyUrl string `json:"get_apikey_url"`
}

type Provider struct {
	Id               string         `json:"id"`
	Name             string         `json:"name"`
	Config           string         `json:"config"`
	GetAPIKeyUrl     string         `json:"get_apikey_url"`
	DefaultLLM       string         `json:"defaultLLM"`
	DefaultLLMConfig string         `json:"-"`
	Priority         int            `json:"priority"`
	Status           ProviderStatus `json:"status"`
}

type ConfiguredProviderItem struct {
	Id         string         `json:"id"`
	Name       string         `json:"name"`
	Logo       string         `json:"logo"`
	DefaultLLM string         `json:"default_llm"`
	Status     ProviderStatus `json:"status"`
	APICount   int64          `json:"api_count"`
	KeyCount   int            `json:"key_count"`
	KeyStatus  []*KeyStatus   `json:"key_status"`
	Priority   int            `json:"priority"`
}

type KeyStatus struct {
	Id     string `json:"id"`
	Name   string `json:"name"`
	Status string `json:"status"`
}

type ProviderItem struct {
	Id         string `json:"id"`
	Name       string `json:"name"`
	Logo       string `json:"logo"`
	DefaultLLM string `json:"default_llm"`
	Sort       int    `json:"-"`
}

type SimpleProviderItem struct {
	Id         string         `json:"id"`
	Name       string         `json:"name"`
	Logo       string         `json:"logo"`
	Configured bool           `json:"configured"`
	Status     ProviderStatus `json:"status"`
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
	Method      string         `json:"method"`
	RequestPath string         `json:"request_path"`
	Model       auto.Label     `json:"model"`
	UpdateTime  auto.TimeLabel `json:"update_time"`
	UseToken    int            `json:"use_token"`
	Disable     bool           `json:"disable"`
}
