package plugin_cluster

import (
	"context"
	"reflect"
	
	"github.com/APIParkLab/APIPark/gateway"
	"github.com/APIParkLab/APIPark/model/plugin_model"
	"github.com/APIParkLab/APIPark/module/plugin-cluster/dto"
	"github.com/eolinker/go-common/autowire"
)

type IPluginClusterModule interface {
	List(ctx context.Context, clusterId string) ([]*dto.Item, error)
	Get(ctx context.Context, clusterId string, name string) (config *dto.PluginOutput, render plugin_model.Render, er error)
	Set(ctx context.Context, clusterId string, name string, config *dto.PluginSetting) error
	Options(ctx context.Context) ([]*dto.PluginOption, error)
	GetDefine(ctx context.Context, name string) (*dto.Define, error)
	UpdateDefine(ctx context.Context, defines []*plugin_model.Define) error
}

func init() {
	autowire.Auto[IPluginClusterModule](func() reflect.Value {
		m := new(imlPluginClusterModule)
		gateway.RegisterInitHandleFunc(m.initGateway)
		return reflect.ValueOf(m)
	})
}
