package dynamic_module

import (
	"encoding/json"
	"strconv"
	
	dynamic_module "github.com/APIParkLab/APIPark/module/dynamic-module"
	dynamic_module_dto "github.com/APIParkLab/APIPark/module/dynamic-module/dto"
	"github.com/gin-gonic/gin"
)

var _ IDynamicModuleController = (*imlDynamicModuleController)(nil)

type imlDynamicModuleController struct {
	module dynamic_module.IDynamicModuleModule `autowired:""`
}

func (i *imlDynamicModuleController) Online(ctx *gin.Context, module string, id string, partitionInput *dynamic_module_dto.ClusterInput) error {
	return i.module.Online(ctx, module, id, partitionInput)
}

func (i *imlDynamicModuleController) Offline(ctx *gin.Context, module string, id string, partitionInput *dynamic_module_dto.ClusterInput) error {
	return i.module.Offline(ctx, module, id, partitionInput)
}

//func (i *imlDynamicModuleController) PartitionStatuses(ctx *gin.Context, module string, keyword string, page string, pageSize string) (map[string]map[string]string, error) {
//	p, err := strconv.Atoi(page)
//	if err != nil {
//		p = 1
//	}
//	ps, err := strconv.Atoi(pageSize)
//	if err != nil {
//		ps = 20
//	}
//	return i.module.PartitionStatuses(ctx, module, keyword, p, ps)
//}
//
//func (i *imlDynamicModuleController) PartitionStatus(ctx *gin.Context, module string, id string) (*dynamic_module_dto.OnlineInfo, error) {
//	return i.module.PartitionStatus(ctx, module, id)
//}

func (i *imlDynamicModuleController) ModuleDrivers(ctx *gin.Context, group string) ([]*dynamic_module_dto.ModuleDriver, error) {
	return i.module.ModuleDrivers(ctx, group)
}

func (i *imlDynamicModuleController) Render(ctx *gin.Context, module string) (*dynamic_module_dto.PluginBasic, map[string]interface{}, error) {
	render, err := i.module.Render(ctx, module)
	if err != nil {
		return nil, nil, err
	}
	pluginInfo, err := i.module.PluginInfo(ctx, module)
	if err != nil {
		return nil, nil, err
	}
	return pluginInfo.PluginBasic, render, nil
}

func (i *imlDynamicModuleController) Create(ctx *gin.Context, module string, input *dynamic_module_dto.CreateDynamicModule) (*dynamic_module_dto.DynamicModule, error) {
	return i.module.Create(ctx, module, input)
}

func (i *imlDynamicModuleController) Edit(ctx *gin.Context, module string, id string, input *dynamic_module_dto.EditDynamicModule) (*dynamic_module_dto.DynamicModule, error) {
	return i.module.Edit(ctx, module, id, input)
}

func (i *imlDynamicModuleController) Delete(ctx *gin.Context, module string, idStr string) error {
	ids := make([]string, 0)
	err := json.Unmarshal([]byte(idStr), &ids)
	if err != nil {
		return err
	}
	if len(ids) == 0 {
		return nil
	}
	return i.module.Delete(ctx, module, ids)
}

func (i *imlDynamicModuleController) Get(ctx *gin.Context, module string, id string) (*dynamic_module_dto.DynamicModule, error) {
	return i.module.Get(ctx, module, id)
}

func (i *imlDynamicModuleController) List(ctx *gin.Context, module string, keyword string, clusterId string, page string, pageSize string) ([]map[string]interface{}, *dynamic_module_dto.PluginInfo, int64, error) {
	p, err := strconv.Atoi(page)
	if err != nil {
		p = 1
	}
	ps, err := strconv.Atoi(pageSize)
	if err != nil {
		ps = 20
		
	}
	list, total, err := i.module.List(ctx, module, keyword, p, ps)
	if err != nil {
		return nil, nil, 0, err
	}
	//if clusterId == "" {
	//	clusterId = "[]"
	//}
	//ids := make([]string, 0)
	//err = json.Unmarshal([]byte(clusterId), &ids)
	//if err != nil {
	//	return nil, nil, 0, err
	//}
	plugin, err := i.module.PluginInfo(ctx, module)
	if err != nil {
		return nil, nil, 0, err
	}
	return list, plugin, total, nil
}
