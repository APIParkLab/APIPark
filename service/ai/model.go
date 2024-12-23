package ai

import (
	"encoding/base64"
	"time"

	"github.com/APIParkLab/APIPark/stores/ai"
)

type Provider struct {
	Id         string
	Name       string
	DefaultLLM string
	Config     string
	Creator    string
	Updater    string
	Status     int
	Priority   int
	CreateAt   time.Time
	UpdateAt   time.Time
}

type SetProvider struct {
	Name       *string
	DefaultLLM *string
	Config     *string
	Status     *int
	Priority   *int
}

func FromEntity(e *ai.Provider) *Provider {
	config, err := base64.RawStdEncoding.DecodeString(e.Config)
	if err != nil {
		config = []byte(e.Config)
	}
	return &Provider{
		Id:         e.UUID,
		Name:       e.Name,
		DefaultLLM: e.DefaultLLM,
		Config:     string(config),
		Creator:    e.Creator,
		Updater:    e.Updater,
		CreateAt:   e.CreateAt,
		UpdateAt:   e.UpdateAt,
		Status:     e.Status,
		Priority:   e.Priority,
	}
}
