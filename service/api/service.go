package api

import (
	"context"
	"reflect"

	"github.com/APIParkLab/APIPark/service/universally/commit"

	"github.com/APIParkLab/APIPark/service/universally"
	"github.com/eolinker/go-common/autowire"
)

type IAPIService interface {
	universally.IServiceGet[API]
	universally.IServiceDelete
	CountByService(ctx context.Context, service string) (int64, error)
	CountMapByService(ctx context.Context, service ...string) (map[string]int64, error)
	Exist(ctx context.Context, aid string, api *Exist) error
	ListForService(ctx context.Context, serviceId string) ([]*API, error)
	GetInfo(ctx context.Context, aid string) (*Info, error)
	ListInfo(ctx context.Context, aids ...string) ([]*Info, error)
	ListInfoForService(ctx context.Context, serviceId string) ([]*Info, error)
	ListLatestCommitProxy(ctx context.Context, aid ...string) ([]*commit.Commit[Proxy], error)
	LatestProxy(ctx context.Context, aid string) (*commit.Commit[Proxy], error)
	GetProxyCommit(ctx context.Context, commitId string) (*commit.Commit[Proxy], error)
	ListProxyCommit(ctx context.Context, commitId ...string) ([]*commit.Commit[Proxy], error)
	SaveProxy(ctx context.Context, aid string, data *Proxy) error
	Save(ctx context.Context, id string, model *Edit) error
	Create(ctx context.Context, input *Create) (err error)
}

var (
	_ IAPIService = (*imlAPIService)(nil)
)

func init() {
	autowire.Auto[IAPIService](func() reflect.Value {
		return reflect.ValueOf(new(imlAPIService))
	})

	commit.InitCommitWithKeyService[Proxy]("api", string(HistoryProxy))

}
