package api_doc

import "time"

type UpdateDoc struct {
	ID      string
	Content string
	Prefix  string
}

type Doc struct {
	Id       string
	Service  string
	Content  string
	Updater  string
	UpdateAt time.Time
}

type DocCommit struct {
	Content  string `json:"content"`
	APICount int64  `json:"api_count"`
}
