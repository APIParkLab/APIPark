package dynamic_module

import (
	"reflect"

	"github.com/eolinker/go-common/autowire"
	"github.com/eolinker/go-common/store"
)

type IDynamicModuleStore interface {
	store.ISearchStore[DynamicModule]
}
type storeDynamicModule struct {
	store.SearchStore[DynamicModule] // 用struct方式继承,会自动填充并初始化表
}

type IDynamicModulePublishStore interface {
	store.ISearchStore[DynamicModulePublish]
}

type storeDynamicModulePublish struct {
	store.SearchStore[DynamicModulePublish] // 用struct方式继承,会自动填充并初始化表
}

func init() {
	autowire.Auto[IDynamicModuleStore](func() reflect.Value {
		return reflect.ValueOf(new(storeDynamicModule))
	})

	autowire.Auto[IDynamicModulePublishStore](func() reflect.Value {
		return reflect.ValueOf(new(storeDynamicModulePublish))
	})
}
