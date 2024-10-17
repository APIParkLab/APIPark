package ai

import (
	"github.com/eolinker/go-common/autowire"
	"github.com/eolinker/go-common/store"
	"reflect"
)

type IProviderStore interface {
	store.ISearchStore[Provider]
}

type imlProviderStore struct {
	store.SearchStore[Provider]
}

func init() {
	autowire.Auto[IProviderStore](func() reflect.Value {
		return reflect.ValueOf(new(imlProviderStore))
	})
}
