package plugin_cluster

import (
	"context"
	"fmt"
	
	plugin_cluster "github.com/APIParkLab/APIPark/service/plugin-cluster"
	
	"github.com/APIParkLab/APIPark/gateway"
	"github.com/APIParkLab/APIPark/model/plugin_model"
	"github.com/APIParkLab/APIPark/module/plugin-cluster/dto"
	"github.com/APIParkLab/APIPark/service/cluster"
	"github.com/eolinker/eosc/log"
	"github.com/eolinker/go-common/auto"
	"github.com/eolinker/go-common/utils"
)

var (
	_ IPluginClusterModule = (*imlPluginClusterModule)(nil)
)

type imlPluginClusterModule struct {
	service plugin_cluster.IPluginService `autowired:""`
	//partitionService partition.IPartitionService    `autowired:""`
	clusterService cluster.IClusterService `autowired:""`
}

func (m *imlPluginClusterModule) UpdateDefine(ctx context.Context, defines []*plugin_model.Define) error {
	err := m.service.SaveDefine(ctx, defines)
	if err != nil {
		return err
	}
	return m.initAllCluster(ctx)
}
func (m *imlPluginClusterModule) initAllCluster(ctx context.Context) error {
	
	clusters, err := m.clusterService.List(ctx)
	if err != nil {
		return err
	}
	
	for _, c := range clusters {
		err := m.initCluster(ctx, c.Uuid)
		if err != nil {
			log.Warn("init cluster:%s %s", c.Name, err.Error())
		}
	}
	return nil
}
func (m *imlPluginClusterModule) initGateway(ctx context.Context, clusterId string, clientDriver gateway.IClientDriver) error {
	configForPartitions, err := m.service.ListCluster(ctx, clusterId)
	if err != nil {
		return err
	}
	pluginConfigs := utils.SliceToSlice(configForPartitions, func(s *plugin_cluster.ConfigPartition) *gateway.PluginConfig {
		
		return &gateway.PluginConfig{
			Id:     s.Extend,
			Name:   s.Plugin,
			Config: s.Config.Config,
			Status: s.Status.String(),
		}
	})
	
	return clientDriver.PluginSetting().Set(ctx, pluginConfigs)
}
func (m *imlPluginClusterModule) GetDefine(ctx context.Context, name string) (*dto.Define, error) {
	define, err := m.service.GetDefine(ctx, name)
	if err != nil {
		return nil, err
	}
	return &dto.Define{
		Name:    define.Name,
		Cname:   define.Cname,
		Desc:    define.Desc,
		Default: define.Config,
		Render:  define.Render,
		Extend:  define.Extend,
	}, nil
}

func (m *imlPluginClusterModule) Options(ctx context.Context) ([]*dto.PluginOption, error) {
	defines, err := m.service.Defines(ctx, plugin_model.OpenKind)
	if err != nil {
		return nil, err
	}
	
	return utils.SliceToSlice(defines, func(s *plugin_cluster.PluginDefine) *dto.PluginOption {
		return &dto.PluginOption{
			Name:    s.Name,
			Cname:   s.Cname,
			Desc:    s.Desc,
			Default: s.Config,
			Render:  s.Render,
		}
	}), nil
}

func (m *imlPluginClusterModule) List(ctx context.Context, clusterId string) ([]*dto.Item, error) {
	
	configPartitions, err := m.service.ListCluster(ctx, clusterId, plugin_model.OpenKind)
	if err != nil {
		return nil, err
	}
	return utils.SliceToSlice(configPartitions, func(s *plugin_cluster.ConfigPartition) *dto.Item {
		return &dto.Item{
			
			Name:     s.Plugin,
			Cname:    s.Cname,
			Desc:     s.Desc,
			Extend:   s.Extend,
			Operator: auto.UUIDP(s.Operator),
			Update:   (*auto.TimeLabel)(s.Update),
			Create:   (*auto.TimeLabel)(s.Create),
		}
	}), nil
}

func (m *imlPluginClusterModule) Get(ctx context.Context, clusterId string, name string) (config *dto.PluginOutput, render plugin_model.Render, er error) {
	if clusterId == "" {
		return nil, nil, fmt.Errorf("partition is require")
	}
	cf, define, err := m.service.GetConfig(ctx, clusterId, name)
	if err != nil {
		return nil, nil, err
	}
	if define.Kind != plugin_model.OpenKind {
		return nil, nil, fmt.Errorf("plugin %s [extend:%s] not support for setting ", name, define.Extend)
	}
	out := &dto.PluginOutput{
		//Cluster: auto.UUID(cf.Cluster),
		Name:   cf.Plugin,
		Cname:  define.Cname,
		Extend: define.Extend,
		Desc:   define.Desc,
		Status: cf.Status,
		Config: cf.Config,
	}
	if cf.Operator != "" {
		out.Operator = auto.UUIDP(cf.Operator)
	}
	if cf.Create != nil {
		out.Create = (*auto.TimeLabel)(cf.Create)
	}
	if cf.Update != nil {
		out.Update = (*auto.TimeLabel)(cf.Update)
	}
	return out, define.Render, nil
	
}

func (m *imlPluginClusterModule) Set(ctx context.Context, clusterId string, name string, config *dto.PluginSetting) error {
	
	err := m.service.SetCluster(ctx, clusterId, name, config.Status, config.Config)
	if err != nil {
		return err
	}
	
	return m.initCluster(ctx, clusterId)
}

func (m *imlPluginClusterModule) initCluster(ctx context.Context, clusterId string) error {
	client, err := m.clusterService.GatewayClient(ctx, clusterId)
	if err != nil {
		return err
	}
	defer func() {
		err := client.Close(ctx)
		if err != nil {
			log.Warn("close apinto client:", err)
		}
	}()
	return m.initGateway(ctx, clusterId, client)
}
