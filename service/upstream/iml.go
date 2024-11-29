package upstream

import (
	"context"
	"time"

	"github.com/APIParkLab/APIPark/service/universally/commit"
	"github.com/APIParkLab/APIPark/stores/upstream"
	"github.com/eolinker/go-common/autowire"
	"github.com/eolinker/go-common/utils"
)

var (
	_ IUpstreamService  = (*imlUpstreamService)(nil)
	_ autowire.Complete = (*imlUpstreamService)(nil)
)

type imlUpstreamService struct {
	store         upstream.IUpstreamStore       `autowired:""`
	commitService commit.ICommitService[Config] `autowired:""`
}

func (i *imlUpstreamService) List(ctx context.Context, serviceIds ...string) ([]*Upstream, error) {
	w := make(map[string]interface{})
	if len(serviceIds) > 0 {
		w["service"] = serviceIds
	}

	upstreams, err := i.store.List(ctx, w)
	if err != nil {
		return nil, err
	}
	return utils.SliceToSlice(upstreams, func(u *upstream.Upstream) *Upstream {
		return &Upstream{
			Item: &Item{
				UUID:       u.UUID,
				Service:    u.Service,
				Team:       u.Team,
				Remark:     u.Remark,
				Creator:    u.Creator,
				Updater:    u.Updater,
				CreateTime: u.CreateAt,
				UpdateTime: u.UpdateAt,
			},
		}
	}), nil
}

func (i *imlUpstreamService) ListCommit(ctx context.Context, uuid ...string) ([]*commit.Commit[Config], error) {
	return i.commitService.List(ctx, uuid...)
}

func (i *imlUpstreamService) ListLatestCommit(ctx context.Context, clusterId string, serviceIds ...string) ([]*commit.Commit[Config], error) {
	w := make(map[string]interface{})
	if len(serviceIds) > 0 {
		w["service"] = serviceIds
	}

	upstreams, err := i.store.List(ctx, w)
	if err != nil {
		return nil, err
	}
	if len(upstreams) == 0 {
		return nil, nil
		//return nil, errors.New("upstream not found")
	}
	targetId := utils.SliceToSlice(upstreams, func(u *upstream.Upstream) string {
		return u.UUID
	})
	return i.commitService.ListLatest(ctx, clusterId, targetId...)

}

func (i *imlUpstreamService) GetCommit(ctx context.Context, uuid string) (*commit.Commit[Config], error) {
	return i.commitService.Get(ctx, uuid)
}

func (i *imlUpstreamService) LatestCommit(ctx context.Context, uid string, clusterId string) (*commit.Commit[Config], error) {

	return i.commitService.Latest(ctx, uid, clusterId)
}

func (i *imlUpstreamService) SaveCommit(ctx context.Context, uid string, partition string, cfg *Config) error {
	return i.commitService.Save(ctx, uid, partition, cfg)
}

func (i *imlUpstreamService) OnComplete() {

}

func (i *imlUpstreamService) Get(ctx context.Context, id string) (*Upstream, error) {
	t, err := i.store.First(ctx, map[string]interface{}{"uuid": id})
	if err != nil {
		return nil, err
	}

	return &Upstream{
		Item: &Item{
			UUID:       t.UUID,
			Service:    t.Service,
			Team:       t.Team,
			Remark:     t.Remark,
			Creator:    t.Creator,
			Updater:    t.Updater,
			CreateTime: t.CreateAt,
			UpdateTime: t.UpdateAt,
		},
	}, nil
}

func (i *imlUpstreamService) Save(ctx context.Context, u *SaveUpstream) error {
	now := time.Now()
	userId := utils.UserId(ctx)
	return i.store.Save(ctx, &upstream.Upstream{
		UUID:     u.UUID,
		Name:     u.Name,
		Service:  u.Service,
		Team:     u.Team,
		Remark:   u.Remark,
		Creator:  userId,
		Updater:  userId,
		CreateAt: now,
		UpdateAt: now,
	})
}

func (i *imlUpstreamService) Delete(ctx context.Context, id string) error {
	_, err := i.store.DeleteWhere(ctx, map[string]interface{}{"uuid": id})
	return err
}
