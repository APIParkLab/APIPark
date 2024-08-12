package release

import (
	"context"
	"reflect"
	
	"github.com/APIParkLab/APIPark/module/release/dto"
	"github.com/APIParkLab/APIPark/service/service_diff"
	"github.com/eolinker/go-common/autowire"
)

type IReleaseModule interface {
	Create(ctx context.Context, service string, input *dto.CreateInput) (string, error)
	Detail(ctx context.Context, service string, id string) (*dto.Detail, error)
	List(ctx context.Context, service string) ([]*dto.Release, error)
	Delete(ctx context.Context, service string, id string) error
	Preview(ctx context.Context, service string) (*dto.Release, *service_diff.Diff, bool, error)
}

func init() {
	autowire.Auto[IReleaseModule](func() reflect.Value {
		return reflect.ValueOf(new(imlReleaseModule))
	})
}
