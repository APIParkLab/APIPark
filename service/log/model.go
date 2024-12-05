package log

import (
	"time"

	log_source "github.com/APIParkLab/APIPark/stores/log-source"
)

type Save struct {
	ID      string
	Cluster *string
	Config  *string
}

type Source struct {
	ID       string
	Cluster  string
	Driver   string
	Config   string
	Creator  string
	Updater  string
	CreateAt time.Time
	UpdateAt time.Time
}

func FromEntity(ov *log_source.Log) *Source {
	return &Source{
		ID:       ov.UUID,
		Cluster:  ov.Cluster,
		Driver:   ov.Driver,
		Config:   ov.Config,
		Creator:  ov.Creator,
		Updater:  ov.Updater,
		CreateAt: ov.CreateAt,
		UpdateAt: ov.UpdateAt,
	}
}

type Item struct {
	ID            string
	Service       string
	Method        string
	Url           string
	RemoteIP      string
	Consumer      string
	Authorization string
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
