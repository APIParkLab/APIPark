package service

import (
	"github.com/eolinker/go-common/autowire"
	"github.com/eolinker/go-common/store"
)
import "reflect"

type IServiceStore interface {
	store.ISearchStore[Service]
}
type imlServiceStore struct {
	store.SearchStore[Service]
}

type IServiceTagStore interface {
	store.IBaseStore[Tag]
}

type imlServiceTagStore struct {
	store.Store[Tag]
}

type IServiceDocStore interface {
	store.ISearchStore[Doc]
}

type imlServiceDocStore struct {
	store.SearchStore[Doc]
}

type IAuthorizationStore interface {
	store.ISearchStore[Authorization]
}

type imlAuthorizationStore struct {
	store.SearchStore[Authorization]
}

func init() {
	autowire.Auto[IServiceStore](func() reflect.Value {
		return reflect.ValueOf(new(imlServiceStore))
	})
	autowire.Auto[IAuthorizationStore](func() reflect.Value {
		return reflect.ValueOf(new(imlAuthorizationStore))
	})
	autowire.Auto[IServiceTagStore](func() reflect.Value {
		return reflect.ValueOf(new(imlServiceTagStore))
	})

	autowire.Auto[IServiceDocStore](func() reflect.Value {
		return reflect.ValueOf(new(imlServiceDocStore))
	})

}
