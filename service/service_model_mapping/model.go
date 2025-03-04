package service_model_mapping

import (
	"time"

	"github.com/APIParkLab/APIPark/stores/service"
)

type ModelMapping struct {
	UUID     string    `json:"uuid"`
	Service  string    `json:"service"`
	Content  string    `json:"content"`
	CreateAt time.Time `json:"create_at"`
	UpdateAt time.Time `json:"update_at"`
}

type Create struct {
	Service string `json:"service" validate:"required"`
	Content string `json:"content" validate:"required"`
}

type Edit struct {
	Content *string `json:"content,omitempty"`
}

func FromEntity(e *service.ModelMapping) *ModelMapping {
	content := ""
	if e.Content != "" {
		content = e.Content
	}
	return &ModelMapping{
		UUID:     e.UUID,
		Service:  e.Service,
		Content:  content,
		CreateAt: e.CreateAt,
		UpdateAt: e.UpdateAt,
	}
}