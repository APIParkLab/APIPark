package ai_balance

import (
	"time"

	"github.com/APIParkLab/APIPark/stores/ai"
)

type Balance struct {
	Id           string
	Priority     int
	Provider     string
	ProviderName string
	Model        string
	ModelName    string
	Type         int
	State        int
	Creator      string
	Updater      string
	CreateAt     time.Time
	UpdateAt     time.Time
}

func FromEntity(e *ai.Balance) *Balance {
	return &Balance{
		Id:           e.Uuid,
		Priority:     e.Priority,
		Provider:     e.Provider,
		ProviderName: e.ProviderName,
		Model:        e.Model,
		ModelName:    e.ModelName,
		Type:         e.Type,
		State:        e.State,
		Creator:      e.Creator,
		Updater:      e.Updater,
		CreateAt:     e.CreateAt,
		UpdateAt:     e.UpdateAt,
	}
}

type Create struct {
	Id           string
	Priority     int
	Provider     string
	ProviderName string
	Model        string
	ModelName    string
	Type         int
}

type Edit struct {
	Priority *int
	State    *int
}
