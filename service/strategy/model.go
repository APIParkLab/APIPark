package strategy

import (
	"time"

	"github.com/APIParkLab/APIPark/stores/strategy"
)

type Strategy struct {
	Id       string
	Name     string
	Priority int
	Desc     string
	Filters  string
	Config   string
	Driver   string
	Scope    int
	Target   string
	Creator  string
	Updater  string
	CreateAt time.Time
	UpdateAt time.Time
	IsStop   bool
	IsDelete bool
}

func FromEntity(e *strategy.Strategy) *Strategy {
	return &Strategy{
		Id:       e.UUID,
		Name:     e.Name,
		Priority: e.Priority,
		Driver:   e.Driver,
		Desc:     e.Desc,
		Filters:  e.Filters,
		Config:   e.Config,
		Scope:    e.Scope,
		Target:   e.Target,
		Creator:  e.Creator,
		Updater:  e.Updater,
		CreateAt: e.CreateAt,
		UpdateAt: e.UpdateAt,
		IsStop:   e.IsStop,
		IsDelete: e.IsDelete,
	}
}

type Create struct {
	Id       string
	Name     string
	Priority int
	Desc     string
	Filters  string
	Config   string
	Scope    int
	Target   string
	Driver   string
}

type Edit struct {
	Name     *string
	Priority *int
	Desc     *string
	Filters  *string
	Config   *string
	IsStop   *bool
}

type Commit struct {
	Id       string
	Name     string
	Priority int
	Filters  string
	Config   string
	Driver   string
	IsDelete bool
	IsStop   bool
	Version  string
}
