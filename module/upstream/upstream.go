package upstream

import (
	"context"
	"github.com/APIParkLab/APIPark/module/system"
	"reflect"

	"github.com/eolinker/go-common/autowire"

	upstream_dto "github.com/APIParkLab/APIPark/module/upstream/dto"
)

type IUpstreamModule interface {
	Get(ctx context.Context, pid string) (upstream_dto.UpstreamConfig, error)
	Save(ctx context.Context, pid string, upstream upstream_dto.UpstreamConfig) (upstream_dto.UpstreamConfig, error)
	//ExportAll(ctx context.Context) ([]*upstream_dto.ExportUpstream, error)
}

type IExportUpstreamModule interface {
	system.IExportModule[upstream_dto.ExportUpstream]
}

func init() {
	upstreamModule := new(imlUpstreamModule)
	autowire.Auto[IUpstreamModule](func() reflect.Value {
		return reflect.ValueOf(upstreamModule)
	})

	autowire.Auto[IExportUpstreamModule](func() reflect.Value {
		return reflect.ValueOf(upstreamModule)
	})
}
