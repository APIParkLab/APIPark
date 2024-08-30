package service_doc

import (
	"context"
	"errors"
	"github.com/APIParkLab/APIPark/service/universally/commit"
	"time"

	"github.com/eolinker/go-common/utils"
	"gorm.io/gorm"

	"github.com/APIParkLab/APIPark/stores/service"
)

var _ IDocService = (*imlDocService)(nil)

type imlDocService struct {
	store         service.IServiceDocStore                `autowired:""`
	commitService commit.ICommitWithKeyService[DocCommit] `autowired:""`
}

func (i *imlDocService) LatestDocCommit(ctx context.Context, serviceId string) (*commit.Commit[DocCommit], error) {
	return i.commitService.Latest(ctx, serviceId)
}

func (i *imlDocService) CommitDoc(ctx context.Context, serviceId string, data *DocCommit) error {
	return i.commitService.Save(ctx, serviceId, data)
}

func (i *imlDocService) List(ctx context.Context, sids ...string) ([]*Doc, error) {
	w := map[string]interface{}{}
	if len(sids) > 0 {
		w["sid"] = sids
	}

	list, err := i.store.List(ctx, w)
	if err != nil {
		return nil, err
	}
	return utils.SliceToSlice(list, func(d *service.Doc) *Doc {
		return &Doc{
			ID:         d.Sid,
			Creator:    d.Creator,
			Updater:    d.Updater,
			Doc:        d.Doc,
			UpdateTime: d.UpdateAt,
			CreateTime: d.CreateAt,
		}
	}), nil
}

func (i *imlDocService) Map(ctx context.Context, sids ...string) (map[string]*Doc, error) {
	w := map[string]interface{}{}
	if len(sids) > 0 {
		w["sid"] = sids
	}

	list, err := i.store.List(ctx, w)
	if err != nil {
		return nil, err
	}
	return utils.SliceToMapO(list, func(d *service.Doc) (string, *Doc) {
		return d.Sid, &Doc{
			ID:         d.Sid,
			Creator:    d.Creator,
			Updater:    d.Updater,
			Doc:        d.Doc,
			UpdateTime: d.UpdateAt,
			CreateTime: d.CreateAt,
		}
	}), nil
}

func (i *imlDocService) Save(ctx context.Context, input *SaveDoc) error {
	info, err := i.store.First(ctx, map[string]interface{}{"sid": input.Sid})
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return err
	}
	userID := utils.UserId(ctx)
	if info != nil {
		info.Doc = input.Doc
		info.Updater = userID
		info.UpdateAt = time.Now()
		return i.store.Save(ctx, info)
	}
	return i.store.Insert(ctx, &service.Doc{
		Sid:      input.Sid,
		Doc:      input.Doc,
		CreateAt: time.Now(),
		UpdateAt: time.Now(),
		Creator:  userID,
		Updater:  userID,
	})
}

func (i *imlDocService) Get(ctx context.Context, sid string) (*Doc, error) {
	doc, err := i.store.First(ctx, map[string]interface{}{"sid": sid})
	if err != nil {
		return nil, err
	}
	return &Doc{
		ID:         doc.Sid,
		Creator:    doc.Creator,
		Updater:    doc.Updater,
		Doc:        doc.Doc,
		UpdateTime: doc.UpdateAt,
		CreateTime: doc.CreateAt,
	}, nil
}
