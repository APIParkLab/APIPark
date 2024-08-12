package application_authorization

import (
	"time"
	
	"github.com/APIParkLab/APIPark/stores/service"
)

type Authorization struct {
	UUID           string
	Application    string
	Name           string
	Type           string
	Position       string
	TokenName      string
	Config         string
	Creator        string
	Updater        string
	CreateTime     time.Time
	UpdateTime     time.Time
	ExpireTime     int64
	HideCredential bool
}

func FromEntity(e *service.Authorization) *Authorization {
	return &Authorization{
		UUID:           e.UUID,
		Application:    e.Application,
		Name:           e.Name,
		Type:           e.Type,
		Position:       e.Position,
		TokenName:      e.TokenName,
		Config:         e.Config,
		Creator:        e.Creator,
		Updater:        e.Updater,
		CreateTime:     e.CreateAt,
		UpdateTime:     e.UpdateAt,
		ExpireTime:     e.ExpireTime,
		HideCredential: e.HideCredential,
	}
}

type Create struct {
	UUID           string
	Application    string
	Name           string
	Type           string
	Position       string
	TokenName      string
	Config         string
	AuthID         string
	ExpireTime     int64
	HideCredential bool
}

type Edit struct {
	Name           *string
	Position       *string
	TokenName      *string
	Config         *string
	ExpireTime     *int64
	HideCredential *bool
	AuthID         *string
}
