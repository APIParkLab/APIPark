package cluster

import (
	"reflect"

	"github.com/eolinker/go-common/autowire"
	"github.com/eolinker/go-common/store"
)

type IClusterNodeStore interface {
	store.IBaseStore[Node]
}
type storeClusterNode struct {
	store.Store[Node] // 用struct方式继承,会自动填充并初始化表
}
type IClusterNodeAddressStore interface {
	store.IBaseStore[NodeAddr]
}
type storeClusterNodeAddr struct {
	store.Store[NodeAddr] // 用struct方式继承,会自动填充并初始化表
}

func init() {
	autowire.Auto[IClusterStore](func() reflect.Value {
		return reflect.ValueOf(new(storeCluster))
	})

	autowire.Auto[IClusterNodeStore](func() reflect.Value {
		return reflect.ValueOf(new(storeClusterNode))
	})

	autowire.Auto[IClusterNodeAddressStore](func() reflect.Value {
		return reflect.ValueOf(new(storeClusterNodeAddr))
	})
}
