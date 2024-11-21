package strategy_dto

import (
	"encoding/json"

	"github.com/APIParkLab/APIPark/service/strategy"
	"github.com/eolinker/go-common/auto"
)

func ToStrategyItem(s *strategy.Strategy, publishVersion string) *StrategyItem {
	publishStatus := PublishStatusOffline
	if publishVersion != "" {
		if s.IsDelete {
			publishStatus = PublishStatusDelete
		} else {
			version := s.UpdateAt.Format("20060102150405")
			if version != publishVersion {
				publishStatus = PublishStatusUpdate
			} else {
				publishStatus = PublishStatusOnline
			}
		}
	}
	return &StrategyItem{
		Id:             s.Id,
		Name:           s.Name,
		Priority:       0,
		Desc:           s.Desc,
		Filters:        "",
		Updater:        auto.UUID(s.Updater),
		UpdateTime:     auto.TimeLabel(s.UpdateAt),
		ProcessedTotal: 0,
		PublishStatus:  publishStatus,
		IsStop:         s.IsStop,
	}
}

func ToStrategy(s *strategy.Strategy) *Strategy {
	filters := make([]*Filter, 0)
	json.Unmarshal([]byte(s.Filters), &filters)
	var cfg interface{}
	json.Unmarshal([]byte(s.Config), &cfg)
	return &Strategy{
		Id:       s.Id,
		Name:     s.Name,
		Priority: s.Priority,
		Desc:     s.Desc,
		Filters:  filters,
		Config:   cfg,
	}
}

type Strategy struct {
	Id       string      `json:"id"`
	Name     string      `json:"name"`
	Priority int         `json:"priority"`
	Desc     string      `json:"desc"`
	Filters  []*Filter   `json:"filters"`
	Config   interface{} `json:"config"`
}

type StrategyItem struct {
	Id             string         `json:"id"`
	Name           string         `json:"name"`
	Priority       int            `json:"priority"`
	Desc           string         `json:"desc"`
	Filters        string         `json:"filters"`
	Updater        auto.Label     `json:"updater" aolabel:"user"`
	UpdateTime     auto.TimeLabel `json:"update_time"`
	ProcessedTotal int            `json:"processed_total"`
	PublishStatus  string         `json:"publish_status"`
	IsStop         bool           `json:"is_stop"`
}
