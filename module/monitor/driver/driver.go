package driver

import (
	"context"
	"time"

	"github.com/APIParkLab/APIPark/service/monitor"
)

type IDriver interface {
	Name() string
	Check(cfg string) error
	Create(cfg string) (IExecutor, error)
}

type IExecutor interface {
	Init(ctx context.Context) error
	CommonStatistics(ctx context.Context, start, end time.Time, groupBy string, limit int, wheres []monitor.MonWhereItem) (map[string]monitor.MonCommonData, error)
	RequestSummary(ctx context.Context, start time.Time, end time.Time, wheres []monitor.MonWhereItem) (*monitor.Summary, error)
	ProxySummary(ctx context.Context, start time.Time, end time.Time, wheres []monitor.MonWhereItem) (*monitor.Summary, error)
	InvokeTrend(ctx context.Context, start time.Time, end time.Time, wheres []monitor.MonWhereItem) (*monitor.MonInvokeCountTrend, string, error)
	ProxyTrend(ctx context.Context, start time.Time, end time.Time, wheres []monitor.MonWhereItem) (*monitor.MonInvokeCountTrend, string, error)
	MessageTrend(ctx context.Context, start time.Time, end time.Time, wheres []monitor.MonWhereItem) (*monitor.MonMessageTrend, string, error)
}
