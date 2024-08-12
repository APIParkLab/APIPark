package service_diff

import (
	"context"
	"reflect"
	
	"github.com/APIParkLab/APIPark/service/service_diff"
	"github.com/eolinker/go-common/autowire"
)

var (
	_ IServiceDiffModule = (*imlServiceDiff)(nil)
)

type IServiceDiffModule interface {
	Diff(ctx context.Context, serviceId string, baseRelease, targetRelease string) (*service_diff.Diff, error)
	DiffForLatest(ctx context.Context, serviceId string, baseRelease string) (*service_diff.Diff, bool, error)
	Out(ctx context.Context, diff *service_diff.Diff) (*DiffOut, error)
}

func init() {
	autowire.Auto[IServiceDiffModule](func() reflect.Value {
		return reflect.ValueOf(new(imlServiceDiff))
	})
}
