package subscribe

import (
	"reflect"

	"github.com/eolinker/go-common/autowire"
	"github.com/eolinker/go-common/store"
)

type ISubscribeStore interface {
	store.ISearchStore[Subscribe]
}

type imlSubscribeStore struct {
	store.SearchStore[Subscribe]
}

type ISubscribeApplyStore interface {
	store.ISearchStore[Apply]
}

type imlSubscribeApplyStore struct {
	store.SearchStore[Apply]
}

func init() {
	autowire.Auto[ISubscribeStore](func() reflect.Value {
		return reflect.ValueOf(new(imlSubscribeStore))
	})

	autowire.Auto[ISubscribeApplyStore](func() reflect.Value {
		return reflect.ValueOf(new(imlSubscribeApplyStore))
	})
}
