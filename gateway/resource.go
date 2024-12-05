package gateway

import (
	"context"
	"encoding/json"

	"github.com/eolinker/eosc"

	"github.com/APIParkLab/APIPark/model/plugin_model"
)

type IProjectClient IResourceClient[ProjectRelease]

type IApplicationClient IResourceClient[ApplicationRelease]

type IServiceClient IResourceClient[ServiceRelease]

type ISubscribeClient IResourceClient[SubscribeRelease]

type IStrategyClient IResourceClient[eosc.Base[StrategyRelease]]

type IResourceClient[T any] interface {
	Online(ctx context.Context, resources ...*T) error
	Offline(ctx context.Context, resources ...*T) error
}

type IDynamicClient interface {
	IResourceClient[DynamicRelease]
	Versions(ctx context.Context, matchLabels map[string]string) (map[string]string, error)
	Version(ctx context.Context, resourceId string) (string, error)
}

type ProjectRelease struct {
	Id         string                        `json:"id"`
	Version    string                        `json:"version"`
	Apis       []*ApiRelease                 `json:"apis"`
	Upstream   *UpstreamRelease              `json:"upstreams"`
	Strategies []*eosc.Base[StrategyRelease] `json:"strategies"`
}

type ApiRelease struct {
	*BasicItem
	Path      string
	Methods   []string
	Host      []string
	Protocols []string

	Plugins      map[string]*Plugin
	Service      string
	Rules        []*MatchRule
	Extends      map[string]any
	ProxyPath    string
	ProxyHeaders []*ProxyHeader
	Retry        int
	Timeout      int

	Labels  map[string]string
	Disable bool
}

type ProxyHeader struct {
	Key   string `json:"key"`
	Value string `json:"value"`
	Opt   string `json:"opt"`
}

type UpstreamRelease struct {
	*BasicItem
	Nodes    []string
	PassHost string
	Scheme   string
	// Discovery 服务发现ID
	Discovery string
	// Service 服务发现服务名
	Service string
	Balance string
	Timeout int
	Labels  map[string]string
}

type StrategyRelease struct {
	Name     string              `json:"name"`
	Desc     string              `json:"description"`
	Driver   string              `json:"driver"`
	Priority int                 `json:"priority"`
	Filters  map[string][]string `json:"filters"`
	IsDelete bool                `json:"-"`
}

type MatchRule struct {
	Position  string
	MatchType string
	Key       string
	Pattern   string
}

type Plugin struct {
	Disable bool
	Config  plugin_model.ConfigType
}

type BasicItem struct {
	ID          string
	Description string
	Version     string
	Resource    string
	MatchLabels map[string]string
}

type DynamicRelease struct {
	*BasicItem
	Attr map[string]interface{}
}

func (d *DynamicRelease) UnmarshalJSON(bytes []byte) error {
	basicInfo := new(BasicItem)
	err := json.Unmarshal(bytes, basicInfo)
	if err != nil {
		return err
	}
	tmp := make(map[string]interface{})
	err = json.Unmarshal(bytes, &tmp)
	if err != nil {
		return err
	}
	d.BasicItem = basicInfo
	d.Attr = tmp
	return nil
}

type ServiceRelease struct {
	ID   string
	Apis []string
}

type SubscribeRelease struct {
	// 订阅服务ID
	Service string
	// 订阅方ID
	Application string
	// 过期时间
	Expired string
}

type ApplicationRelease struct {
	*BasicItem
	Labels         map[string]string
	Authorizations []*Authorization
}

type Authorization struct {
	Type           string
	Position       string
	TokenName      string
	Expire         int64
	Config         map[string]interface{}
	Label          map[string]string
	HideCredential bool
}
