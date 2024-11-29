package cluster

import (
	"context"

	"github.com/APIParkLab/APIPark/service/setting"

	cluster_dto "github.com/APIParkLab/APIPark/module/cluster/dto"

	"github.com/APIParkLab/APIPark/gateway/admin"
	"github.com/eolinker/eosc/log"

	"github.com/eolinker/go-common/store"

	"github.com/APIParkLab/APIPark/gateway"

	"github.com/APIParkLab/APIPark/service/cluster"
	"github.com/eolinker/ap-account/service/account"
	"github.com/eolinker/go-common/utils"
)

var (
	_ IClusterModule = (*imlClusterModule)(nil)
)

type imlClusterModule struct {
	clusterService  cluster.IClusterService `autowired:""`
	settingService  setting.ISettingService `autowired:""`
	userNameService account.IAccountService `autowired:""`
	transaction     store.ITransaction      `autowired:""`
}

func (m *imlClusterModule) CheckCluster(ctx context.Context, address ...string) ([]*cluster_dto.Node, error) {
	info, err := admin.Admin(address...).Info(ctx)
	if err != nil {
		return nil, err
	}
	nodesOut := utils.SliceToSlice(info.Nodes, func(i *admin.Node) *cluster_dto.Node {
		return &cluster_dto.Node{
			Id:       i.Id,
			Name:     i.Name,
			Admins:   i.Admin,
			Peers:    i.Peer,
			Gateways: i.Server,
		}
	})
	nodeStatus(ctx, nodesOut)

	return nodesOut, nil
}

func (m *imlClusterModule) ResetCluster(ctx context.Context, clusterId string, address string) ([]*cluster_dto.Node, error) {

	nodes, err := m.clusterService.UpdateAddress(ctx, clusterId, address)
	if err != nil {
		return nil, err
	}
	err = m.initGateway(ctx, clusterId)
	if err != nil {
		return nil, err
	}
	nodesOut := utils.SliceToSlice(nodes, func(i *cluster.Node) *cluster_dto.Node {
		return &cluster_dto.Node{
			Id:       i.Uuid,
			Name:     i.Name,
			Admins:   i.Admin,
			Peers:    i.Peer,
			Gateways: i.Server,
		}
	})
	v, has := m.settingService.Get(ctx, setting.KeyInvokeAddress)
	if (!has || v == "") && len(nodesOut) > 0 && len(nodesOut[0].Gateways) > 0 {
		m.settingService.Set(ctx, setting.KeyInvokeAddress, nodesOut[0].Gateways[0], utils.UserId(ctx))
	}
	nodeStatus(ctx, nodesOut)
	return nodesOut, nil
}
func (m *imlClusterModule) initGateway(ctx context.Context, clusterId string) error {
	client, err := m.clusterService.GatewayClient(ctx, clusterId)
	if err != nil {
		return err
	}
	defer func() {
		err := client.Close(ctx)
		if err != nil {
			log.Warn("close apinto client:", err)
		}
	}()
	return gateway.InitGateway(ctx, clusterId, client)
}
func (m *imlClusterModule) ClusterNodes(ctx context.Context, clusterId string) ([]*cluster_dto.Node, error) {

	nodes, err := m.clusterService.Nodes(ctx)
	if err != nil {
		return nil, err
	}
	nodesOut := utils.SliceToSlice(nodes, func(i *cluster.Node) *cluster_dto.Node {
		return &cluster_dto.Node{
			Id:       i.Uuid,
			Name:     i.Name,
			Admins:   i.Admin,
			Peers:    i.Peer,
			Gateways: i.Server,
		}
	})
	nodeStatus(ctx, nodesOut)

	return nodesOut, nil
}

