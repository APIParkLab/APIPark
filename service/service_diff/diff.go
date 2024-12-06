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
	Name     string     `json:"name,omitempty"`
	Method   []string   `json:"method,omitempty"`
	Protocol []string   `json:"protocol,omitempty"`
	Disable  bool       `json:"disable,omitempty"`
	Path     string     `json:"path,omitempty"`
	Change   ChangeType `json:"change"`
	Status   Status     `json:"status"`
}
type UpstreamConfig struct {
	Addr []string `json:"addr"`
}
type UpstreamDiff struct {
	Upstream string `json:"upstream,omitempty" `
	//Cluster string           `json:"partition,omitempty"`
	Data   *upstream.Config `json:"data,omitempty"`
	Change ChangeType       `json:"change"`
	Status StatusType       `json:"status"`
}

type StrategyDiff struct {
	Strategy string     `json:"strategy,omitempty"`
	Name     string     `json:"name"`
	Priority int        `json:"priority"`
	Change   ChangeType `json:"change"`
	Status   StatusType `json:"status"`
}

type Diff struct {
	Clusters   []string        `json:"clusters,omitempty"`
	Apis       []*ApiDiff      `json:"apis"`
	Upstreams  []*UpstreamDiff `json:"upstreams"`
	Strategies []*StrategyDiff `json:"strategies"`
}
