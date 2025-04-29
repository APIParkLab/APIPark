package log

import (
	"time"

	log_source "github.com/APIParkLab/APIPark/stores/log-source"
)

type Save struct {
	ID           string
	Cluster      *string
	Config       *string
	LastPullTime *time.Time
}

type Source struct {
	ID           string
	Cluster      string
	Driver       string
	Config       string
	Creator      string
	Updater      string
	CreateAt     time.Time
	UpdateAt     time.Time
	LastPullTime time.Time
}

func FromEntity(ov *log_source.LogSource) *Source {
	return &Source{
		ID:           ov.UUID,
		Cluster:      ov.Cluster,
		Driver:       ov.Driver,
		Config:       ov.Config,
		Creator:      ov.Creator,
		Updater:      ov.Updater,
		LastPullTime: ov.LastPullAt,
		CreateAt:     ov.CreateAt,
		UpdateAt:     ov.UpdateAt,
	}
}

type InsertLog struct {
	ID            string
	Driver        string
	Strategy      string
	Service       string
	API           string
	Method        string
	Url           string
	RemoteIP      string
	Consumer      string
	Authorization string
	InputToken    int64
	OutputToken   int64
	TotalToken    int64
	AIProvider    string
	AIModel       string
	StatusCode    int64
	ResponseTime  int64
	Traffic       int64
	RecordTime    time.Time
}

type Item struct {
	ID            string
	Strategy      string
	Service       string
	API           string
	Method        string
	Url           string
	RemoteIP      string
	Consumer      string
	Authorization string
	InputToken    int64
	OutputToken   int64
	TotalToken    int64
	AIProvider    string
	AIModel       string
	StatusCode    int64
	ResponseTime  int64
	Traffic       int64
	RecordTime    time.Time
}

type Info struct {
	ID                string
	ContentType       string
	RequestBody       string
	ProxyBody         string
	ProxyResponseBody string
	ResponseBody      string
}
