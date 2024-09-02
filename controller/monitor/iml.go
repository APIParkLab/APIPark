package monitor

import (
	"fmt"
	"time"

	"github.com/APIParkLab/APIPark/module/monitor"
	monitor_dto "github.com/APIParkLab/APIPark/module/monitor/dto"
	"github.com/gin-gonic/gin"
)

var (
	_ IMonitorStatisticController = (*imlMonitorStatisticController)(nil)
)

type imlMonitorStatisticController struct {
	module monitor.IMonitorStatisticModule `autowired:""`
}

func (i *imlMonitorStatisticController) OverviewMessageTrend(ctx *gin.Context, input *monitor_dto.CommonInput) ([]time.Time, []float64, []float64, string, error) {
	trend, timeInterval, err := i.module.MessageTrend(ctx, input)
	if err != nil {
		return nil, nil, nil, "", err
	}

	return trend.Dates, trend.ReqMessage, trend.RespMessage, timeInterval, nil
}

func (i *imlMonitorStatisticController) OverviewInvokeTrend(ctx *gin.Context, input *monitor_dto.CommonInput) ([]time.Time, []int64, []int64, []int64, []int64, []float64, []float64, string, error) {
	trend, timeInterval, err := i.module.InvokeTrend(ctx, input)
	if err != nil {
		return nil, nil, nil, nil, nil, nil, nil, "", err
	}

	return trend.Date, trend.RequestTotal, trend.ProxyTotal, trend.Status4XX, trend.Status5XX, trend.RequestRate, trend.ProxyRate, timeInterval, nil
}

func (i *imlMonitorStatisticController) Summary(ctx *gin.Context, input *monitor_dto.CommonInput) (*monitor_dto.MonSummaryOutput, *monitor_dto.MonSummaryOutput, error) {
	requestSummary, err := i.module.RequestSummary(ctx, input)
	if err != nil {
		return nil, nil, err
	}
	proxySummary, err := i.module.ProxySummary(ctx, input)
	if err != nil {
		return nil, nil, err
	}
	return requestSummary, proxySummary, nil
}

func (i *imlMonitorStatisticController) Top10(ctx *gin.Context, input *monitor_dto.Top10Input) (interface{}, error) {
	switch input.DataType {
	case monitor_dto.DataTypeApi:
		return i.module.TopAPIStatistics(ctx, 10, input.CommonInput)
	case monitor_dto.DataTypeProvider:
		return i.module.TopProviderStatistics(ctx, 10, input.CommonInput)
	case monitor_dto.DataTypeSubscriber:
		return i.module.TopSubscriberStatistics(ctx, 10, input.CommonInput)
	default:
		return nil, fmt.Errorf("unsupported data type: %s", input.DataType)
	}
}

var (
	_ IMonitorConfigController = (*imlMonitorConfig)(nil)
)

type imlMonitorConfig struct {
	module monitor.IMonitorConfigModule `autowired:""`
}

func (p *imlMonitorConfig) SaveMonitorConfig(ctx *gin.Context, cfg *monitor_dto.SaveMonitorConfig) (*monitor_dto.MonitorConfig, error) {
	return p.module.SaveMonitorConfig(ctx, cfg)
}

func (p *imlMonitorConfig) GetMonitorConfig(ctx *gin.Context) (*monitor_dto.MonitorConfig, error) {
	return p.module.GetMonitorConfig(ctx)
}

func (p *imlMonitorConfig) GetMonitorCluster(ctx *gin.Context) ([]*monitor_dto.MonitorCluster, error) {
	return p.module.GetMonitorCluster(ctx)
}
