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
	CreateRelease(ctx context.Context, service string, version string, remark string, apisProxyCommits, apiDocCommits map[string]string, upstreams map[string]map[string]string) (*Release, error)
	// DeleteRelease 删除发布
	DeleteRelease(ctx context.Context, id string) error
	List(ctx context.Context, service string) ([]*Release, error)
	GetApiProxyCommit(ctx context.Context, id string, apiUUID string) (string, error)
	GetApiDocCommit(ctx context.Context, id string, apiUUID string) (string, error)
	GetReleaseInfos(ctx context.Context, id string) ([]*APIProxyCommit, []*APIDocumentCommit, []*UpstreamCommit, error)
	GetCommits(ctx context.Context, id string) ([]*ProjectCommits, error)
	
	GetRunningApiDocCommit(ctx context.Context, service string, apiUUID string) (string, error)
	GetRunningApiProxyCommit(ctx context.Context, service string, apiUUID string) (string, error)
	Completeness(partitions []string, apis []string, proxyCommits []*commit.Commit[api.Proxy], documentCommits []*commit.Commit[api.Document], upstreamCommits []*commit.Commit[upstream.Config]) bool
	
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
