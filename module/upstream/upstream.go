package upstream

import (
	"context"
	"reflect"
	
	"github.com/eolinker/go-common/autowire"
	
	upstream_dto "github.com/APIParkLab/APIPark/module/upstream/dto"
)

type IUpstreamModule interface {
	Get(ctx context.Context, pid string) (upstream_dto.UpstreamConfig, error)
	Save(ctx context.Context, pid string, upstream upstream_dto.UpstreamConfig) (upstream_dto.UpstreamConfig, error)
}

func init() {
	autowire.Auto[IUpstreamModule](func() reflect.Value {
		return reflect.ValueOf(new(imlUpstreamModule))
	})
}
