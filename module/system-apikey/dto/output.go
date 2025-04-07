package system_apikey_dto

import (
	system_apikey "github.com/APIParkLab/APIPark/service/system-apikey"
	"github.com/eolinker/go-common/auto"
)

type APIKey struct {
	*Item
}

type Item struct {
	*SimpleItem
	Creator  auto.Label     `json:"creator" aolabel:"user"`
	Updater  auto.Label     `json:"updater" aolabel:"user"`
	CreateAt auto.TimeLabel `json:"create_time"`
	UpdateAt auto.TimeLabel `json:"update_time"`
}

type SimpleItem struct {
	Id      string `json:"id"`
	Name    string `json:"name"`
	Value   string `json:"value"`
	Expired int64  `json:"expired"`
}

func ToAPIKey(e *system_apikey.APIKey) *APIKey {
	return &APIKey{
		Item: ToAPIKeyItem(e),
	}
}

func ToAPIKeySimpleItem(e *system_apikey.APIKey) *SimpleItem {
	return &SimpleItem{
		Id:      e.Id,
		Name:    e.Name,
		Value:   e.Value,
		Expired: e.Expired,
	}
}

func ToAPIKeyItem(e *system_apikey.APIKey) *Item {
	return &Item{
		SimpleItem: ToAPIKeySimpleItem(e),
		Creator:    auto.UUID(e.Creator),
		Updater:    auto.UUID(e.Updater),
		CreateAt:   auto.TimeLabel(e.CreateAt),
		UpdateAt:   auto.TimeLabel(e.UpdateAt),
	}
}