//
//func (m *imlClusterModule) CreatePartition(ctx context.Context, create *paritiondto.Create) (*paritiondto.Detail, error) {
//	if create.Id == "" {
//		create.Id = uuid.New().String()
//	}
//	if create.Name == "" {
//		return nil, errors.New("name is empty")
//	}
//	clusterId := ""
//	err := m.transaction.Transaction(ctx, func(ctx context.Context) error {
//		clusterInfo, err := m.clusterService.Create(ctx, create.Id, create.Id, create.Description, create.ManagerAddress)
//		if err != nil {
//			return err
//		}
//		if create.Prefix != "" {
//			create.Prefix = fmt.Sprintf("/%s", strings.TrimPrefix(create.Prefix, "/"))
//		}
//		clusterId = clusterInfo.Uuid
//		return m.partitionService.Create(ctx, &partition.CreatePartition{
//			Uuid:    create.Id,
//			Name:    create.Name,
//			Resume:  create.Description,
//			Prefix:  create.Prefix,
//			Url:     create.Url,
//			Cluster: clusterInfo.Uuid,
//		})
//	})
//	if err != nil {
//		return nil, err
//	}
//	err = m.initGateway(ctx, create.Id, clusterId)
//	if err != nil {
//		return nil, err
//	}
//	return m.Get(ctx, create.Id)
//}
//
//func (m *imlClusterModule) SearchByDriver(ctx context.Context, keyword string) ([]*paritiondto.Item, error) {
//	partitions, err := m.partitionService.SearchByDriver(ctx, keyword, nil)
//	if err != nil {
//		return nil, err
//	}
//	countMap, err := m.clusterService.CountByPartition(ctx)
//	if err != nil {
//		return nil, err
//	}
//	items := utils.SliceToSlice(partitions, func(i *partition.Cluster) *paritiondto.Item {
//
//		return &paritiondto.Item{
//			Creator:     auto.UUID(i.Creator),
//			Updater:     auto.UUID(i.Updater),
//			Id:          i.UUID,
//			Name:        i.Name,
//			Description: i.Resume,
//			ClusterNum:  countMap[i.UUID],
//			CreateTime:  auto.TimeLabel(i.CreateTime),
//			UpdateTime:  auto.TimeLabel(i.UpdateTime),
//		}
//	})
//	if len(items) > 0 {
//		counts, err := m.clusterService.CountByPartition(ctx)
//		if err != nil {
//			return nil, err
//		}
//		for _, item := range items {
//			item.ClusterNum = counts[item.Id]
//		}
//	}
//
//	return items, nil
//}
//
//func (m *imlClusterModule) Get(ctx context.Context, id string) (*paritiondto.Detail, error) {
//	pm, err := m.partitionService.Get(ctx, id)
//	if err != nil {
//		return nil, err
//	}
//	//oDetails, err := m.organizationService.SearchByDriver(ctx, "")
//	//if err != nil {
//	//	return nil, err
//	//}
//	//canDelete := true
//	//for _, o := range oDetails {
//	//	for _, p := range o.Clusters {
//	//		if p == id {
//	//			canDelete = false
//	//			break
//	//		}
//	//	}
//	//	if !canDelete {
//	//		break
//	//	}
//	//}
//
//	pd := &paritiondto.Detail{
//		Creator:     auto.UUID(pm.Creator),
//		Updater:     auto.UUID(pm.Updater),
//		Id:          pm.UUID,
//		Name:        pm.Name,
//		Description: pm.Resume,
//		Prefix:      pm.Prefix,
//		CreateTime:  auto.TimeLabel(pm.CreateTime),
//		UpdateTime:  auto.TimeLabel(pm.UpdateTime),
//		//CanDelete:   canDelete,
//	}
//	return pd, nil
//}
//
//func (m *imlClusterModule) Update(ctx context.Context, id string, edit *paritiondto.Edit) (*paritiondto.Detail, error) {
//	err := m.partitionService.Save(ctx, id, &partition.EditPartition{
//		Name:   edit.Name,
//		Resume: edit.Description,
//		Prefix: edit.Prefix,
//		Url:    edit.Url,
//	})
//	if err != nil {
//		return nil, err
//	}
//	return m.Get(ctx, id)
//}
//
//func (m *imlClusterModule) Delete(ctx context.Context, id string) error {
//	return m.transaction.Transaction(ctx, func(ctx context.Context) error {
//		info, err := m.partitionService.Get(ctx, id)
//		if err != nil {
//			if errors.Is(err, gorm.ErrRecordNotFound) {
//				return nil
//			}
//			return err
//		}
//		err = m.clusterService.Delete(ctx, info.Cluster)
//		if err != nil {
//			return err
//		}
//		return m.partitionService.Delete(ctx, id)
//	})
//
//}
//
//func (m *imlClusterModule) Simple(ctx context.Context) ([]*paritiondto.Simple, error) {
//	pm, err := m.partitionService.SearchByDriver(ctx, "", nil)
//	if err != nil {
//		return nil, err
//	}
//	pd := utils.SliceToSlice(pm, func(i *partition.Cluster) *paritiondto.Simple {
//		return &paritiondto.Simple{
//			Id:   i.UUID,
//			Name: i.Name,
//		}
//	})
//	return pd, nil
//}
//
//func (m *imlClusterModule) SimpleByIds(ctx context.Context, ids []string) ([]*paritiondto.Simple, error) {
//	pm, err := m.partitionService.SearchByDriver(ctx, "", map[string]interface{}{
//		"uuid": ids,
//	})
//	if err != nil {
//		return nil, err
//	}
//	pd := utils.SliceToSlice(pm, func(i *partition.Cluster) *paritiondto.Simple {
//		return &paritiondto.Simple{
//			Id:   i.UUID,
//			Name: i.Name,
//		}
//	})
//	return pd, nil
//
//}
//func (m *imlClusterModule) SimpleWithCluster(ctx context.Context) ([]*paritiondto.SimpleWithCluster, error) {
//	pm, err := m.partitionService.SearchByDriver(ctx, "", nil)
//	if err != nil {
//		return nil, err
//	}
//
//	clusterList, err := m.clusterService.List(ctx)
//	if err != nil {
//		return nil, err
//	}
//
//	clusterMap := utils.SliceToMapArrayO(clusterList, func(i *cluster.Cluster) (string, *paritiondto.Cluster) {
//		return i.Cluster, &paritiondto.Cluster{
//			Id:          i.Uuid,
//			Name:        i.Name,
//			Description: i.Resume,
//		}
//	})
//	pd := utils.SliceToSlice(pm, func(i *partition.Cluster) *paritiondto.SimpleWithCluster {
//		return &paritiondto.SimpleWithCluster{
//			Id:       i.UUID,
//			Name:     i.Name,
//			Clusters: clusterMap[i.UUID],
//		}
//	})
//	return pd, nil
//}
