package plugin

import (
	"github.com/eolinker/go-common/autowire"
	"github.com/eolinker/go-common/store"
	"reflect"
)

type IPluginDefineStore interface {
	store.IBaseStore[Define]
}
type storePlugin struct {
	store.Store[Define]
}

type IPartitionPluginStore interface {
	store.IBaseStore[Partition]
}

type storePartition struct {
	store.Store[Partition]
}

func init() {
	autowire.Auto[IPluginDefineStore](func() reflect.Value {
		return reflect.ValueOf(new(storePlugin))
	})
	autowire.Auto[IPartitionPluginStore](func() reflect.Value {
		return reflect.ValueOf(new(storePartition))
	})
}
