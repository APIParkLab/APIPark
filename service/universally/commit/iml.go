package commit

import (
	"context"

	"github.com/eolinker/go-common/utils"
	"gorm.io/gorm"

	"github.com/APIParkLab/APIPark/stores/universally/commit"
)

var (
	_ ICommitWithKeyService[any] = (*imlCommitWithKeyService[any])(nil)
	_ ICommitService[any]        = (*imlCommitService[any])(nil)
)

type imlCommitWithKeyService[T any] struct {
	store commit.ICommitWKStore[T] `autowired:""`
}

func (i *imlCommitWithKeyService[T]) List(ctx context.Context, uuids ...string) ([]*Commit[T], error) {

	list, err := i.store.List(ctx, uuids...)
	if err != nil {
		return nil, err
	}
	return utils.SliceToSlice(list, newCommit[T]), nil
}

func (i *imlCommitWithKeyService[T]) ListLatest(ctx context.Context, target ...string) ([]*Commit[T], error) {
	list, err := i.store.Latest(ctx, target...)
	if err != nil {
		return nil, err
	}

	return utils.SliceToSlice(list, newCommit[T]), nil
}

func (i *imlCommitWithKeyService[T]) Get(ctx context.Context, uuid string) (*Commit[T], error) {
	r, err := i.store.Get(ctx, uuid)
	if err != nil {
		return nil, err
	}

	return newCommit(r), nil
}

func (i *imlCommitWithKeyService[T]) Latest(ctx context.Context, target string) (*Commit[T], error) {
	list, err := i.ListLatest(ctx, target)
	if err != nil {
		return nil, err
	}
	if len(list) == 0 {
		return nil, gorm.ErrRecordNotFound
	}

	result := list[0]
	return result, nil
}

func (i *imlCommitWithKeyService[T]) Save(ctx context.Context, target string, data *T) error {
	return i.store.Save(ctx, target, data)
}

type imlCommitService[T any] struct {
	store commit.ICommitStore[T] `autowired:""`
}

func (i *imlCommitService[T]) List(ctx context.Context, uuids ...string) ([]*Commit[T], error) {
	list, err := i.store.List(ctx, uuids...)
	if err != nil {
		return nil, err
	}

	return utils.SliceToSlice(list, newCommit[T]), nil

}

func (i *imlCommitService[T]) ListLatest(ctx context.Context, key string, target ...string) ([]*Commit[T], error) {
	list, err := i.store.Latest(ctx, key, target...)
	if err != nil {
		return nil, err
	}
	return utils.SliceToSlice(list, newCommit[T]), nil
}

func (i *imlCommitService[T]) Get(ctx context.Context, uuid string) (*Commit[T], error) {
	r, err := i.store.Get(ctx, uuid)
	if err != nil {
		return nil, err
	}

	return newCommit(r), nil
}

func (i *imlCommitService[T]) Latest(ctx context.Context, target string, key string) (*Commit[T], error) {
	list, err := i.store.Latest(ctx, key, target)
	if err != nil {
		return nil, err
	}
	if len(list) == 0 {
		return nil, gorm.ErrRecordNotFound
	}
	result := list[0]
	return newCommit(result), nil
}

func (i *imlCommitService[T]) Save(ctx context.Context, target string, key string, data *T) error {
	return i.store.Save(ctx, key, target, data)
}
