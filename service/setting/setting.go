package setting

import (
	"context"
	"reflect"

	"github.com/eolinker/go-common/autowire"
)

type ISettingService interface {
	Get(ctx context.Context, name string) (value string, has bool)
	Set(ctx context.Context, name string, value string, operator string) error
	All(ctx context.Context) (map[string]string, error)
}

func init() {
	autowire.Auto[ISettingService](func() reflect.Value {
		return reflect.ValueOf(new(imlSettingService))
	})
}
