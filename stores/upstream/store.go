package upstream

import (
	"reflect"

	"github.com/eolinker/go-common/autowire"
	"github.com/eolinker/go-common/store"
)

type IUpstreamStore interface {
	store.IBaseStore[Upstream]
}

type storeUpstream struct {
	store.Store[Upstream]
}

func init() {
	autowire.Auto[IUpstreamStore](func() reflect.Value {
		return reflect.ValueOf(new(storeUpstream))
	})
}
