package cluster

import (
	"context"
	"reflect"
	
	cluster_dto "github.com/APIParkLab/APIPark/module/cluster/dto"
	"github.com/eolinker/go-common/autowire"
)

type IClusterModule interface {
	CheckCluster(ctx context.Context, address ...string) ([]*cluster_dto.Node, error)
	ResetCluster(ctx context.Context, clusterId string, address string) ([]*cluster_dto.Node, error)
	ClusterNodes(ctx context.Context, clusterId string) ([]*cluster_dto.Node, error)
}

func init() {
	autowire.Auto[IClusterModule](func() reflect.Value {
		return reflect.ValueOf(new(imlClusterModule))
	})
}
