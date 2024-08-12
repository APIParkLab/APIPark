package application_authorization_dto

import "github.com/eolinker/go-common/auto"

type Authorization struct {
	UUID           string                 `json:"id"`
	Name           string                 `json:"name"`
	Driver         string                 `json:"driver"`
	Position       string                 `json:"position"`
	TokenName      string                 `json:"token_name"`
	Config         map[string]interface{} `json:"config"`
	ExpireTime     int64                  `json:"expire_time"`
	HideCredential bool                   `json:"hide_credential"`
}

type AuthorizationItem struct {
	Id             string         `json:"id"`
	Name           string         `json:"name"`
	Driver         string         `json:"driver"`
	ExpireTime     int64          `json:"expire_time"`
	Position       string         `json:"position"`
	TokenName      string         `json:"token_name"`
	Creator        auto.Label     `json:"creator" aolabel:"user"`
	Updater        auto.Label     `json:"updater" aolabel:"user"`
	CreateTime     auto.TimeLabel `json:"create_time"`
	UpdateTime     auto.TimeLabel `json:"update_time"`
	HideCredential bool           `json:"hide_credential"`
}

type DetailItem struct {
	Key   string `json:"key"`
	Value string `json:"value"`
}
