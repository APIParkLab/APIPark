package cluster

import (
	"context"
	"errors"
	"reflect"
	"strings"
	"time"

	"github.com/APIParkLab/APIPark/gateway"
	"github.com/APIParkLab/APIPark/gateway/admin"
	"github.com/APIParkLab/APIPark/stores/cluster"
	"github.com/eolinker/go-common/auto"
	"github.com/eolinker/go-common/autowire"
	"github.com/eolinker/go-common/utils"
	"gorm.io/gorm"
)

var (
	_                IClusterService      = (*imlClusterService)(nil)
	_                auto.CompleteService = (*imlClusterService)(nil)
	DefaultClusterID                      = "default"
)

type IClusterService interface {
	CountByPartition(ctx context.Context) (map[string]int, error)
	List(ctx context.Context, clusterIds ...string) ([]*Cluster, error)
	ListByClusters(ctx context.Context, ids ...string) ([]*Cluster, error)
	Search(ctx context.Context, keyword string, clusterId ...string) ([]*Cluster, error)
	Create(ctx context.Context, name string, resume string, address string) (*Cluster, error)
	UpdateInfo(ctx context.Context, id string, name *string, resume *string) (*Cluster, error)
	UpdateAddress(ctx context.Context, id string, address string) ([]*Node, error)
	Nodes(ctx context.Context, clusterIds ...string) ([]*Node, error)
	GatewayClient(ctx context.Context, id string) (gateway.IClientDriver, error)
	Get(ctx context.Context, id string) (*Cluster, error)
	Delete(ctx context.Context, id string) error
}

type imlClusterService struct {
	store            cluster.IClusterStore            `autowired:""`
	nodeStore        cluster.IClusterNodeStore        `autowired:""`
	nodeAddressStore cluster.IClusterNodeAddressStore `autowired:""`
}

func (s *imlClusterService) GatewayClient(ctx context.Context, id string) (gateway.IClientDriver, error) {
	nodes, err := s.Nodes(ctx, id)
	if err != nil {
		return nil, err
	}
	address := make([]string, 0, len(nodes))
	for _, n := range nodes {
		address = append(address, n.Admin...)
	}
	return gateway.GetClient("apinto", &gateway.ClientConfig{
		Addresses: address,
	})
}

func (s *imlClusterService) ListByClusters(ctx context.Context, ids ...string) ([]*Cluster, error) {
	wm := make(map[string]interface{})

	if len(ids) > 0 {
		wm["uuid"] = ids
	}
	list, err := s.store.List(ctx, wm, "update_at desc")
	if err != nil {
		return nil, err
	}
	return utils.SliceToSlice(list, FromEntity), nil
}

func (s *imlClusterService) GetLabels(ctx context.Context, ids ...string) map[string]string {
	if len(ids) == 0 {
		return nil
	}
	if len(ids) == 1 {
		o, err := s.store.GetByUUID(ctx, ids[0])
		if err != nil || o == nil {
			return nil
		}
		return map[string]string{o.UUID: o.Name}
	}
	list, err := s.store.ListQuery(ctx, "uuid in ?", []interface{}{ids}, "id")
	if err != nil {
		return nil
	}
	return utils.SliceToMapO(list, func(o *cluster.Cluster) (string, string) { return o.UUID, o.Name })
}

func (s *imlClusterService) OnComplete() {
	auto.RegisterService("cluster", s)
}

func (s *imlClusterService) Delete(ctx context.Context, id string) error {
	return s.store.Transaction(ctx, func(ctx context.Context) error {
		_, err := s.store.DeleteWhere(ctx, map[string]interface{}{
			"uuid": id,
		})
		if err != nil {
			return err
		}
		_, err = s.nodeStore.DeleteWhere(ctx, map[string]interface{}{
			"cluster": id,
		})
		if err != nil {
			return err
		}
		_, err = s.nodeAddressStore.DeleteWhere(ctx, map[string]interface{}{
			"cluster": id,
		})
		if err != nil {
			return err
		}
		return nil
	})
}

func (s *imlClusterService) Get(ctx context.Context, id string) (*Cluster, error) {
	v, err := s.store.FirstQuery(ctx, "`uuid` = ?", []interface{}{id}, "id desc")
	if err != nil {
		return nil, err
	}
	return FromEntity(v), nil
}

