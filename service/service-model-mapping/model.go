package service_model_mapping

import (
	"time"
)

type ModelMapping struct {
	ID       int64     `json:"id"`
	Sid      string    `json:"sid"`
	Content  string    `json:"content"`
	Creator  string    `json:"creator"`
	Updater  string    `json:"updater"`
	CreateAt time.Time `json:"create_at"`
	UpdateAt time.Time `json:"update_at"`
}

type Save struct {
	Sid     string `json:"sid" validate:"required"`
	Content string `json:"content" validate:"required"`
}
