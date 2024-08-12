package plugin_cluster

import (
	"reflect"
	
	"github.com/APIParkLab/APIPark/model/plugin_model"
	"github.com/APIParkLab/APIPark/module/plugin-cluster/dto"
	"github.com/eolinker/go-common/autowire"
	"github.com/gin-gonic/gin"
)

type IPluginClusterController interface {
	List(ctx *gin.Context, clusterId string) ([]*dto.Item, error)
	Get(ctx *gin.Context, clusterId string, name string) (config *dto.PluginOutput, render plugin_model.Render, er error)
	Set(ctx *gin.Context, clusterId string, name string, config *dto.PluginSetting) error
	Option(ctx *gin.Context, project string) ([]*dto.PluginOption, error)
	Info(ctx *gin.Context, name string) (*dto.Define, error)
}

func init() {
	autowire.Auto[IPluginClusterController](func() reflect.Value {
		return reflect.ValueOf(new(imlPluginClusterController))
	})
}
