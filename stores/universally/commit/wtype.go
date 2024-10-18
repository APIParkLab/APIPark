package commit

import (
	"context"
)

var (
	_ ICommitWKStore[any] = (*StoreWidthType[any])(nil)
)

type ICommitWKStore[H any] interface {
	Save(ctx context.Context, target string, h *H) error
	Latest(ctx context.Context, target ...string) ([]*Commit[H], error)
	Get(ctx context.Context, uuid string) (*Commit[H], error)
	List(ctx context.Context, uuids ...string) ([]*Commit[H], error)
}
type StoreWidthType[H any] struct {
	Store[H]
	key string
}

func NewCommitWithKey[H any](name, key string) *StoreWidthType[H] {
	return &StoreWidthType[H]{
		Store: Store[H]{
			latestTableName: name + "_latest",
			commitTableName: name + "_commit",
			name:            name,
		},
		key: key,
	}
}
func (h *StoreWidthType[H]) List(ctx context.Context, uuids ...string) ([]*Commit[H], error) {
	return h.Store.List(ctx, uuids...)
}
func (h *StoreWidthType[H]) Save(ctx context.Context, target string, commit *H) error {
	return h.Store.Save(ctx, h.key, target, commit)
}
func (h *StoreWidthType[H]) Latest(ctx context.Context, target ...string) ([]*Commit[H], error) {
	return h.Store.Latest(ctx, h.key, target...)
}
func (h *StoreWidthType[H]) Get(ctx context.Context, uuid string) (*Commit[H], error) {
	return h.Store.Get(ctx, uuid)
}
