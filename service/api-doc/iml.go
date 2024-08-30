package api_doc

import (
	"context"
	"errors"
	"github.com/APIParkLab/APIPark/service/universally/commit"
	"github.com/APIParkLab/APIPark/stores/api"
	"github.com/eolinker/go-common/utils"
	"gorm.io/gorm"
	"time"
)

var (
	_ IAPIDocService = (*imlAPIDocService)(nil)
)

type imlAPIDocService struct {
	store         api.IAPIDocStore                        `autowired:""`
	commitService commit.ICommitWithKeyService[DocCommit] `autowired:""`
}

func (i *imlAPIDocService) UpdateDoc(ctx context.Context, serviceId string, input *UpdateDoc) error {
	doc, err := NewDocLoader(input.Content)
	if err != nil {
		return err
	}
	if err := doc.Valid(); err != nil {
		return err
	}

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

func (i *imlAPIDocService) CommitDoc(ctx context.Context, serviceId string, data *DocCommit) error {
	return i.commitService.Save(ctx, serviceId, data)
}
