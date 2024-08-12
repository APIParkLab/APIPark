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
	Exist(ctx context.Context, aid string, api *ExistAPI) error
	ListForService(ctx context.Context, serviceId string) ([]*API, error)
	GetInfo(ctx context.Context, aid string) (*Info, error)
	ListInfo(ctx context.Context, aids ...string) ([]*Info, error)
	ListInfoForService(ctx context.Context, serviceId string) ([]*Info, error)
	ListLatestCommitProxy(ctx context.Context, aid ...string) ([]*commit.Commit[Proxy], error)
	ListLatestCommitDocument(ctx context.Context, aid ...string) ([]*commit.Commit[Document], error)
	LatestProxy(ctx context.Context, aid string) (*commit.Commit[Proxy], error)
	LatestDocument(ctx context.Context, aid string) (*commit.Commit[Document], error)
	GetProxyCommit(ctx context.Context, commitId string) (*commit.Commit[Proxy], error)
	ListProxyCommit(ctx context.Context, commitId ...string) ([]*commit.Commit[Proxy], error)
	GetDocumentCommit(ctx context.Context, commitId string) (*commit.Commit[Document], error)
	ListDocumentCommit(ctx context.Context, commitId ...string) ([]*commit.Commit[Document], error)
	SaveProxy(ctx context.Context, aid string, data *Proxy) error
	SaveDocument(ctx context.Context, aid string, data *Document) error
	Save(ctx context.Context, id string, model *EditAPI) error
	Create(ctx context.Context, input *CreateAPI) (err error)
}

var (
	_ IAPIService = (*imlAPIService)(nil)
)

func init() {
	autowire.Auto[IAPIService](func() reflect.Value {
		return reflect.ValueOf(new(imlAPIService))
	})
	
	commit.InitCommitWithKeyService[Proxy]("api", string(HistoryProxy))
	commit.InitCommitWithKeyService[Document]("api", string(HistoryDocument))
}
