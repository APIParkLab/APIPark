package team

import (
	"time"
	
	"github.com/APIParkLab/APIPark/stores/team"
)

type Team struct {
	Id          string `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	//Master       string    `json:"master"`
	Organization string    `json:"organization"`
	CreateTime   time.Time `json:"create_time"`
	UpdateTime   time.Time `json:"update_time"`
	Creator      string    `json:"creator"`
	Updater      string    `json:"updater"`
}

func FromEntity(e *team.Team) *Team {
	return &Team{
		Id:          e.UUID,
		Name:        e.Name,
		Description: e.Description,
		//Master:      e.Master,
		CreateTime: e.CreateAt,
		UpdateTime: e.UpdateAt,
		Creator:    e.Creator,
		Updater:    e.Updater,
	}
}

type CreateTeam struct {
	Id          string `json:"id" `
	Name        string `json:"name" `
	Description string `json:"description"`
}
type EditTeam struct {
	Name        *string `json:"name" `
	Description *string `json:"description"`
	//Master      *string `json:"master" `
}
