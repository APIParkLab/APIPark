package log_dto

import (
	"github.com/eolinker/go-common/auto"
)

type LogSource struct {
	ID       string                 `json:"id"`
	Config   map[string]interface{} `json:"config"`
	Creator  auto.Label             `json:"creator" aolabel:"user"`
	Updater  auto.Label             `json:"updater" aolabel:"user"`
	CreateAt auto.TimeLabel         `json:"create_time"`
	UpdateAt auto.TimeLabel         `json:"update_time"`
}
