package service_doc

import (
	"context"
	"github.com/APIParkLab/APIPark/service/universally/commit"
	"reflect"

	"github.com/eolinker/go-common/autowire"
)

type IDocService interface {
	Get(ctx context.Context, sid string) (*Doc, error)
	Save(ctx context.Context, input *SaveDoc) error
	List(ctx context.Context, sids ...string) ([]*Doc, error)
	Map(ctx context.Context, sids ...string) (map[string]*Doc, error)
	IDocCommitService
}

type IDocCommitService interface {
	CommitDoc(ctx context.Context, serviceId string, data *Doc) error
	GetDocCommit(ctx context.Context, commitId string) (*commit.Commit[DocCommit], error)
	// LatestDocCommit 获取最新文档
	LatestDocCommit(ctx context.Context, serviceId string) (*commit.Commit[DocCommit], error)
	ListLatestDocCommit(ctx context.Context, serviceIds ...string) ([]*commit.Commit[DocCommit], error)
	ListDocCommit(ctx context.Context, commitIds ...string) ([]*commit.Commit[DocCommit], error)
}

func init() {
	autowire.Auto[IDocService](func() reflect.Value {
		return reflect.ValueOf(new(imlDocService))
	})

	commit.InitCommitWithKeyService[DocCommit]("service", "service_doc")
}
