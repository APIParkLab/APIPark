package service_diff

import (
	"github.com/APIParkLab/APIPark/service/api"
	"github.com/APIParkLab/APIPark/service/service_diff"
	"github.com/APIParkLab/APIPark/service/universally/commit"
	"github.com/APIParkLab/APIPark/service/upstream"
	"github.com/eolinker/go-common/auto"
)

type DiffOut struct {
	Apis      []*ApiDiffOut      `json:"apis"`
	Upstreams []*UpstreamDiffOut `json:"upstreams"`
}

type ApiDiffOut struct {
	Api    auto.Label `json:"api,omitempty" aolabel:"api"`
	Name   string     `json:"name,omitempty"`
	Method string     `json:"method,omitempty"`
	Path   string     `json:"path,omitempty"`
	//Upstream auto.Label              `json:"upstream,omitempty" aolabel:"upstream"`
	Change service_diff.ChangeType `json:"change,omitempty"`
	Status service_diff.Status     `json:"status,omitempty"`
}
type UpstreamDiffOut struct {
	Change service_diff.ChangeType `json:"change,omitempty"`
	Status service_diff.StatusType `json:"status,omitempty"`
	Type   string                  `json:"type,omitempty"`
	Addr   []string                `json:"addr,omitempty"`
}

//
//func CreateOut(d *project_diff.Diff) *DiffOut {
//	if d == nil {
//		return nil
//	}
//	return &DiffOut{
//		Apis: utils.SliceToSlice(d.Apis, func(s *project_diff.ApiDiff) *ApiDiffOut {
//			return &ApiDiffOut{
//				Name:     s.Name,
//				Methods:   s.Methods,
//				Path:     s.Path,
//				Upstream: s.Upstream,
//				Change:   s.Change,
//			}
//		}),
//		Upstreams: utils.SliceToSlice(d.Upstreams, func(s *project_diff.UpstreamDiff) *UpstreamDiffOut {
//			return &UpstreamDiffOut{
//				Upstream:  s.Name,
//				Cluster: auto.UUID(s.Cluster),
//				Cluster:   auto.UUID(s.Cluster),
//				Change:    s.Change,
//				Type:      s.Type,
//				Addr:      s.Addr,
//			}
//		}),
//	}
//}

type projectInfo struct {
	id              string
	apis            []*api.Info
	apiCommits      []*commit.Commit[api.Proxy]
	apiDocs         []*commit.Commit[api.Document]
	upstreamCommits []*commit.Commit[upstream.Config]
}
