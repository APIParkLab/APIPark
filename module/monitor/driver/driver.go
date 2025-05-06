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

	IBasicOverview

	IRestOverview

	IAIOverview
}

type IBasicOverview interface {
	RequestOverview(ctx context.Context, start time.Time, end time.Time, wheres []monitor.MonWhereItem) ([]time.Time, *monitor.StatusCodeOverview, []*monitor.StatusCodeOverview, error)
	TopN(ctx context.Context, start time.Time, end time.Time, limit int, groupBy string, wheres []monitor.MonWhereItem) ([]*monitor.TopN, error)
	ConsumerOverview(ctx context.Context, start time.Time, end time.Time, wheres []monitor.MonWhereItem) (int64, map[time.Time]int64, error)
}

type IRestOverview interface {
	TrafficOverviewByStatusCode(ctx context.Context, start time.Time, end time.Time, wheres []monitor.MonWhereItem) ([]time.Time, *monitor.StatusCodeOverview, []*monitor.StatusCodeOverview, error)
	AvgResponseTimeOverview(ctx context.Context, start time.Time, end time.Time, wheres []monitor.MonWhereItem) ([]time.Time, *monitor.Aggregate, []int64, error)
	SumResponseTimeOverview(ctx context.Context, start time.Time, end time.Time, wheres []monitor.MonWhereItem) ([]time.Time, *monitor.Aggregate, []int64, error)
}

type IAIOverview interface {
	TokenOverview(ctx context.Context, start time.Time, end time.Time, wheres []monitor.MonWhereItem) ([]time.Time, *monitor.TokenOverview, []*monitor.TokenOverview, error)
}
