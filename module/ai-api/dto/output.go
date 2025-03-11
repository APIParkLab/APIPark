package ai_api_dto

import (
	"github.com/eolinker/go-common/auto"
)

type ModelType string

const (
	ModelTypeOnline ModelType = "online"
	ModelTypeLocal  ModelType = "local"
)

func (m ModelType) String() string {
	return string(m)
}

func (m ModelType) Int() int {
	switch m {
	case ModelTypeOnline:
		return 0
	case ModelTypeLocal:
		return 1
	default:
		return -1
	}
}

func FromModelType(m int) ModelType {
	switch m {
	case 0:
		return ModelTypeOnline
	case 1:
		return ModelTypeLocal
	default:
		return ""
	}
}

type API struct {
	Id          string    `json:"id"`
	Name        string    `json:"name"`
	Path        string    `json:"path"`
	Description string    `json:"description"`
	Disable     bool      `json:"disabled"`
	AiPrompt    *AiPrompt `json:"ai_prompt"`
	AiModel     *AiModel  `json:"ai_model"`
	Timeout     int       `json:"timeout"`
	Retry       int       `json:"retry"`
}

type APIItem struct {
	Id          string         `json:"id"`
	Name        string         `json:"name"`
	ModelType   ModelType      `json:"model_type"`
	RequestPath string         `json:"request_path"`
	Description string         `json:"description"`
	Disable     bool           `json:"disabled"`
	Creator     auto.Label     `json:"creator" aolabel:"user"`
	Updater     auto.Label     `json:"updater" aolabel:"user"`
	CreateTime  auto.TimeLabel `json:"create_time"`
	UpdateTime  auto.TimeLabel `json:"update_time"`
	Provider    ProviderItem   `json:"provider"`
	Model       ModelItem      `json:"model"`
}

type ModelItem struct {
	Id   string `json:"id"`
	Name string `json:"name"`
	Logo string `json:"logo"`
}

type ProviderItem struct {
	Id   string `json:"id"`
	Name string `json:"name"`
	Logo string `json:"logo"`
}
