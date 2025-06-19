package release

import (
	"time"

	"github.com/APIParkLab/APIPark/stores/release"
)

type Release struct {
	UUID     string
	Service  string
	Version  string
	Remark   string
	Creator  string
	CreateAt time.Time
}

func FromEntity(e *release.Release) *Release {
	return &Release{
		UUID:     e.UUID,
		Service:  e.Service,
		Version:  e.Name,
		Remark:   e.Remark,
		Creator:  e.Creator,
		CreateAt: e.CreateAt,
	}
}

type Update struct {
	Version  *string
	Remark   *string
	APICount *int64 // API数量
}

type APICommit struct {
	Release string
	API     string
	Commit  string
}

type ServiceCommit struct {
	Release string
	Service string
	Commit  string
}

type UpstreamCommit struct {
	Release   string
	Upstream  string
	Partition string
	Commit    string
}

type ProjectCommits struct {
	Release string
	Type    string
	Target  string
	Key     string
	Commit  string
}

//type Diff struct {
//	Routers      []*APiDiff      `json:"apis"`
//	Upstreams []*UpstreamDiff `json:"upstream"`
//}

//type APiDiff struct {
//	Api string `json:"api,omitempty"`
//
//	Change project_diff.ChangeType `json:"change,omitempty"`
//}
//
//type UpstreamDiff struct {
//	UpstreamCommit  string                  `json:"upstream,omitempty"`
//	Cluster string                  `json:"partition,omitempty"`
//	Commit    string                  `json:"commit,omitempty"`
//	Change    project_diff.ChangeType `json:"change,omitempty"`
//}
