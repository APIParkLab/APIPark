package plugin_cluster

import (
	"github.com/APIParkLab/APIPark/model/plugin_model"
	"github.com/APIParkLab/APIPark/module/plugin-cluster"
	"github.com/APIParkLab/APIPark/module/plugin-cluster/dto"
	"github.com/gin-gonic/gin"
)

var (
	_ IPluginClusterController = (*imlPluginClusterController)(nil)
)

type imlPluginClusterController struct {
	module plugin_cluster.IPluginClusterModule `autowired:""`
}

func (i *imlPluginClusterController) Info(ctx *gin.Context, name string) (*dto.Define, error) {
	return i.module.GetDefine(ctx, name)
}

func (i *imlPluginClusterController) Option(ctx *gin.Context, project string) ([]*dto.PluginOption, error) {
	return i.module.Options(ctx)
}

func (i *imlPluginClusterController) List(ctx *gin.Context, clusterId string) ([]*dto.Item, error) {
	return i.module.List(ctx, clusterId)
}

func (i *imlPluginClusterController) Get(ctx *gin.Context, clusterId string, name string) (config *dto.PluginOutput, render plugin_model.Render, er error) {
	return i.module.Get(ctx, clusterId, name)
}

func (i *imlPluginClusterController) Set(ctx *gin.Context, clusterId string, name string, config *dto.PluginSetting) error {
	return i.module.Set(ctx, clusterId, name, config)
}
