package api

import (
	"reflect"

	"github.com/eolinker/go-common/autowire"
	"github.com/eolinker/go-common/store"
)

type IApiBaseStore interface {
	store.ISearchStore[Api]
}
type IAPIInfoStore store.IBaseStore[Info]
type imlApiBaseStore struct {
	store.SearchStoreSoftDelete[Api]
}

func init() {

	autowire.Auto[IApiBaseStore](func() reflect.Value {
		return reflect.ValueOf(new(imlApiBaseStore))
	})
	autowire.Auto[IAPIInfoStore](func() reflect.Value {
		return reflect.ValueOf(new(store.Store[Info]))
	})
}
