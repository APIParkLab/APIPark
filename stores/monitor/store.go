package monitor

import (
	"reflect"

	"github.com/eolinker/go-common/autowire"
	"github.com/eolinker/go-common/store"
)

type IMonitorStore interface {
	store.IBaseStore[Monitor]
}

type storeMonitor struct {
	store.Store[Monitor]
}

func init() {
	autowire.Auto[IMonitorStore](func() reflect.Value {
		return reflect.ValueOf(new(storeMonitor))
	})
}
