package catalogue

import (
	"time"
	
	"github.com/APIParkLab/APIPark/stores/catalogue"
)

type Catalogue struct {
	// 目录ID
	Id string
	// 名称
	Name string
	// 父目录ID
	Parent     string
	Sort       int
	CreateTime time.Time
	UpdateTime time.Time
}

func FromEntity(e *catalogue.Catalogue) *Catalogue {
	return &Catalogue{
		Id:         e.UUID,
		Name:       e.Name,
		Parent:     e.Parent,
		Sort:       e.Sort,
		CreateTime: e.CreateAt,
		UpdateTime: e.UpdateAt,
	}
}

type CreateCatalogue struct {
	Id     string
	Name   string
	Parent string
	Sort   int
}

type EditCatalogue struct {
	Id     *string
	Name   *string
	Parent *string
	Sort   *int
}
