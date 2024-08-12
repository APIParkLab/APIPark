package service_doc

import "time"

type Doc struct {
	ID         int64
	DocID      string
	Name       string
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
