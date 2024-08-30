package api

import (
	"reflect"

	"github.com/eolinker/go-common/autowire"
	"github.com/eolinker/go-common/store"
)

type IApiBaseStore interface {
	store.ISearchStore[API]
}
type IAPIInfoStore store.IBaseStore[Info]
type imlApiBaseStore struct {
	store.SearchStoreSoftDelete[API]
}

type imlAPIDocStore struct {
	store.Store[Doc]
}

type IAPIDocStore interface {
	store.IBaseStore[Doc]
}

func init() {

	autowire.Auto[IApiBaseStore](func() reflect.Value {
		return reflect.ValueOf(new(imlApiBaseStore))
	})
	autowire.Auto[IAPIInfoStore](func() reflect.Value {
		return reflect.ValueOf(new(store.Store[Info]))
	})
	autowire.Auto[IAPIDocStore](func() reflect.Value {
		return reflect.ValueOf(new(imlAPIDocStore))
	})
}
