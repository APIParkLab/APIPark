package release

import (
	"github.com/eolinker/go-common/autowire"
	"github.com/eolinker/go-common/store"
	"reflect"
)

var (
	_ IReleaseStore       = (*store.Store[Release])(nil)
	_ IReleaseCommitStore = (*store.Store[Commit])(nil)
	_ IReleaseRuntime     = (*store.Store[Runtime])(nil)
)

type IReleaseStore interface {
	store.IBaseStore[Release]
}
type IReleaseCommitStore interface {
	store.IBaseStore[Commit]
}

type IReleaseRuntime interface {
	store.IBaseStore[Runtime]
}

func init() {
	autowire.Auto[IReleaseStore](func() reflect.Value {
		return reflect.ValueOf(new(store.Store[Release]))
	})

	autowire.Auto[IReleaseCommitStore](func() reflect.Value {
		return reflect.ValueOf(new(store.Store[Commit]))
	})
	autowire.Auto[IReleaseRuntime](func() reflect.Value {
		return reflect.ValueOf(new(store.Store[Runtime]))
	})

}
