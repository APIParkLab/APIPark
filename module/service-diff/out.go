package service_diff

import (
	"github.com/APIParkLab/APIPark/service/api"
	api_doc "github.com/APIParkLab/APIPark/service/api-doc"
	"github.com/APIParkLab/APIPark/service/service_diff"
	"github.com/APIParkLab/APIPark/service/strategy"
	"github.com/APIParkLab/APIPark/service/universally/commit"
	"github.com/APIParkLab/APIPark/service/upstream"
)

type DiffOut struct {
	Routers    []*RouterDiffOut   `json:"routers"`
	Upstreams  []*UpstreamDiffOut `json:"upstreams"`
	Strategies []*StrategyDiffOut `json:"strategies"`
}

type RouterDiffOut struct {
	Name        string                  `json:"name,omitempty"`
	Methods     []string                `json:"methods,omitempty"`
	Protocols   []string                `json:"protocols,omitempty"`
	Path        string                  `json:"path,omitempty"`
	Description string                  `json:"description"`
	Change      service_diff.ChangeType `json:"change,omitempty"`
	Status      service_diff.Status     `json:"status,omitempty"`
	Disable     bool                    `json:"disable,omitempty"`
}
type UpstreamDiffOut struct {
	Change service_diff.ChangeType `json:"change,omitempty"`
	Status service_diff.StatusType `json:"status,omitempty"`
	Type   string                  `json:"type,omitempty"`
	Addr   []string                `json:"addr,omitempty"`
}

type StrategyDiffOut struct {
	Name     string                  `json:"name"`
	Priority int                     `json:"priority"`
	Change   service_diff.ChangeType `json:"change,omitempty"`
	Status   service_diff.StatusType `json:"status,omitempty"`
}

type projectInfo struct {
	id string
	//apis              []*api.Info
	apiRequestCommits []*commit.Commit[api.Request]
	apiProxyCommits   []*commit.Commit[api.Proxy]
	apiDocCommits     []*commit.Commit[api_doc.DocCommit]
	upstreamCommits   []*commit.Commit[upstream.Config]
	strategyCommits   []*commit.Commit[strategy.Commit]
}
