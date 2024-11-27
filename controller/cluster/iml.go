package cluster

import (
	"github.com/APIParkLab/APIPark/module/cluster"
	cluster_dto "github.com/APIParkLab/APIPark/module/cluster/dto"
	"github.com/gin-gonic/gin"
)

var (
	_ IClusterController = (*imlCluster)(nil)
)

type imlCluster struct {
	module cluster.IClusterModule `autowired:""`
}

func (p *imlCluster) Nodes(ctx *gin.Context, clusterId string) ([]*cluster_dto.Node, error) {
	if clusterId == "" {
		clusterId = "default"
	}
	return p.module.ClusterNodes(ctx, clusterId)
}

func (p *imlCluster) ResetCluster(ctx *gin.Context, clusterId string, input *cluster_dto.ResetCluster) ([]*cluster_dto.Node, error) {
	if clusterId == "" {
		clusterId = "default"
	}
	return p.module.ResetCluster(ctx, clusterId, input.ManagerAddress)
}

func (p *imlCluster) Check(ctx *gin.Context, input *cluster_dto.CheckCluster) ([]*cluster_dto.Node, error) {
	return p.module.CheckCluster(ctx, input.Address)
}

//
//func (p *imlCluster) SimpleWithCluster(ctx *gin.Context) ([]*parition_dto.SimpleWithCluster, error) {
//	return p.module.SimpleWithCluster(ctx)
//}
//
//func (p *imlCluster) Delete(ctx *gin.Context, id string) (string, error) {
//	err := p.module.Delete(ctx, id)
//	if err != nil {
//		return "", err
//	}
//	return id, nil
//}
//
//func (p *imlCluster) SearchByDriver(ctx *gin.Context, keyword string) ([]*parition_dto.Item, error) {
//	return p.module.SearchByDriver(ctx, keyword)
//}
//
//func (p *imlCluster) Simple(ctx *gin.Context) ([]*parition_dto.Simple, error) {
//	return p.module.Simple(ctx)
//}
//
//func (p *imlCluster) Info(ctx *gin.Context, id string) (*parition_dto.Detail, error) {
//	if id == "" {
//		return nil, errors.New("id is empty")
//	}
//	return p.module.Get(ctx, id)
//}
//
//func (p *imlCluster) Update(ctx *gin.Context, id string, input *parition_dto.Edit) (*parition_dto.Detail, error) {
//	return p.module.Update(ctx, id, input)
//}
//
//func (p *imlCluster) Create(ctx *gin.Context, input *parition_dto.Create) (*parition_dto.Detail, string, auto.TimeLabel, error) {
//	detail, err := p.module.CreatePartition(ctx, input)
//	if err != nil {
//		return nil, "", auto.TimeLabel{}, err
//	}
//	return detail, detail.Id, detail.UpdateTime, nil
//}
