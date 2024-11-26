package monitor

import (
	"reflect"
	"time"

	"github.com/eolinker/go-common/autowire"
	"github.com/gin-gonic/gin"

	monitor_dto "github.com/APIParkLab/APIPark/module/monitor/dto"
)

type IMonitorStatisticController interface {
	Top10(ctx *gin.Context, input *monitor_dto.Top10Input) (interface{}, error)
	Summary(ctx *gin.Context, input *monitor_dto.CommonInput) (*monitor_dto.MonSummaryOutput, *monitor_dto.MonSummaryOutput, error)
	OverviewInvokeTrend(ctx *gin.Context, input *monitor_dto.CommonInput) ([]time.Time, []int64, []int64, []int64, []int64, []float64, []float64, string, error)
	OverviewMessageTrend(ctx *gin.Context, input *monitor_dto.CommonInput) ([]time.Time, []float64, []float64, string, error)

	Statistics(ctx *gin.Context, dataType string, input *monitor_dto.StatisticInput) (interface{}, error)

	InvokeTrend(ctx *gin.Context, dataType string, id string, input *monitor_dto.CommonInput) (*monitor_dto.MonInvokeCountTrend, string, error)

	InvokeTrendInner(ctx *gin.Context, dataType string, typ string, api string, provider string, subscriber string, input *monitor_dto.CommonInput) (*monitor_dto.MonInvokeCountTrend, string, error)
	StatisticsInner(ctx *gin.Context, dataType string, typ string, id string, input *monitor_dto.StatisticInput) (interface{}, error)
}

type IMonitorConfigController interface {
	SaveMonitorConfig(ctx *gin.Context, cfg *monitor_dto.SaveMonitorConfig) (*monitor_dto.MonitorConfig, error)
	GetMonitorConfig(ctx *gin.Context) (*monitor_dto.MonitorConfig, error)
	GetMonitorCluster(ctx *gin.Context) ([]*monitor_dto.MonitorCluster, error)
}

func init() {
	autowire.Auto[IMonitorStatisticController](func() reflect.Value {
		return reflect.ValueOf(new(imlMonitorStatisticController))
	})

	autowire.Auto[IMonitorConfigController](func() reflect.Value {
		return reflect.ValueOf(new(imlMonitorConfig))
	})
}
