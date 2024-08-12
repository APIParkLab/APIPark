package universally

import (
	"context"
	"github.com/eolinker/go-common/utils"

	"github.com/eolinker/go-common/auto"
	"github.com/eolinker/go-common/store"
)

var (
	_ IServiceEdit[any] = (*imlServiceEdit[any, any])(nil)
)

type IServiceEdit[INPUT any] interface {
	Save(ctx context.Context, id string, model *INPUT, appendLabels ...string) error
}

type imlServiceEdit[INPUT any, E any] struct {
	store         store.ISearchStore[E]
	updateHandler func(e *E, model *INPUT)
	labelHandler  []func(model *E) []string
}

func NewEdit[INPUT any, E any](st store.ISearchStore[E], updateHandler func(e *E, model *INPUT), labels ...func(model *E) []string) IServiceEdit[INPUT] {
	assert(new(E))

	return &imlServiceEdit[INPUT, E]{store: st, updateHandler: updateHandler, labelHandler: labels}
}

func (p *imlServiceEdit[INPUT, E]) Save(ctx context.Context, id string, model *INPUT, appendLabels ...string) error {
	operator := utils.UserId(ctx)
	return p.store.Transaction(ctx, func(ctx context.Context) error {
		ev, err := p.store.First(ctx, map[string]interface{}{
			"uuid": id,
		})
		if err != nil {
			return err
		}

		auto.Auto("updater", operator, ev)
		p.updateHandler(ev, model)
		err = p.store.Save(ctx, ev)
		if err != nil {
			return err
		}
		labels := appendLabels
		for _, hd := range p.labelHandler {
			labels = append(labels, hd(ev)...)
		}

		return p.store.SetLabels(ctx, idValue(ev), labels...)

	})
}
