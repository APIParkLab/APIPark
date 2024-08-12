package upstream_dto

import (
	"github.com/APIParkLab/APIPark/service/upstream"
)

func FromProxyHeaders(p []*upstream.ProxyHeader) []*ProxyHeader {
	proxyHeaders := make([]*ProxyHeader, 0, len(p))
	for _, header := range p {
		proxyHeaders = append(proxyHeaders, &ProxyHeader{
			Key:     header.Key,
			Value:   header.Value,
			OptType: header.OptType,
		})
	}
	return proxyHeaders
}

func ToProxyHeaders(p []*ProxyHeader) []*upstream.ProxyHeader {
	proxyHeaders := make([]*upstream.ProxyHeader, 0, len(p))
	for _, header := range p {
		proxyHeaders = append(proxyHeaders, &upstream.ProxyHeader{
			Key:     header.Key,
			Value:   header.Value,
			OptType: header.OptType,
		})
	}
	return proxyHeaders
}

func ConvertUpstream(u *Upstream) *upstream.Config {
	nodes := make([]*upstream.NodeConfig, 0, len(u.Nodes))
	for _, node := range u.Nodes {
		nodes = append(nodes, &upstream.NodeConfig{
			Address: node.Address,
			Weight:  node.Weight,
		})
	}
	discover := &upstream.DiscoverConfig{}
	if u.Discover != nil {
		discover.Discover = u.Discover.Discover
		discover.Service = u.Discover.Service
	}
	return &upstream.Config{
		Balance:         u.Balance,
		Timeout:         u.Timeout,
		Retry:           u.Retry,
		Type:            u.Type,
		LimitPeerSecond: u.LimitPeerSecond,
		ProxyHeaders:    ToProxyHeaders(u.ProxyHeaders),
		Scheme:          u.Scheme,
		PassHost:        u.PassHost,
		UpstreamHost:    u.UpstreamHost,
		Nodes:           nodes,
		Discover:        discover,
	}
}

func FromClusterConfig(c *upstream.Config) *Upstream {
	nodes := make([]*NodeConfig, 0, len(c.Nodes))
	for _, node := range c.Nodes {
		nodes = append(nodes, &NodeConfig{
			Address: node.Address,
			Weight:  node.Weight,
		})
	}
	discover := &DiscoverConfig{}
	if c.Discover != nil {
		discover.Discover = c.Discover.Discover
		discover.Service = c.Discover.Service
	}
	return &Upstream{
		Type:            c.Type,
		Balance:         c.Balance,
		Timeout:         c.Timeout,
		Retry:           c.Retry,
		LimitPeerSecond: c.LimitPeerSecond,
		ProxyHeaders:    FromProxyHeaders(c.ProxyHeaders),
		Scheme:          c.Scheme,
		PassHost:        c.PassHost,
		UpstreamHost:    c.UpstreamHost,
		Nodes:           nodes,
		Discover:        discover,
	}
}
