package dynamic_module

import (
	"time"
	
	dynamic_module "github.com/APIParkLab/APIPark/stores/dynamic-module"
)

type DynamicModule struct {
	ID          string
	Name        string
	Partition   string
	Driver      string
	Description string
	Version     string
	Config      string
	Module      string
	Profession  string
	Skill       string
	Creator     string
	Updater     string
	CreateAt    time.Time
	UpdateAt    time.Time
}

type CreateDynamicModule struct {
	Id     string
	Name   string
	Driver string
	//Cluster   string
	Description string
	Config      string
	Module      string
	Profession  string
	Skill       string
	Version     string
}

type EditDynamicModule struct {
	Name        *string
	Description *string
	Config      *string
	Version     *string
}

func FromEntity(ov *dynamic_module.DynamicModule) *DynamicModule {
	return &DynamicModule{
		ID:          ov.UUID,
		Name:        ov.Name,
		Driver:      ov.Driver,
		Description: ov.Description,
		Version:     ov.Version,
		Config:      ov.Config,
		Module:      ov.Module,
		Profession:  ov.Profession,
		Skill:       ov.Skill,
		Creator:     ov.Creator,
		Updater:     ov.Updater,
		CreateAt:    ov.CreateAt,
		UpdateAt:    ov.UpdateAt,
	}
}

type DynamicModulePublish struct {
	ID            string
	DynamicModule string
	Module        string
	Cluster       string
	Creator       string
	Version       string
	CreateAt      time.Time
}

func FromPublishEntity(ov *dynamic_module.DynamicModulePublish) *DynamicModulePublish {
	return &DynamicModulePublish{
		ID:            ov.UUID,
		DynamicModule: ov.DynamicModule,
		Module:        ov.Module,
		Cluster:       ov.Cluster,
		Version:       ov.Version,
		Creator:       ov.Creator,
		CreateAt:      ov.CreateAt,
	}
}

type CreateDynamicModulePublish struct {
	ID            string
	DynamicModule string
	Module        string
	Cluster       string
	Version       string
}
