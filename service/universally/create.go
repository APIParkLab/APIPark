package universally

import (
	"context"
	"errors"
	"fmt"
	"github.com/eolinker/go-common/utils"

	"github.com/eolinker/go-common/auto"
	"github.com/eolinker/go-common/store"
	"gorm.io/gorm"
)

type IServiceCreate[INPUT any] interface {
	Create(ctx context.Context, input *INPUT, appendLabels ...string) (err error)
}

type imlServiceCreate[INPUT any, E any] struct {
	store               store.ISearchStore[E]
	createEntityHandler func(i *INPUT) *E
	labelHandler        []func(*E) []string
	uniquestHandler     func(*INPUT) []map[string]any

	name string
}

func NewCreator[INPUT any, E any](st store.ISearchStore[E], name string, createEntityHandler func(i *INPUT) *E, uniquestHandler func(*INPUT) []map[string]any, labelHandler ...func(*E) []string) IServiceCreate[INPUT] {
	assert(new(E))

	return &imlServiceCreate[INPUT, E]{
		store:               st,
		createEntityHandler: createEntityHandler,
		labelHandler:        labelHandler,
		uniquestHandler:     uniquestHandler,
		name:                name,
	}
}

func (p *imlServiceCreate[INPUT, E]) Create(ctx context.Context, input *INPUT, appendLabels ...string) error {
	operator := utils.UserId(ctx)
	uniquest := p.uniquestHandler(input)

	err := p.store.Transaction(ctx, func(ctx context.Context) error {
		if uniquest != nil {
			// check

			for _, v := range uniquest {

				o, err := p.store.First(ctx, v)
				if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
					return err
				}
				if o != nil {
					return fmt.Errorf("%s %v already exists", p.name, v)
				}
			}
		}

		ne := p.createEntityHandler(input)
		auto.Auto("creator", operator, ne)
		auto.Auto("updater", operator, ne)
		err := p.store.Insert(ctx, ne)
		if err != nil {
			return err
		}
		labels := appendLabels
		for _, hd := range p.labelHandler {
			labels = append(labels, hd(ne)...)
		}
		return p.store.SetLabels(ctx, idValue(ne), labels...)
		//return p.store.SetLabels(ctx, ne.Id, pn.UUID, pn.Name, pn.Url, pn.Prefix, pn.Resume)
	})
	if err != nil {
		return err
	}
	return nil
}