func (s *imlClusterService) Create(ctx context.Context, name string, resume string, address string) (*Cluster, error) {
	apintoInfo, err := admin.Admin(address).Info(ctx)
	if err != nil {
		return nil, err
	}
	operator := utils.UserId(ctx)

	// check cluster
	query, err := s.store.FirstQuery(ctx, "`uuid` = ?", []interface{}{apintoInfo.Cluster}, "id desc")
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}
	if query != nil {
		return nil, errors.New("cluster already exists")
	}
	// check node
	nodeIds := utils.SliceToSlice(apintoInfo.Nodes, func(i *admin.Node) string {
		return i.Id
	})
	nodeNames := utils.SliceToSlice(apintoInfo.Nodes, func(i *admin.Node) string {
		return i.Name
	})

	nodeExist, err := s.nodeStore.FirstQuery(ctx, "`uuid` in (?) or `name` in (?)", []interface{}{nodeIds, nodeNames}, "id desc")
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}
	if nodeExist != nil {
		return nil, errors.New("node already exists")
	}

	en := &cluster.Cluster{
		Id:       0,
		UUID:     apintoInfo.Cluster,
		Name:     name,
		Resume:   resume,
		Cluster:  apintoInfo.Cluster,
		Creator:  operator,
		Updater:  operator,
		CreateAt: time.Now(),
		UpdateAt: time.Now(),
	}
	nodeEn, addrEn := s.genNodeEntity(apintoInfo.Cluster, apintoInfo.Nodes)
	err = s.store.Transaction(ctx, func(ctx context.Context) error {

		err := s.store.Insert(ctx, en)
		if err != nil {
			return err
		}
		err = s.nodeStore.Insert(ctx, nodeEn...)
		if err != nil {
			return err
		}
		err = s.nodeAddressStore.Insert(ctx, addrEn...)
		if err != nil {
			return err
		}
		return nil
	})
	if err != nil {
		return nil, err
	}
	return FromEntity(en), nil
}
func (s *imlClusterService) genNodeEntity(id string, nodes []*admin.Node) ([]*cluster.Node, []*cluster.NodeAddr) {
	nodeEn := make([]*cluster.Node, 0, len(nodes))
	addrAllTemp := make([][]*cluster.NodeAddr, 0, len(nodes))
	now := time.Now()
	for _, node := range nodes {
		nodeEn = append(nodeEn, &cluster.Node{
			Id:         0,
			UUID:       node.Id,
			Name:       node.Name,
			Cluster:    id,
			UpdateTime: now,
		})
		aden := make([]*cluster.NodeAddr, 0, len(node.Peer)+len(node.Admin)+len(node.Server))
		for _, addr := range node.Peer {
			aden = append(aden, &cluster.NodeAddr{
				Id:         0,
				Cluster:    id,
				Node:       node.Id,
				Type:       "peer",
				Addr:       addr,
				UpdateTime: now,
			})
		}
		for _, addr := range node.Admin {
			aden = append(aden, &cluster.NodeAddr{
				Id:         0,
				Cluster:    id,
				Node:       node.Id,
				Type:       "admin",
				Addr:       addr,
				UpdateTime: now,
			})
		}
		for _, addr := range node.Server {
			aden = append(aden, &cluster.NodeAddr{
				Id:         0,
				Cluster:    id,
				Node:       node.Id,
				Type:       "server",
				Addr:       addr,
				UpdateTime: now,
			})
		}
		addrAllTemp = append(addrAllTemp, aden)
	}

	return nodeEn, utils.SliceMerge(addrAllTemp)

}
func (s *imlClusterService) UpdateInfo(ctx context.Context, id string, name *string, resume *string) (c *Cluster, errOut error) {
	operator := utils.UserId(ctx)
	if name == nil && resume == nil {
		return nil, errors.New("no update")
	}
	errOut = s.store.Transaction(ctx, func(ctx context.Context) error {
		v, err := s.store.FirstQuery(ctx, "`uuid` = ?", []interface{}{id}, "id desc")
		if err != nil {
			return err
		}
		if name != nil {
			v.Name = *name
		}
		if resume != nil {
			v.Resume = *resume
		}
		v.Updater = operator
		v.UpdateAt = time.Now()
		upCount, err := s.store.Update(ctx, v)
		if err != nil {
			return err
		}
		if upCount == 0 {
			return errors.New("no update")
		}
		c = FromEntity(v)
		return nil
	})

	return

}

