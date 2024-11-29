package release

import (
	"context"
	"reflect"

	"github.com/APIParkLab/APIPark/service/api"
	"github.com/APIParkLab/APIPark/service/universally/commit"
	"github.com/APIParkLab/APIPark/service/upstream"
	"github.com/eolinker/go-common/autowire"
)

type IReleaseService interface {
	// GetRelease 获取发布信息
	GetRelease(ctx context.Context, id string) (*Release, error)
	// CreateRelease 创建发布
	CreateRelease(ctx context.Context, service, version, remark string, apiRequestCommit, apisProxyCommits map[string]string, apiDocCommits, serviceDocCommits string, upstreams map[string]map[string]string, strategies map[string]string) (*Release, error)
	// DeleteRelease 删除发布
	DeleteRelease(ctx context.Context, id string) error
	List(ctx context.Context, service string) ([]*Release, error)
	GetReleaseInfos(ctx context.Context, id string) ([]*APICommit, []*APICommit, *APICommit, []*UpstreamCommit, *ServiceCommit, error)
	GetCommits(ctx context.Context, id string) ([]*ProjectCommits, error)
	GetRunningApiDocCommits(ctx context.Context, serviceIds ...string) ([]string, error)
	GetRunningApiProxyCommit(ctx context.Context, service string, apiUUID string) (string, error)
	Completeness(partitions []string, apis []string, requestCommits []*commit.Commit[api.Request], proxyCommits []*commit.Commit[api.Proxy], upstreamCommits []*commit.Commit[upstream.Config]) bool

	// GetRunning gets the running release with the given service.
	//
	// ctx: the context
	// service: the service name
	// Return type(s): *Release, error
	GetRunning(ctx context.Context, service string) (*Release, error)

	SetRunning(ctx context.Context, service string, id string) error
	CheckNewVersion(ctx context.Context, service string, version string) (bool, error)
}

func init() {
	autowire.Auto[IReleaseService](func() reflect.Value {
		return reflect.ValueOf(new(imlReleaseService))
	})
}
