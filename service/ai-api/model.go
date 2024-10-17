package ai_api

import (
	"encoding/json"
	"github.com/APIParkLab/APIPark/stores/api"
	"time"
)

type API struct {
	ID               string
	Name             string
	Service          string
	Path             string
	Description      string
	Timeout          int
	Retry            int
	Model            string
	CreateAt         time.Time
	UpdateAt         time.Time
	Creator          string
	Updater          string
	AdditionalConfig map[string]interface{}
	Disable          bool
}

type Create struct {
	ID               string
	Name             string
	Service          string
	Path             string
	Description      string
	Timeout          int
	Retry            int
	Model            string
	AdditionalConfig map[string]interface{}
}

type Edit struct {
	Name             *string
	Path             *string
	Description      *string
	Timeout          *int
	Retry            *int
	Model            *string
	AdditionalConfig *map[string]interface{}
}

func FromEntity(e *api.AiAPIInfo) *API {
	cfg := make(map[string]interface{})
	if e.AdditionalConfig != "" {
		_ = json.Unmarshal([]byte(e.AdditionalConfig), &cfg)
	}
	return &API{
		ID:               e.Uuid,
		Name:             e.Name,
		Service:          e.Service,
		Path:             e.Path,
		Description:      e.Description,
		Timeout:          e.Timeout,
		Retry:            e.Retry,
		Model:            e.Model,
		CreateAt:         e.CreateAt,
		UpdateAt:         e.UpdateAt,
		Creator:          e.Creator,
		Updater:          e.Updater,
		AdditionalConfig: cfg,
	}
}
