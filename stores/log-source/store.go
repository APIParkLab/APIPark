package log_source

import (
	"reflect"

	"github.com/eolinker/go-common/autowire"
	"github.com/eolinker/go-common/store"
)

type ILogSourceStore interface {
	store.IBaseStore[Log]
}

type storeLogSource struct {
	store.Store[Log]
}

func init() {
	autowire.Auto[ILogSourceStore](func() reflect.Value {
		return reflect.ValueOf(new(storeLogSource))
	})
}
