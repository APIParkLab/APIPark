package upstream

import (
	"github.com/APIParkLab/APIPark/module/cluster"
	"github.com/APIParkLab/APIPark/module/service"
	"github.com/APIParkLab/APIPark/module/upstream"
	upstream_dto "github.com/APIParkLab/APIPark/module/upstream/dto"
	"github.com/gin-gonic/gin"
)

var (
	_ IUpstreamController = (*imlUpstreamController)(nil)
)

type imlUpstreamController struct {
	upstreamModule  upstream.IUpstreamModule `autowired:""`
	projectModule   service.IServiceModule   `autowired:""`
	partitionModule cluster.IClusterModule   `autowired:""`
}

func (i *imlUpstreamController) Get(ctx *gin.Context, serviceId string) (upstream_dto.UpstreamConfig, error) {
	return i.upstreamModule.Get(ctx, serviceId)
}

func (i *imlUpstreamController) Save(ctx *gin.Context, serviceId string, upstream *upstream_dto.Upstream) (upstream_dto.UpstreamConfig, error) {
	return i.upstreamModule.Save(ctx, serviceId, upstream)
}
