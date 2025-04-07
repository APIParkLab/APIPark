package mcp_dto

import (
	"time"
)

type Service struct {
	Id          string    `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	ServiceKind string    `json:"service_kind"`
	Apis        []*API    `json:"apis"`
	CreateTime  time.Time `json:"create_time"`
	UpdateTime  time.Time `json:"update_time"`
}

type App struct {
	Id          string    `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	CreateTime  time.Time `json:"create_time"`
	UpdateTime  time.Time `json:"update_time"`
}

type API struct {
	Name        string `json:"name"`
	Method      string `json:"method"`
	Path        string `json:"path"`
	Description string `json:"description"`
}

type ServiceAPI struct {
	ServiceID   string      `json:"service_id"`
	ServiceName string      `json:"service_name"`
	APIDoc      interface{} `json:"api_doc"`
}

type AppAuthorization struct {
	Id        string `json:"id"`
	Name      string `json:"name"`
	Position  string `json:"position"`
	TokenName string `json:"token_name"`
	Config    string `json:"config"`
}
