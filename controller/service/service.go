package service

import (
	"reflect"

	monitor_dto "github.com/APIParkLab/APIPark/module/monitor/dto"

	service_dto "github.com/APIParkLab/APIPark/module/service/dto"

	"github.com/gin-gonic/gin"

	"github.com/eolinker/go-common/autowire"
)

type IServiceController interface {
	// Get 获取
	Get(ctx *gin.Context, id string) (*service_dto.Service, error)
	// SearchMyServices 搜索服务
	SearchMyServices(ctx *gin.Context, teamID string, keyword string) ([]*service_dto.ServiceItem, error)
	Search(ctx *gin.Context, teamIDs string, keyword string) ([]*service_dto.ServiceItem, error)
	QuickCreateRestfulService(ctx *gin.Context) error

	QuickCreateAIService(ctx *gin.Context, input *service_dto.QuickCreateAIService) error
	// Create 创建
	Create(ctx *gin.Context, teamID string, input *service_dto.CreateService) (*service_dto.Service, error)
	// Edit 编辑
	Edit(ctx *gin.Context, id string, input *service_dto.EditService) (*service_dto.Service, error)
	// Delete 删除
	Delete(ctx *gin.Context, id string) error
	ServiceDoc(ctx *gin.Context, id string) (*service_dto.ServiceDoc, error)
	SaveServiceDoc(ctx *gin.Context, id string, input *service_dto.SaveServiceDoc) error
	Simple(ctx *gin.Context) ([]*service_dto.SimpleServiceItem, error)
	MySimple(ctx *gin.Context) ([]*service_dto.SimpleServiceItem, error)

	Swagger(ctx *gin.Context)
	ExportSwagger(ctx *gin.Context)

	Top10(ctx *gin.Context, serviceId string, start string, end string) ([]*monitor_dto.TopN, []*monitor_dto.TopN, error)

	AIChartOverview(ctx *gin.Context, serviceId string, start string, end string) (*monitor_dto.ServiceChartAIOverview, error)
	RestChartOverview(ctx *gin.Context, serviceId string, start string, end string) (*monitor_dto.ServiceChartRestOverview, error)

	ServiceOverview(ctx *gin.Context, serviceId string) (*service_dto.Overview, error)

	AILogs(ctx *gin.Context, serviceId string, start string, end string, page string, size string) ([]*service_dto.AILogItem, int64, error)

	RestLogs(ctx *gin.Context, serviceId string, start string, end string, page string, size string) ([]*service_dto.RestLogItem, int64, error)
}

type IAppController interface {
	// CreateApp 创建应用
	CreateApp(ctx *gin.Context, teamID string, project *service_dto.CreateApp) (*service_dto.App, error)

	UpdateApp(ctx *gin.Context, appId string, project *service_dto.UpdateApp) (*service_dto.App, error)
	Search(ctx *gin.Context, teamId string, keyword string) ([]*service_dto.AppItem, error)
	SearchMyApps(ctx *gin.Context, teamId string, keyword string) ([]*service_dto.AppItem, error)
	// SimpleApps 获取简易项目列表
	SimpleApps(ctx *gin.Context, keyword string) ([]*service_dto.SimpleAppItem, error)
	MySimpleApps(ctx *gin.Context, keyword string) ([]*service_dto.SimpleAppItem, error)
	SearchCanSubscribe(ctx *gin.Context, serviceId string) ([]*service_dto.SubscribeAppItem, error)
	GetApp(ctx *gin.Context, appId string) (*service_dto.App, error)
	DeleteApp(ctx *gin.Context, appId string) error
}

func init() {
	autowire.Auto[IServiceController](func() reflect.Value {
		return reflect.ValueOf(new(imlServiceController))
	})

	autowire.Auto[IAppController](func() reflect.Value {
		return reflect.ValueOf(new(imlAppController))
	})
}
