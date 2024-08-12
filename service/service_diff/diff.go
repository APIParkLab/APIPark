package service_diff

import (
	"github.com/APIParkLab/APIPark/service/upstream"
)

type StatusType int

const (
	StatusOK    StatusType = iota
	StatusUnset            // 未设置
	StatusLoss
)

type Status struct {
	Proxy StatusType `json:"proxy_status,omitempty"`
	Doc   StatusType `json:"doc_status,omitempty"`
	//Upstream StatusType `json:"upstream_status,omitempty"`
}

type ApiDiff struct {
	APi      string     `json:"api,omitempty"`
	Upstream string     `json:"upstream,omitempty"`
	Name     string     `json:"name,omitempty"`
	Method   string     `json:"method,omitempty"`
	Path     string     `json:"path,omitempty"`
	Change   ChangeType `json:"change,omitempty"`
	Status   Status     `json:"status,omitempty"`
}
type UpstreamConfig struct {
	Addr []string `json:"addr"`
}
type UpstreamDiff struct {
	Upstream string `json:"upstream,omitempty" `
	//Partition string           `json:"partition,omitempty"`
	Data   *upstream.Config `json:"data,omitempty"`
	Change ChangeType       `json:"change,omitempty"`
	Status StatusType       `json:"status,omitempty"`
}

type Diff struct {
	Clusters  []string        `json:"clusters,omitempty"`
	Apis      []*ApiDiff      `json:"apis"`
	Upstreams []*UpstreamDiff `json:"upstreams"`
}