func (s *imlClusterService) UpdateAddress(ctx context.Context, id string, address string) ([]*Node, error) {

	info, err := admin.Admin(address).Info(ctx)
	if err != nil {
		return nil, err
	}
	//if info.Cluster != id {
	//	return nil, errors.New("cluster id not match")
	//}
	operator := utils.UserId(ctx)
	now := time.Now()
	cv, err := s.store.FirstQuery(ctx, "`uuid` = ?", []interface{}{id}, "id desc")
	if err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, err
		}
		cv = &cluster.Cluster{
			UUID:   id,
			Name:   "默认集群",
			Resume: "默认集群",

			Creator:  operator,
			CreateAt: now,
		}
	}
	cv.Cluster = info.Cluster

	// check node
	nodeIds := utils.SliceToSlice(info.Nodes, func(i *admin.Node) string {
		return i.Id
	})
	nodeNames := utils.SliceToSlice(info.Nodes, func(i *admin.Node) string {
		return i.Name
	})

	nodeExist, err := s.nodeStore.FirstQuery(ctx, "`cluster` = ? and (`uuid` in (?) or `name` in (?))", []interface{}{id, nodeIds, nodeNames}, "id desc")
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}
	if nodeExist != nil && id != nodeExist.Cluster {
		return nil, errors.New("node already exists")
	}
	s.genNodeEntity(id, info.Nodes)
	nodeEn, addrEn := s.genNodeEntity(id, info.Nodes)
	err = s.store.Transaction(ctx, func(ctx context.Context) error {
		_, err := s.nodeStore.DeleteWhere(ctx, map[string]interface{}{
			"cluster": id,
		})
		if err != nil {
			return err
		}
		_, err = s.nodeAddressStore.DeleteWhere(ctx, map[string]interface{}{
			"cluster": id,
		})
		if err != nil {
			return err
		}
		cv.Updater = operator
		cv.UpdateAt = now
		err = s.store.Save(ctx, cv)
		if err != nil {
			return err
		}
		//if uc == 0 {
		//	return errors.New("no update")
		//}
		err = s.nodeStore.Insert(ctx, nodeEn...)
		if err != nil {
			return err
		}
		err = s.nodeAddressStore.Insert(ctx, addrEn...)
		if err != nil {
			return err
		}
		return nil
	})
	if err != nil {
		return nil, err
	}
	return s.Nodes(ctx, id)

}

func (s *imlClusterService) Nodes(ctx context.Context, clusterIds ...string) ([]*Node, error) {
	w := make(map[string]interface{})
	if len(clusterIds) > 0 {
		w["cluster"] = clusterIds
	}
	nodeAddrs, err := s.nodeAddressStore.List(ctx, w, "id desc")
	if err != nil {
		return nil, err
	}
	nodes, err := s.nodeStore.List(ctx, w, "id desc")
	if err != nil {
		return nil, err
	}

	addrOfNode := utils.SliceToMapArray(nodeAddrs, func(i *cluster.NodeAddr) string {
		return i.Node
	})

	return utils.SliceToSlice(nodes, func(i *cluster.Node) *Node {
		addrs := utils.SliceToMapArrayO(addrOfNode[i.UUID], func(i *cluster.NodeAddr) (string, string) {
			return i.Type, i.Addr
		})

		return &Node{
			Uuid:       i.UUID,
			Name:       i.Name,
			Cluster:    i.Cluster,
			Peer:       addrs["peer"],
			Admin:      addrs["admin"],
			Server:     addrs["server"],
			CreateTime: i.UpdateTime,
		}
	}), nil

}

func (s *imlClusterService) CountByPartition(ctx context.Context) (map[string]int, error) {
	return s.store.Count(ctx)
}
func (s *imlClusterService) Search(ctx context.Context, keyword string, clusterId ...string) ([]*Cluster, error) {
	wheres := make([]string, 0, 2)
	value := make([]interface{}, 0, 3)
	if keyword != "" {
		wheres = append(wheres, "(`name` like ? or `resume` like ? or `uuid` like ?)")
		value = append(value, "%"+keyword+"%", "%"+keyword+"%", "%"+keyword+"%")
	}

	if len(clusterId) > 0 {
		if len(clusterId) == 1 {
			wheres = append(wheres, "`uuid` = ?")
			value = append(value, clusterId[0])
		} else {
			wheres = append(wheres, "`uuid` in (?)")
			value = append(value, clusterId)
		}

	}
	if len(wheres) == 0 {
		return s.List(ctx)
	}
	where := strings.Join(wheres, " and ")
	list, err := s.store.ListQuery(ctx, where, value, "update_at desc")
	if err != nil {
		return nil, err
	}
	return utils.SliceToSlice(list, FromEntity), nil
}
func (s *imlClusterService) List(ctx context.Context, clusterIds ...string) ([]*Cluster, error) {
	if len(clusterIds) == 0 {
		list, err := s.store.List(ctx, make(map[string]interface{}))
		if err != nil {
			return nil, err
		}
		return utils.SliceToSlice(list, FromEntity), nil
	}
	list, err := s.store.ListQuery(ctx, "`uuid` in (?)", []interface{}{clusterIds}, "update_at desc")
	if err != nil {
		return nil, err
	}
	return utils.SliceToSlice(list, FromEntity), nil

}

func init() {
	autowire.Auto[IClusterService](func() reflect.Value {
		return reflect.ValueOf(&imlClusterService{})
	})
}
