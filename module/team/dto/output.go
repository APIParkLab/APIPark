package team_dto

import (
	"github.com/APIParkLab/APIPark/service/team"
	"github.com/eolinker/go-common/auto"
)

type Item struct {
	Id          string         `json:"id"`
	Name        string         `json:"name"`
	Description string         `json:"description"`
	CreateTime  auto.TimeLabel `json:"create_time"`
	UpdateTime  auto.TimeLabel `json:"update_time"`
	CanDelete   bool           `json:"can_delete"`
	ServiceNum  int64          `json:"service_num"`
	AppNum      int64          `json:"app_num"`
}

func ToItem(model *team.Team, serviceNum int64, appNum int64) *Item {
	return &Item{
		Id:          model.Id,
		Name:        model.Name,
		Description: model.Description,
		CreateTime:  auto.TimeLabel(model.CreateTime),
		UpdateTime:  auto.TimeLabel(model.UpdateTime),
		ServiceNum:  serviceNum,
		AppNum:      appNum,
		CanDelete:   serviceNum == 0 && appNum == 0,
	}
}

type Team struct {
	Id          string         `json:"id"`
	Name        string         `json:"name"`
	Description string         `json:"description"`
	CreateTime  auto.TimeLabel `json:"create_time"`
	UpdateTime  auto.TimeLabel `json:"update_time"`
	Creator     auto.Label     `json:"creator" aolabel:"user"`
	Updater     auto.Label     `json:"updater" aolabel:"user"`
	CanDelete   bool           `json:"can_delete"`
}

func ToTeam(model *team.Team, serviceNum int64, appNum int64) *Team {
	return &Team{
		Id:          model.Id,
		Name:        model.Name,
		Description: model.Description,
		CreateTime:  auto.TimeLabel(model.CreateTime),
		UpdateTime:  auto.TimeLabel(model.UpdateTime),
		Creator:     auto.UUID(model.Creator),
		Updater:     auto.UUID(model.Updater),
		CanDelete:   serviceNum == 0 && appNum == 0,
	}
}
