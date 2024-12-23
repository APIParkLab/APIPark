package ai_key

import (
	"time"

	"github.com/APIParkLab/APIPark/stores/ai"
)

type Key struct {
	ID         string
	Name       string
	Config     string
	Provider   string
	Status     int
	ExpireTime int
	UseToken   int
	Creator    string
	Updater    string
	Priority   int
	CreateAt   time.Time
	UpdateAt   time.Time
	Default    bool
}

func FromEntity(e *ai.Key) *Key {
	return &Key{
		ID:         e.Uuid,
		Name:       e.Name,
		Config:     e.Config,
		Provider:   e.Provider,
		Status:     e.Status,
		ExpireTime: e.ExpireTime,
		UseToken:   e.UseToken,
		Creator:    e.Creator,
		Updater:    e.Updater,
		CreateAt:   e.CreateAt,
		UpdateAt:   e.UpdateAt,
		Priority:   e.Sort,
		Default:    e.Default,
	}
}

type Create struct {
	ID         string
	Name       string
	Config     string
	Provider   string
	Priority   int
	Status     int
	ExpireTime int
	UseToken   int
	Default    bool
}

type Edit struct {
	Name       *string
	Config     *string
	Status     *int
	ExpireTime *int
	Priority   *int
}
