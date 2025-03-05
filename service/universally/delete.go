package universally

import (
	"context"
	"errors"
	"fmt"

	"github.com/eolinker/go-common/auto"
	"github.com/eolinker/go-common/store"
	"github.com/eolinker/go-common/utils"
	"gorm.io/gorm"
)

var _ IServiceDelete = (*imlServiceDelete[any])(nil)

type IServiceDelete interface {
	Delete(ctx context.Context, uuid string) error
}

type imlServiceDelete[E any] struct {
	store store.ISearchStore[E]
}

func NewDelete[E any](store store.ISearchStore[E]) IServiceDelete {
	assert(new(E))
	return &imlServiceDelete[E]{store: store}
}

func NewSoftDelete[E any](s store.ISearchStore[E]) IServiceDelete {
	assert(new(E))
	return &imlServiceSoftDelete[E]{store: s}
}

func (p *imlServiceDelete[E]) Delete(ctx context.Context, uuid string) error {
	return p.store.Transaction(ctx, func(ctx context.Context) error {
		o, err := p.store.First(ctx, map[string]interface{}{"uuid": uuid})
		if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
			return err
		}
		if o == nil {
			return fmt.Errorf("partition %s not exists", uuid)
		}

		_, err = p.store.DeleteWhere(ctx, map[string]interface{}{"uuid": uuid})
		if err != nil {
			return err
		}
		return p.store.SetLabels(ctx, idValue(o))
	})
}

type imlServiceSoftDelete[E any] struct {
	store store.ISearchStore[E]
}

func (p *imlServiceSoftDelete[E]) Delete(ctx context.Context, uuid string) error {
	operator := utils.UserId(ctx)
	return p.store.Transaction(ctx, func(ctx context.Context) error {
		o, err := p.store.First(ctx, map[string]interface{}{"uuid": uuid})
		if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
			return err
		}
		if o == nil {
			return fmt.Errorf("partition %s not exists", uuid)
		}

		auto.Auto("operator", operator, o)
		return p.store.SoftDelete(ctx, map[string]interface{}{"uuid": uuid})
	})
}
