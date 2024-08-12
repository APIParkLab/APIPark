package dynamic_module

import (
	"context"
	"reflect"
	
	"github.com/APIParkLab/APIPark/service/universally"
	"github.com/eolinker/go-common/autowire"
)

type IDynamicModuleService interface {
	universally.IServiceGet[DynamicModule]
	universally.IServiceDelete
	universally.IServiceCreate[CreateDynamicModule]
	universally.IServiceEdit[EditDynamicModule]
	ListByPartition(ctx context.Context, partitionId string) ([]*DynamicModule, error)
}

type IDynamicModulePublishService interface {
	universally.IServiceCreate[CreateDynamicModulePublish]
	Latest(ctx context.Context, dmID string, partitionIds []string) (map[string]*DynamicModulePublish, error)
}

func init() {
	autowire.Auto[IDynamicModuleService](func() reflect.Value {
		return reflect.ValueOf(new(imlDynamicModuleService))
	})
	autowire.Auto[IDynamicModulePublishService](func() reflect.Value {
		return reflect.ValueOf(new(imlDynamicModulePublishService))
	})
}
