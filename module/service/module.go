package service

import (
	"context"
	"reflect"

	strategy_filter "github.com/APIParkLab/APIPark/strategy-filter"

	"github.com/APIParkLab/APIPark/module/system"

	service_dto "github.com/APIParkLab/APIPark/module/service/dto"

	"github.com/eolinker/go-common/autowire"
)

type IServiceModule interface {
	// Get 获取项目信息
	Get(ctx context.Context, id string) (*service_dto.Service, error)
	// Search 搜索项目
	Search(ctx context.Context, teamID string, keyword string) ([]*service_dto.ServiceItem, error)
	// SearchMyServices 搜索
	SearchMyServices(ctx context.Context, teamId string, keyword string) ([]*service_dto.ServiceItem, error)
	// Create 创建
	Create(ctx context.Context, teamID string, input *service_dto.CreateService) (*service_dto.Service, error)
	// Edit 编辑
	Edit(ctx context.Context, id string, input *service_dto.EditService) (*service_dto.Service, error)
	// Delete 删除项目
	Delete(ctx context.Context, id string) error

	//Simple 获取简易项目列表
	Simple(ctx context.Context) ([]*service_dto.SimpleServiceItem, error)

	//MySimple 获取我的简易项目列表
	MySimple(ctx context.Context) ([]*service_dto.SimpleServiceItem, error)
}

type IServiceDocModule interface {
	ServiceDoc(ctx context.Context, pid string) (*service_dto.ServiceDoc, error)
	// SaveServiceDoc 保存服务文档
	SaveServiceDoc(ctx context.Context, pid string, input *service_dto.SaveServiceDoc) error
}

type IExportServiceModule interface {
	system.IExportModule[service_dto.ExportService]
}

type IAppModule interface {
	CreateApp(ctx context.Context, teamID string, input *service_dto.CreateApp) (*service_dto.App, error)
	UpdateApp(ctx context.Context, appId string, input *service_dto.UpdateApp) (*service_dto.App, error)
	Search(ctx context.Context, teamId string, keyword string) ([]*service_dto.AppItem, error)
	SearchMyApps(ctx context.Context, teamId string, keyword string) ([]*service_dto.AppItem, error)
	SearchCanSubscribe(ctx context.Context, serviceId string) ([]*service_dto.SimpleAppItem, error)
	// SimpleApps 获取简易项目列表
	SimpleApps(ctx context.Context, keyword string) ([]*service_dto.SimpleAppItem, error)
	MySimpleApps(ctx context.Context, keyword string) ([]*service_dto.SimpleAppItem, error)
	GetApp(ctx context.Context, appId string) (*service_dto.App, error)
	DeleteApp(ctx context.Context, appId string) error
}

type IExportAppModule interface {
	system.IExportModule[service_dto.ExportApp]
}

func init() {
	serviceModule := new(imlServiceModule)
	autowire.Auto[IServiceModule](func() reflect.Value {
		return reflect.ValueOf(serviceModule)
	})

	autowire.Auto[IExportServiceModule](func() reflect.Value {
		return reflect.ValueOf(serviceModule)
	})

	appModule := new(imlAppModule)
	autowire.Auto[IAppModule](func() reflect.Value {
		return reflect.ValueOf(appModule)
	})

	autowire.Auto[IExportAppModule](func() reflect.Value {
		return reflect.ValueOf(appModule)
	})

	serviceDocModule := new(imlServiceDocModule)
	autowire.Auto[IServiceDocModule](func() reflect.Value {
		return reflect.ValueOf(serviceDocModule)
	})

	filter := new(imlAppFilter)
	autowire.Autowired(filter)
	strategy_filter.RegisterRemoteFilter(filter)

}
