package upstream

import (
	"time"
)

type Item struct {
	UUID       string
	Name       string
	Type       string
	Service    string
	Team       string
	Creator    string
	Updater    string
	Remark     string
	CreateTime time.Time
	UpdateTime time.Time
}

type Upstream struct {
	*Item
}

type SaveUpstream struct {
	UUID    string
	Name    string
	Service string
	Team    string
	Remark  string
}

type ProxyHeader struct {
	Key     string `json:"key,omitempty"`
	Value   string `json:"value,omitempty"`
	OptType string `json:"optType,omitempty"`
}

type NodeConfig struct {
	Address string `json:"address,omitempty"`
	Weight  int    `json:"weight,omitempty"`
}

type DiscoverConfig struct {
	Service  string `json:"service,omitempty"`
	Discover string `json:"discover,omitempty"`
}

type Config struct {
	Balance         string          `json:"balance,omitempty"`
	Timeout         int             `json:"timeout,omitempty"`
	Retry           int             `json:"retry,omitempty"`
	Type            string          `json:"type,omitempty"`
	LimitPeerSecond int             `json:"limit_peer_second,omitempty"`
	ProxyHeaders    []*ProxyHeader  `json:"proxy_headers,omitempty"`
	Scheme          string          `json:"scheme"`
	PassHost        string          `json:"pass_host"`
	UpstreamHost    string          `json:"upstream_host"`
	Nodes           []*NodeConfig   `json:"nodes"`
	Discover        *DiscoverConfig `json:"discover"`
}
