package apinto

import (
	"context"
	"strings"

	"github.com/APIParkLab/APIPark/gateway"
	admin_client "github.com/eolinker/eosc/process-admin/client"
)

var _ gateway.IClientDriver = (*ClientDriver)(nil)

type ClientDriver struct {
	client admin_client.Client
}

func (c *ClientDriver) Strategy() gateway.IStrategyClient {
	return NewStrategyClient(c.client)
}

func (c *ClientDriver) Close(ctx context.Context) error {
	if c.client != nil {
		return c.client.Close()
	}
	return nil
}

func (c *ClientDriver) Commit(ctx context.Context) error {
	return c.client.Commit(ctx)
}

func (c *ClientDriver) Rollback(ctx context.Context) error {
	return c.Rollback(ctx)
}

func (c *ClientDriver) Begin(ctx context.Context) error {
	return c.client.Begin(ctx)
}

func (c *ClientDriver) Project() gateway.IProjectClient {
	return NewProjectClient(c.client)
}

func (c *ClientDriver) Service() gateway.IServiceClient {
	return NewServiceClient(c.client)
}

func (c *ClientDriver) Subscribe() gateway.ISubscribeClient {
	return NewSubscribeClient(c.client)
}

func (c *ClientDriver) Application() gateway.IApplicationClient {
	return NewApplicationClient(c.client)
}

func (c *ClientDriver) Dynamic(resource string) (gateway.IDynamicClient, error) {
	return NewDynamicClient(c.client, resource)
}

func (c *ClientDriver) PluginSetting() gateway.IPluginSetting {
	return NewPluginSettingClient(c.client)
}

func NewClientDriver(cfg *gateway.ClientConfig) (*ClientDriver, error) {
	address := make([]string, 0, len(cfg.Addresses))
	for _, addr := range cfg.Addresses {
		addr = strings.TrimPrefix(addr, "http://")
		addr = strings.TrimPrefix(addr, "https://")
		address = append(address, addr)
	}
	client, err := admin_client.New(address...)
	if err != nil {
		return nil, err
	}
	return &ClientDriver{
		client: client,
	}, nil
}

func genWorkerID(id string, profession string) string {

	suffix := "@" + profession
	if strings.HasSuffix(id, suffix) {
		return id
	}
	return id + suffix
}
