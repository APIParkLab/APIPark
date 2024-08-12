package apinto

import (
	"context"
	
	"github.com/APIParkLab/APIPark/gateway/apinto/plugin"
	
	"github.com/APIParkLab/APIPark/gateway"
	admin_client "github.com/eolinker/eosc/process-admin/client"
)

var _ gateway.IPluginSetting = &PluginSettingClient{}

type PluginSettingClient struct {
	client admin_client.Client
}

func (p *PluginSettingClient) Init(ctx context.Context) error {
	//data, err := json.Marshal(map[string]interface{}{
	//	"plugins": plugin.GetGlobalPluginConf(),
	//})
	//log.Println(string(data), err)
	return p.client.SSet(ctx, "plugin", map[string]interface{}{
		"plugins": plugin.GetGlobalPluginConf(),
	})
}

func (p *PluginSettingClient) Set(ctx context.Context, configs []*gateway.PluginConfig) error {
	globalPlugins := make([]*plugin.GlobalPlugin, 0, len(configs))
	for _, cfg := range configs {
		globalPlugins = append(globalPlugins, &plugin.GlobalPlugin{
			Config: cfg.Config,
			Id:     cfg.Id,
			Name:   cfg.Name,
			Status: cfg.Status,
		})
	}
	return p.client.SSet(ctx, "plugin", map[string]interface{}{
		"plugins": globalPlugins,
	})
}

func NewPluginSettingClient(client admin_client.Client) *PluginSettingClient {
	return &PluginSettingClient{client: client}
}
