package commit

import (
	"context"
	"reflect"

	"github.com/APIParkLab/APIPark/stores/universally/commit"
	"github.com/eolinker/go-common/autowire"
)

type ICommitWithKeyService[T any] interface {
	Latest(ctx context.Context, target string) (*Commit[T], error)
	ListLatest(ctx context.Context, target ...string) ([]*Commit[T], error)
	Save(ctx context.Context, target string, data *T) error
	Get(ctx context.Context, uuid string) (*Commit[T], error)
	List(ctx context.Context, uuids ...string) ([]*Commit[T], error)
}

func InitCommitWithKeyService[T any](name string, key string) {
	autowire.Auto[commit.ICommitWKStore[T]](func() reflect.Value {

		return reflect.ValueOf(commit.NewCommitWithKey[T](name, key))
	})
	autowire.Auto[ICommitWithKeyService[T]](func() reflect.Value {
		return reflect.ValueOf(&imlCommitWithKeyService[T]{})
	})
}

type ICommitService[T any] interface {
	Latest(ctx context.Context, target string, key string) (*Commit[T], error)
	ListLatest(ctx context.Context, key string, target ...string) ([]*Commit[T], error)
	Save(ctx context.Context, target string, key string, data *T) error
	Get(ctx context.Context, uuid string) (*Commit[T], error)
	List(ctx context.Context, uuids ...string) ([]*Commit[T], error)
}

func InitCommitService[T any](name string) {
	autowire.Auto[commit.ICommitStore[T]](func() reflect.Value {
		return reflect.ValueOf(commit.NewCommitStore[T](name))
	})
	autowire.Auto[ICommitService[T]](func() reflect.Value {
		return reflect.ValueOf(&imlCommitService[T]{})
	})
}
