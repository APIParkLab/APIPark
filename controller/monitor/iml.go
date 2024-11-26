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

func (i *imlMonitorStatisticController) Statistics(ctx *gin.Context, dataType string, input *monitor_dto.StatisticInput) (interface{}, error) {
	switch dataType {
	case monitor_dto.DataTypeApi:
		return i.module.ApiStatistics(ctx, input)
	case monitor_dto.DataTypeProvider:
		return i.module.ProviderStatistics(ctx, input)
	case monitor_dto.DataTypeSubscriber:
		return i.module.SubscriberStatistics(ctx, input)
	default:
		return nil, fmt.Errorf("unsupported data type: %s", dataType)
	}
}

func (i *imlMonitorStatisticController) InvokeTrend(ctx *gin.Context, dataType string, id string, input *monitor_dto.CommonInput) (*monitor_dto.MonInvokeCountTrend, string, error) {
	switch dataType {
	case monitor_dto.DataTypeApi:
		return i.module.APITrend(ctx, id, input)
	case monitor_dto.DataTypeProvider:
		return i.module.ProviderTrend(ctx, id, input)
	case monitor_dto.DataTypeSubscriber:
		return i.module.SubscriberTrend(ctx, id, input)
	default:
		return nil, "", fmt.Errorf("unsupported data type: %s", dataType)
	}
}

func (i *imlMonitorStatisticController) InvokeTrendInner(ctx *gin.Context, dataType string, typ string, api string, provider string, subscriber string, input *monitor_dto.CommonInput) (*monitor_dto.MonInvokeCountTrend, string, error) {
	if dataType == monitor_dto.DataTypeApi && typ == monitor_dto.DataTypeSubscriber || dataType == monitor_dto.DataTypeSubscriber && typ == monitor_dto.DataTypeApi {
		return i.module.InvokeTrendWithSubscriberAndApi(ctx, api, subscriber, input)
	} else if dataType == monitor_dto.DataTypeApi && typ == monitor_dto.DataTypeProvider || dataType == monitor_dto.DataTypeProvider && typ == monitor_dto.DataTypeApi {
		return i.module.InvokeTrendWithProviderAndApi(ctx, provider, api, input)
	}
	return nil, "", fmt.Errorf("unsupported detail type: %s, data type is %s", typ, dataType)
}

func (i *imlMonitorStatisticController) StatisticsInner(ctx *gin.Context, dataType string, typ string, id string, input *monitor_dto.StatisticInput) (interface{}, error) {
	switch dataType {
	case monitor_dto.DataTypeApi:
		switch typ {
		case monitor_dto.DataTypeProvider:
			return i.module.ProviderStatisticsOnApi(ctx, id, input)
		case monitor_dto.DataTypeSubscriber:
			return i.module.SubscriberStatisticsOnApi(ctx, id, input)
		default:
			return nil, fmt.Errorf("unsupported detail type: %s, data type is %s", typ, dataType)
		}
	case monitor_dto.DataTypeProvider:
		switch typ {
		case monitor_dto.DataTypeApi:
			return i.module.ApiStatisticsOnProvider(ctx, id, input)
		default:
			return nil, fmt.Errorf("unsupported detail type: %s, data type is %s", typ, dataType)
		}
	case monitor_dto.DataTypeSubscriber:
		switch typ {
		case monitor_dto.DataTypeApi:
			return i.module.ApiStatisticsOnSubscriber(ctx, id, input)
		default:
			return nil, fmt.Errorf("unsupported detail type: %s, data type is %s", typ, dataType)
		}
	}
	return nil, fmt.Errorf("unsupported data type: %s", dataType)
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
