package log

import (
	"context"
	"reflect"

	"github.com/eolinker/go-common/autowire"

	log_dto "github.com/APIParkLab/APIPark/module/log/dto"
)

type ILogModule interface {
	Save(ctx context.Context, driver string, input *log_dto.Save) error
	Get(ctx context.Context, driver string) (*log_dto.LogSource, error)
}

func init() {
	autowire.Auto[ILogModule](func() reflect.Value {
		return reflect.ValueOf(new(imlLogModule))
	})
}
