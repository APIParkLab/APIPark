package monitor

import (
	"context"
	"reflect"
	"time"

	"github.com/eolinker/go-common/autowire"
)

type IMonitorService interface {
	// Get 获取监控配置
	Get(ctx context.Context, id string) (*Monitor, error)
	// MapByCluster 获取监控配置
	MapByCluster(ctx context.Context, clusterIds ...string) (map[string]*Monitor, error)
	GetByCluster(ctx context.Context, clusterId string) (*Monitor, error)
	// Save 保存监控配置
	Save(ctx context.Context, monitor *SaveMonitor) error
}

func init() {
	autowire.Auto[IMonitorService](func() reflect.Value {
		return reflect.ValueOf(new(imlMonitorService))
	})

	autowire.Auto[IMonitorStatisticsCache](func() reflect.Value {
		return reflect.ValueOf(new(imlMonitorStatisticsCacheService))
	})
}

type IMonitorStatisticsCache interface {
	GetStatisticsCache(ctx context.Context, partitionId string, start, end time.Time, groupBy string, wheres []MonWhereItem, limit int) (map[string]MonCommonData, error)
	SetStatisticsCache(ctx context.Context, partitionId string, start, end time.Time, groupBy string, wheres []MonWhereItem, limit int, values map[string]MonCommonData) error

	GetTrendCache(ctx context.Context, partitionId string, start, end time.Time, wheres []MonWhereItem) (*MonInvokeCountTrend, error)
	SetTrendCache(ctx context.Context, partitionId string, start, end time.Time, wheres []MonWhereItem, value *MonInvokeCountTrend) error

	//GetCircularMap(ctx context.Context, partitionId string, start, end time.Time, wheres []MonWhereItem) (request, proxy *CircularDate, err error)
	//SetCircularMap(ctx context.Context, partitionId string, start, end time.Time, wheres []MonWhereItem, request, proxy *CircularDate) error

	GetMessageTrend(ctx context.Context, partitionId string, start, end time.Time, wheres []MonWhereItem) (*MonMessageTrend, error)
	SetMessageTrend(ctx context.Context, partitionId string, start, end time.Time, wheres []MonWhereItem, val *MonMessageTrend) error
}

// IMonitorSourceDriver 监控数据源驱动
type IMonitorSourceDriver interface {
	CheckInput(config []byte) ([]byte, error)
}

type IMonitorSourceManager interface {
	//driver.IDriverManager[IMonitorSourceDriver]
	List() []string
}
