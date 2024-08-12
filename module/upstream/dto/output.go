package upstream_dto

type UpstreamConfig *Upstream

type Upstream struct {
	Type            string          `json:"driver"`
	Balance         string          `json:"balance"`
	Timeout         int             `json:"timeout"`
	Retry           int             `json:"retry"`
	Remark          string          `json:"remark"`
	LimitPeerSecond int             `json:"limit_peer_second"`
	ProxyHeaders    []*ProxyHeader  `json:"proxy_headers"`
	Scheme          string          `json:"scheme"`
	PassHost        string          `json:"pass_host"`
	UpstreamHost    string          `json:"upstream_host"`
	Nodes           []*NodeConfig   `json:"nodes"`
	Discover        *DiscoverConfig `json:"discover"`
}

type NodeConfig struct {
	Address string `json:"address"`
	Weight  int    `json:"weight"`
}

type DiscoverConfig struct {
	Discover string `json:"discover"`
	Service  string `json:"service"`
}

type ProxyHeader struct {
	Key     string `json:"key"`
	Value   string `json:"value"`
	OptType string `json:"opt_type"`
}
