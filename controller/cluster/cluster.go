package cluster

import (
	"reflect"
	
	cluster_dto "github.com/APIParkLab/APIPark/module/cluster/dto"
	
	"github.com/eolinker/go-common/autowire"
	"github.com/gin-gonic/gin"
)

type IClusterController interface {
	Nodes(ctx *gin.Context, clusterId string) ([]*cluster_dto.Node, error)
	ResetCluster(ctx *gin.Context, clusterId string, input *cluster_dto.ResetCluster) ([]*cluster_dto.Node, error)
	Check(ctx *gin.Context, input *cluster_dto.CheckCluster) ([]*cluster_dto.Node, error)
}

func init() {
	autowire.Auto[IClusterController](func() reflect.Value {
		return reflect.ValueOf(new(imlCluster))
	})
}
