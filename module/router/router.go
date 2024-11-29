package router

import (
	"context"
	"reflect"

	"github.com/APIParkLab/APIPark/module/system"
	strategy_filter "github.com/APIParkLab/APIPark/strategy-filter"

	"github.com/eolinker/go-common/autowire"

	router_dto "github.com/APIParkLab/APIPark/module/router/dto"
)

type IRouterModule interface {
	// Detail 获取API详情
	Detail(ctx context.Context, serviceId string, apiId string) (*router_dto.Detail, error)
	// SimpleDetail 获取API简要详情
	SimpleDetail(ctx context.Context, serviceId string, apiId string) (*router_dto.SimpleDetail, error)
	// Search 获取API列表
	Search(ctx context.Context, keyword string, serviceId string) ([]*router_dto.Item, error)
	// SimpleSearch 获取API简要列表
	SimpleSearch(ctx context.Context, keyword string, serviceId string) ([]*router_dto.SimpleItem, error)
	SimpleList(ctx context.Context, serviceId string) ([]*router_dto.SimpleItem, error)
	// Create 创建API
	Create(ctx context.Context, serviceId string, dto *router_dto.Create) (*router_dto.SimpleDetail, error)
	// Edit 编辑API
	Edit(ctx context.Context, serviceId string, apiId string, dto *router_dto.Edit) (*router_dto.SimpleDetail, error)
	// Delete 删除API
	Delete(ctx context.Context, serviceId string, apiId string) error
	// Prefix 获取API前缀
	Prefix(ctx context.Context, serviceId string) (string, error)

	SimpleAPIs(ctx context.Context, input *router_dto.InputSimpleAPI) ([]*router_dto.SimpleItem, error)
	//ExportAll(ctx context.Context) ([]*router_dto.Export, error)
}

type IExportRouterModule interface {
	system.IExportModule[router_dto.Export]
}

func init() {
	apiModule := new(imlRouterModule)
	autowire.Auto[IRouterModule](func() reflect.Value {
		return reflect.ValueOf(apiModule)
	})

	autowire.Auto[IExportRouterModule](func() reflect.Value {
		return reflect.ValueOf(apiModule)
	})

	filter := new(imlRouterFilter)
	autowire.Autowired(filter)
	strategy_filter.RegisterRemoteFilter(filter)
}
