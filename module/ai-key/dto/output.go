package ai_key_dto

import "github.com/eolinker/go-common/auto"

type Item struct {
	Id         string         `json:"id"`
	Name       string         `json:"name"`
	Status     KeyStatus      `json:"status"`
	UseToken   int            `json:"use_token"`
	UpdateTime auto.TimeLabel `json:"update_time"`
	ExpireTime int            `json:"expire_time"`
	Priority   int            `json:"priority"`
	CanDelete  bool           `json:"can_delete"`
}

type Key struct {
	Id         string `json:"id"`
	Name       string `json:"name"`
	Config     string `json:"config"`
	ExpireTime int    `json:"expire_time"`
}
