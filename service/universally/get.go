package universally

import (
	"context"
	"errors"
	"strings"

	"gorm.io/gorm"

	"github.com/eolinker/go-common/store"
	"github.com/eolinker/go-common/utils"
)

var (
	_ IServiceGet[any] = (*imlServiceGet[any, any])(nil)
)

type IServiceGet[T any] interface {
	Get(ctx context.Context, uuid string) (*T, error)
	List(ctx context.Context, uuids ...string) ([]*T, error)

	Search(ctx context.Context, keyword string, condition map[string]interface{}, sortRule ...string) ([]*T, error)
	Count(ctx context.Context, keyword string, condition map[string]interface{}) (int64, error)
	//CountByGroup(ctx context.Context, keyword string, condition map[string]interface{}, groupBy string) (map[string]int64, error)
	SearchByPage(ctx context.Context, keyword string, condition map[string]interface{}, page int, pageSize int, sortRule ...string) ([]*T, int64, error)
}

type imlServiceGet[T any, E any] struct {
	store          store.ISearchStore[E]
	toModelHandler func(*E) *T
}

func NewGet[T any, E any](store store.ISearchStore[E], toModelHandler func(*E) *T) IServiceGet[T] {

	return &imlServiceGet[T, E]{store: store, toModelHandler: toModelHandler}
}

func (s *imlServiceGet[T, E]) Get(ctx context.Context, uuid string) (*T, error) {
	where := map[string]interface{}{
		"uuid": uuid,
	}

	v, err := s.store.First(ctx, where)
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}
	if v == nil || errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, gorm.ErrRecordNotFound
	}

	return s.toModelHandler(v), nil
}
func (s *imlServiceGet[T, E]) List(ctx context.Context, uuids ...string) ([]*T, error) {
	where := make([]string, 0, 2)
	args := make([]interface{}, 0, 2)

	if len(uuids) > 0 {
		if len(uuids) == 1 {
			where = append(where, "uuid = ?")
			args = append(args, uuids[0])
		} else {
			where = append(where, "uuid in (?)")
			args = append(args, uuids)
		}
	}

	list, err := s.store.ListQuery(ctx, strings.Join(where, " and "), args, "name asc")
	if err != nil {
		return nil, err
	}
	return utils.SliceToSlice(list, s.toModelHandler), nil
}
func (s *imlServiceGet[T, E]) Search(ctx context.Context, keyword string, condition map[string]interface{}, sortRule ...string) ([]*T, error) {
	ps, err := s.store.Search(ctx, keyword, condition, sortRule...)
	if err != nil {
		return nil, err
	}
	return utils.SliceToSlice(ps, s.toModelHandler), nil
}

func (s *imlServiceGet[T, E]) SearchByPage(ctx context.Context, keyword string, condition map[string]interface{}, page int, pageSize int, sortRule ...string) ([]*T, int64, error) {
	ps, total, err := s.store.SearchByPage(ctx, keyword, condition, page, pageSize, sortRule...)
	if err != nil {
		return nil, 0, err
	}
	return utils.SliceToSlice(ps, s.toModelHandler), total, nil
}

func (s *imlServiceGet[T, E]) Count(ctx context.Context, keyword string, condition map[string]interface{}) (int64, error) {
	return s.store.Count(ctx, keyword, condition)
}

func (s *imlServiceGet[T, E]) CountByGroup(ctx context.Context, keyword string, condition map[string]interface{}, groupBy string) (map[string]int64, error) {
	return s.store.CountByGroup(ctx, keyword, condition, groupBy)
}
