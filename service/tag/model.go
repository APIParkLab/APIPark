package tag

import (
	"time"
	
	"github.com/APIParkLab/APIPark/stores/tag"
)

type Tag struct {
	Id         string
	Name       string
	CreateTime time.Time
	UpdateTime time.Time
}

func FromEntity(e *tag.Tag) *Tag {
	return &Tag{
		Id:         e.UUID,
		Name:       e.Name,
		CreateTime: e.CreateAt,
		UpdateTime: e.UpdateAt,
	}
}

type CreateTag struct {
	Id   string
	Name string
}
