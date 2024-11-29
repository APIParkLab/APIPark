package upstream

import (
	"context"
	"reflect"

	"github.com/APIParkLab/APIPark/service/universally/commit"
	"github.com/eolinker/go-common/autowire"
)

type IUpstreamService interface {
	Get(ctx context.Context, id string) (*Upstream, error)
	Save(ctx context.Context, upstream *SaveUpstream) error
	Delete(ctx context.Context, id string) error
	List(ctx context.Context, serviceIds ...string) ([]*Upstream, error)
	LatestCommit(ctx context.Context, uid string, clusterId string) (*commit.Commit[Config], error)
	ListLatestCommit(ctx context.Context, clusterId string, serviceIds ...string) ([]*commit.Commit[Config], error)
	SaveCommit(ctx context.Context, uid string, partition string, cfg *Config) error
	GetCommit(ctx context.Context, uuid string) (*commit.Commit[Config], error)
	ListCommit(ctx context.Context, uuid ...string) ([]*commit.Commit[Config], error)
}

func init() {
	autowire.Auto[IUpstreamService](func() reflect.Value {
		return reflect.ValueOf(new(imlUpstreamService))
	})
	commit.InitCommitService[Config]("upstream")

}
