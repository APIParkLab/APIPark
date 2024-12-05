package strategy_dto

import (
	"encoding/json"
	"time"

	"github.com/APIParkLab/APIPark/service/strategy"
	"github.com/eolinker/go-common/auto"
)

func StrategyStatus(s *strategy.Strategy, publishVersion string) string {
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
	return publishStatus
}

func ToStrategyItem(s *strategy.Strategy, publishVersion string, filters string, processedTotal int64) *StrategyItem {
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
		Priority:       s.Priority,
		Desc:           s.Desc,
		Filters:        filters,
		Updater:        auto.UUID(s.Updater),
		UpdateTime:     auto.TimeLabel(s.UpdateAt),
		ProcessedTotal: processedTotal,
		PublishStatus:  publishStatus,
		IsStop:         s.IsStop,
		IsDelete:       s.IsDelete,
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
		IsDelete: s.IsDelete || s.IsStop,
	}
}

type Strategy struct {
	Id       string      `json:"id"`
	Name     string      `json:"name"`
	Priority int         `json:"priority"`
	Desc     string      `json:"desc"`
	Filters  []*Filter   `json:"filters"`
	Config   interface{} `json:"config"`
	IsDelete bool        `json:"is_delete"`
}

type StrategyItem struct {
	Id             string         `json:"id"`
	Name           string         `json:"name"`
	Priority       int            `json:"priority"`
	Desc           string         `json:"desc"`
	Filters        string         `json:"filters"`
	Updater        auto.Label     `json:"updater" aolabel:"user"`
	UpdateTime     auto.TimeLabel `json:"update_time"`
	ProcessedTotal int64          `json:"processed_total"`
	PublishStatus  string         `json:"publish_status"`
	IsStop         bool           `json:"is_stop"`
	IsDelete       bool           `json:"is_delete"`
}

type FilterOption struct {
	Name    string   `json:"name"`
	Title   string   `json:"title"`
	Type    string   `json:"type"`
	Pattern string   `json:"pattern"`
	Options []string `json:"options"`
}

type Title struct {
	Field string `json:"field"`
	Title string `json:"title" aoi18n:""`
}

type ToPublishItem struct {
	Name     string    `json:"name"`
	Priority int       `json:"priority"`
	Status   string    `json:"status"`
	OptTime  time.Time `json:"opt_time"`
}

type LogItem struct {
	ID            string         `json:"id"`
	Service       auto.Label     `json:"service" aolabel:"service"`
	Method        string         `json:"method"`
	Url           string         `json:"url"`
	RemoteIP      string         `json:"remote_ip"`
	Consumer      auto.Label     `json:"consumer" aolabel:"service"`
	Authorization auto.Label     `json:"authorization" aolabel:"service_authorization"`
	RecordTime    auto.TimeLabel `json:"record_time"`
}

type LogInfo struct {
	ID                string `json:"id"`
	ContentType       string `json:"content_type"`
	ProxyResponseBody string `json:"origin"`
	ResponseBody      string `json:"target"`
}
