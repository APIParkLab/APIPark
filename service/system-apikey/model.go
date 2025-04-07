package system_apikey

import (
	"time"

	"github.com/APIParkLab/APIPark/stores/system"
)

type APIKey struct {
	Id       string
	Name     string
	Value    string
	Creator  string
	Updater  string
	CreateAt time.Time
	UpdateAt time.Time
	Expired  int64
}

type Create struct {
	Id      string
	Name    string
	Value   string
	Expired int64
}

type Update struct {
	Name    *string
	Value   *string
	Expired *int64
}

func FromEntity(s *system.APIKey) *APIKey {
	return &APIKey{
		Id:       s.UUID,
		Name:     s.Name,
		Value:    s.Value,
		Creator:  s.Creator,
		Updater:  s.Updater,
		CreateAt: s.CreateAt,
		UpdateAt: s.UpdateAt,
		Expired:  s.Expired,
	}
}
