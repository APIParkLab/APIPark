package strategy

import (
	"reflect"

	"github.com/eolinker/go-common/autowire"
	"github.com/eolinker/go-common/store"
)

type IStrategyStore store.ISearchStore[Strategy]

type imlStrategyStore struct {
	store.SearchStore[Strategy]
}

func init() {
	autowire.Auto[IStrategyStore](func() reflect.Value {
		return reflect.ValueOf(new(imlStrategyStore))
	})
}
