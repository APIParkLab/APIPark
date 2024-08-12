package plugin_cluster

import (
	"context"
	"reflect"
	
	"github.com/APIParkLab/APIPark/model/plugin_model"
	"github.com/eolinker/go-common/autowire"
)

type IPluginService interface {
	Defines(ctx context.Context, kind ...plugin_model.Kind) ([]*PluginDefine, error)
	Options(ctx context.Context) []*PluginOption
	SetCluster(ctx context.Context, clusterId string, name string, status plugin_model.Status, config plugin_model.ConfigType) error
	ListCluster(ctx context.Context, clusterId string, kind ...plugin_model.Kind) ([]*ConfigPartition, error)
	GetConfig(ctx context.Context, clusterId string, name string) (*Config, *PluginDefine, error)
	GetDefine(ctx context.Context, name string) (*PluginDefine, error)
	SaveDefine(ctx context.Context, defines []*plugin_model.Define) error
}

func init() {
	autowire.Auto[IPluginService](func() reflect.Value {
		return reflect.ValueOf(new(imlPluginService))
	})
	
}
