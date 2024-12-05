package log

import (
	"context"
	"reflect"
	"time"

	_ "github.com/APIParkLab/APIPark/log-driver/loki"
	"github.com/eolinker/go-common/autowire"
)

type ILogService interface {
	UpdateLogSource(ctx context.Context, driver string, input *Save) error
	GetLogSource(ctx context.Context, driver string) (*Source, error)
	Logs(ctx context.Context, driver string, cluster string, conditions map[string]string, start time.Time, end time.Time, limit int64, offset int64) ([]*Item, int64, error)
	LogCount(ctx context.Context, driver string, cluster string, conditions map[string]string, spendHour int64, group string) (map[string]int64, error)
	LogInfo(ctx context.Context, driver string, cluster string, id string) (*Info, error)
}

func init() {
	logService := &imlLogService{}
	autowire.Auto[ILogService](func() reflect.Value {
		return reflect.ValueOf(logService)
	})
}
