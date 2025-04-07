package system

import (
	"reflect"

	"github.com/eolinker/go-common/autowire"
	"github.com/eolinker/go-common/store"
)

type IAPIKeyStore interface {
	store.ISearchStore[APIKey]
}

type imlAPIKeyStore struct {
	store.SearchStore[APIKey]
}

func init() {
	autowire.Auto[IAPIKeyStore](func() reflect.Value {
		return reflect.ValueOf(new(imlAPIKeyStore))
	})
}
