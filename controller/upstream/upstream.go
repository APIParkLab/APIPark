package upstream

import (
	"reflect"

	"github.com/eolinker/go-common/autowire"

	upstream_dto "github.com/APIParkLab/APIPark/module/upstream/dto"
	"github.com/gin-gonic/gin"
)

type IUpstreamController interface {
	Get(ctx *gin.Context, serviceId string) (upstream_dto.UpstreamConfig, error)
	Save(ctx *gin.Context, serviceId string, upstream *upstream_dto.Upstream) (upstream_dto.UpstreamConfig, error)
}

func init() {
	autowire.Auto[IUpstreamController](func() reflect.Value {
		return reflect.ValueOf(new(imlUpstreamController))
	})
}
