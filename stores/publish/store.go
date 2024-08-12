package publish

import (
	"reflect"

	"github.com/eolinker/go-common/autowire"
	"github.com/eolinker/go-common/store"
)

type IPublishStore interface {
	store.IBaseStore[Publish]
}
type IDiffStore interface {
	store.IBaseStore[Diff]
}
type IPublishLatestStore interface {
	store.IBaseStore[Latest]
}

type IPublishStatusStore interface {
	store.IBaseStore[Status]
}

var (
	_ IPublishStore       = (*store.Store[Publish])(nil)
	_ IDiffStore          = (*store.Store[Diff])(nil)
	_ IPublishLatestStore = (*store.Store[Latest])(nil)
	_ IPublishStatusStore = (*store.Store[Status])(nil)
)

func init() {
	autowire.Auto[IPublishStore](func() reflect.Value {
		return reflect.ValueOf(new(store.Store[Publish]))
	})

	autowire.Auto[IDiffStore](func() reflect.Value {
		return reflect.ValueOf(new(store.Store[Diff]))
	})

	autowire.Auto[IPublishLatestStore](func() reflect.Value {
		return reflect.ValueOf(new(store.Store[Latest]))
	})

	autowire.Auto[IPublishStatusStore](func() reflect.Value {
		return reflect.ValueOf(new(store.Store[Status]))
	})

}
