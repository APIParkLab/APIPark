package team_dto

import (
	"github.com/APIParkLab/APIPark/service/team"
	team_member "github.com/APIParkLab/APIPark/service/team-member"
	"github.com/eolinker/go-common/auto"
)

type Item struct {
	Id          string         `json:"id"`
	Name        string         `json:"name"`
	Description string         `json:"description"`
	CreateTime  auto.TimeLabel `json:"create_time"`
	UpdateTime  auto.TimeLabel `json:"update_time"`
	ServiceNum  int64          `json:"service_num"`
	AppNum      int64          `json:"app_num"`
	CanDelete   bool           `json:"can_delete"`
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

type SimpleTeam struct {
	Id          string `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	ServiceNum  int64  `json:"service_num"`
	AppNum      int64  `json:"app_num"`
}

type Team struct {
	Id          string         `json:"id"`
	Name        string         `json:"name"`
	Description string         `json:"description"`
	CreateTime  auto.TimeLabel `json:"create_time"`
	UpdateTime  auto.TimeLabel `json:"update_time"`
	Creator     auto.Label     `json:"creator" aolabel:"user"`
	Updater     auto.Label     `json:"updater" aolabel:"user"`
}

func ToTeam(model *team.Team) *Team {
	return &Team{
		Id:          model.Id,
		Name:        model.Name,
		Description: model.Description,
		CreateTime:  auto.TimeLabel(model.CreateTime),
		UpdateTime:  auto.TimeLabel(model.UpdateTime),
		Creator:     auto.UUID(model.Creator),
		Updater:     auto.UUID(model.Updater),
	}
}

type Member struct {
	User       auto.Label     `json:"user" aolabel:"user"`
	Roles      []auto.Label   `json:"roles" aolabel:"role"`
	AttachTime auto.TimeLabel `json:"attach_time"`
	IsDelete   bool           `json:"is_delete"`
}

func ToMember(model *team_member.Member, userId string, roles ...string) *Member {

	return &Member{
		User:       auto.UUID(model.UID),
		Roles:      auto.List(roles),
		AttachTime: auto.TimeLabel(model.CreateTime),
		IsDelete:   userId != model.UID,
	}
}

type SimpleMember struct {
	User       auto.Label   `json:"user" aolabel:"user"`
	Mail       string       `json:"mail"`
	Department []auto.Label `json:"department"`
}
