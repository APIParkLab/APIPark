package gateway

import "context"

type ClientConfig struct {
	// 请求地址列表
	Addresses []string
	// 认证配置
	Auth *AuthConfig
}

type AuthConfig struct {
	// 认证类型
	Type string
	// 认证信息
	Info map[string]interface{}
}

type IClientDriver interface {
	Project() IProjectClient
	Application() IApplicationClient
	Service() IServiceClient
	Subscribe() ISubscribeClient
	Strategy() IStrategyClient
	Dynamic(resource string) (IDynamicClient, error)
	PluginSetting() IPluginSetting
	Commit(ctx context.Context) error
	Rollback(ctx context.Context) error
	Begin(ctx context.Context) error
	Close(ctx context.Context) error
	// todo 插件同步
}

type IPluginSetting interface {
	Init(ctx context.Context) error
	Set(ctx context.Context, cfgs []*PluginConfig) error
}

type PluginConfig struct {
	Id     string                 `json:"id"`
	Name   string                 `json:"name"`
	Status string                 `json:"status"`
	Config map[string]interface{} `json:"config"`
}
