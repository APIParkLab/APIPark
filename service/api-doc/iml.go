package api_doc

import (
	"context"
	"errors"
	"time"

	"github.com/APIParkLab/APIPark/service/universally/commit"
	"github.com/APIParkLab/APIPark/stores/api"
	"github.com/eolinker/go-common/utils"
	"gorm.io/gorm"
)

var (
	_ IAPIDocService = (*imlAPIDocService)(nil)
)

type imlAPIDocService struct {
	store         api.IAPIDocStore                        `autowired:""`
	commitService commit.ICommitWithKeyService[DocCommit] `autowired:""`
}

func (i *imlAPIDocService) LatestAPICountByCommits(ctx context.Context, commitIds ...string) (map[string]int64, error) {
	commits, err := i.commitService.List(ctx, commitIds...)
	if err != nil {
		return nil, err
	}
	countMap := make(map[string]int64)
	for _, c := range commits {
		countMap[c.Target] = c.Data.APICount
	}
	return countMap, nil
}

func (i *imlAPIDocService) GetDocCommit(ctx context.Context, commitId string) (*commit.Commit[DocCommit], error) {
	return i.commitService.Get(ctx, commitId)
}

func (i *imlAPIDocService) ListDocCommit(ctx context.Context, commitIds ...string) ([]*commit.Commit[DocCommit], error) {
	return i.commitService.List(ctx, commitIds...)
}

func (i *imlAPIDocService) ListLatestDocCommit(ctx context.Context, serviceIds ...string) ([]*commit.Commit[DocCommit], error) {
	return i.commitService.ListLatest(ctx, serviceIds...)
}

func (i *imlAPIDocService) LatestAPICountByServices(ctx context.Context, serviceIds ...string) (map[string]int64, error) {
	list, err := i.commitService.ListLatest(ctx, serviceIds...)
	if err != nil {
		return nil, err
	}
	return utils.SliceToMapO(list, func(i *commit.Commit[DocCommit]) (string, int64) {
		return i.Target, i.Data.APICount
	}), nil
}

func (i *imlAPIDocService) APICountByServices(ctx context.Context, serviceIds ...string) (map[string]int64, error) {
	w := make(map[string]interface{})
	if len(serviceIds) > 0 {
		w["service"] = serviceIds
	}
	list, err := i.store.List(ctx, w)
	if err != nil {
		return nil, err
	}
	return utils.SliceToMapO(list, func(i *api.Doc) (string, int64) {
		return i.Service, i.APICount
	}), nil
}

func (i *imlAPIDocService) UpdateDoc(ctx context.Context, serviceId string, input *UpdateDoc) error {
	doc, err := NewDocLoader(input.Content)
	if err != nil {
		return err
	}
	if err := doc.Valid(); err != nil {
		return err
	}
	if input.Prefix != "" {
		err = doc.AddPrefixInAll(input.Prefix)
		if err != nil {
			return err
		}
	}
	data, err := doc.Marshal()
	if err != nil {
		return err
	}
	input.Content = string(data)

	info, err := i.store.First(ctx, map[string]interface{}{
		"service": serviceId,
	})
	operator := utils.UserId(ctx)
	if err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return err
		}
		return i.store.Insert(ctx, &api.Doc{
			UUID:     input.ID,
			Service:  serviceId,
			Content:  input.Content,
			Updater:  operator,
			UpdateAt: time.Now(),
			APICount: doc.APICount(),
		})
	}
	info.Content = input.Content
	info.Updater = operator
	info.UpdateAt = time.Now()
	info.APICount = doc.APICount()
	return i.store.Save(ctx, info)
}

func (i *imlAPIDocService) GetDoc(ctx context.Context, serviceId string) (*Doc, error) {
	info, err := i.store.First(ctx, map[string]interface{}{
		"service": serviceId,
	})
	if err != nil {
		return nil, err
	}
	return &Doc{
		Id:       info.UUID,
		Service:  info.Service,
		Content:  info.Content,
		Updater:  info.Updater,
		UpdateAt: info.UpdateAt,
	}, nil
}

func (i *imlAPIDocService) LatestDocCommit(ctx context.Context, serviceId string) (*commit.Commit[DocCommit], error) {
	return i.commitService.Latest(ctx, serviceId)
}

func (i *imlAPIDocService) CommitDoc(ctx context.Context, serviceId string, data *Doc) error {
	doc, err := NewDocLoader(data.Content)
	if err != nil {
		return err
	}
	if err := doc.Valid(); err != nil {
		return err
	}

	return i.commitService.Save(ctx, serviceId, &DocCommit{
		Content:  data.Content,
		APICount: doc.APICount(),
	})
}
