package dynamic_module

import (
	"reflect"
	
	dynamic_module_dto "github.com/APIParkLab/APIPark/module/dynamic-module/dto"
	"github.com/eolinker/go-common/autowire"
	"github.com/gin-gonic/gin"
)

type IDynamicModuleController interface {
	Create(ctx *gin.Context, module string, input *dynamic_module_dto.CreateDynamicModule) (*dynamic_module_dto.DynamicModule, error)
	Edit(ctx *gin.Context, module string, id string, input *dynamic_module_dto.EditDynamicModule) (*dynamic_module_dto.DynamicModule, error)
	Delete(ctx *gin.Context, module string, ids string) error
	Get(ctx *gin.Context, module string, id string) (*dynamic_module_dto.DynamicModule, error)
	List(ctx *gin.Context, module string, keyword string, cluster string, page string, pageSize string) ([]map[string]interface{}, *dynamic_module_dto.PluginInfo, int64, error)
	Render(ctx *gin.Context, module string) (*dynamic_module_dto.PluginBasic, map[string]interface{}, error)
	ModuleDrivers(ctx *gin.Context, group string) ([]*dynamic_module_dto.ModuleDriver, error)
	Online(ctx *gin.Context, module string, id string, partitionInput *dynamic_module_dto.ClusterInput) error
	Offline(ctx *gin.Context, module string, id string, partitionInput *dynamic_module_dto.ClusterInput) error
	//PartitionStatuses(ctx *gin.Context, module string, keyword string, page string, pageSize string) (map[string]map[string]string, error)
	//PartitionStatus(ctx *gin.Context, module string, id string) (*dynamic_module_dto.OnlineInfo, error)
}

func init() {
	autowire.Auto[IDynamicModuleController](func() reflect.Value {
		return reflect.ValueOf(new(imlDynamicModuleController))
	})
}
