package monitor

import (
	"context"
	"reflect"
	"time"

	"github.com/eolinker/go-common/autowire"

	_ "github.com/APIParkLab/APIPark/module/monitor/driver/influxdb-v2"
	monitor_dto "github.com/APIParkLab/APIPark/module/monitor/dto"
)

type IMonitorStatisticModule interface {
	TopAPIStatistics(ctx context.Context, limit int, input *monitor_dto.CommonInput) ([]*monitor_dto.ApiStatisticItem, error)
	TopProviderStatistics(ctx context.Context, limit int, input *monitor_dto.CommonInput) ([]*monitor_dto.ProjectStatisticItem, error)
	TopSubscriberStatistics(ctx context.Context, limit int, input *monitor_dto.CommonInput) ([]*monitor_dto.ProjectStatisticItem, error)
	// RequestSummary 请求概况
	RequestSummary(ctx context.Context, input *monitor_dto.CommonInput) (*monitor_dto.MonSummaryOutput, error)
	// ProxySummary 转发概况
	ProxySummary(ctx context.Context, input *monitor_dto.CommonInput) (*monitor_dto.MonSummaryOutput, error)

	// InvokeTrend 调用次数趋势
	InvokeTrend(ctx context.Context, input *monitor_dto.CommonInput) (*monitor_dto.MonInvokeCountTrend, string, error)

	// MessageTrend 消息趋势
	MessageTrend(ctx context.Context, input *monitor_dto.CommonInput) (*monitor_dto.MonMessageTrend, string, error)
}

type IMonitorConfigModule interface {
	SaveMonitorConfig(ctx context.Context, cfg *monitor_dto.SaveMonitorConfig) (*monitor_dto.MonitorConfig, error)
	GetMonitorConfig(ctx context.Context) (*monitor_dto.MonitorConfig, error)
	GetMonitorCluster(ctx context.Context) ([]*monitor_dto.MonitorCluster, error)
}

func init() {
	autowire.Auto[IMonitorStatisticModule](func() reflect.Value {
		return reflect.ValueOf(new(imlMonitorStatisticModule))
	})

	autowire.Auto[IMonitorConfigModule](func() reflect.Value {
		return reflect.ValueOf(new(imlMonitorConfig))
	})
}
func formatTimeByMinute(org int64) time.Time {
	t := time.Unix(org, 0)
	location, _ := time.LoadLocation("Asia/Shanghai")
	return time.Date(t.Year(), t.Month(), t.Day(), t.Hour(), t.Minute(), 0, 0, location)
}
