package api_doc_dto

import "github.com/eolinker/go-common/auto"

type ApiDocDetail struct {
	Content    string         `json:"content"`
	Updater    string         `json:"updater"`
	UpdateTime auto.TimeLabel `json:"update_time"`
}
