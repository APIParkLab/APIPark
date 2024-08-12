package system

import (
	"context"
	"reflect"

	"github.com/eolinker/go-common/autowire"
)

type ISystemPermitModule interface {
	Permissions(ctx context.Context) ([]string, error)
}

func init() {
	autowire.Auto[ISystemPermitModule](func() reflect.Value {
		return reflect.ValueOf(new(imlSystemPermitModule))
	})
}
