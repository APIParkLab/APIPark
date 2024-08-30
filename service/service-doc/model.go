package service_doc

import "time"

type Doc struct {
	ID         string
	Creator    string
	Updater    string
	Doc        string
	UpdateTime time.Time
	CreateTime time.Time
}

type SaveDoc struct {
	Sid string
	Doc string
}

type DocCommit struct {
	Content string `json:"content"`
}
