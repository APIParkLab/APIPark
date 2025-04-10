package service_model_mapping

import (
	"context"
	"errors"
	"time"

	"github.com/APIParkLab/APIPark/stores/service"
	"github.com/eolinker/go-common/utils"
	"gorm.io/gorm"
)

var _ IServiceModelMappingService = (*imlServiceModelMappingService)(nil)

type imlServiceModelMappingService struct {
	store service.IServiceModelMappingStore `autowired:""`
}

func (i *imlServiceModelMappingService) Delete(ctx context.Context, sid string) error {
	_, err := i.store.DeleteWhere(ctx, map[string]interface{}{"sid": sid})
	if err != nil {
		return err
	}
	return nil
}

func (i *imlServiceModelMappingService) Get(ctx context.Context, sid string) (*ModelMapping, error) {
	entity, err := i.store.First(ctx, map[string]interface{}{"sid": sid})
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return &ModelMapping{
				Sid:     sid,
				Content: "",
			}, nil
		}
		return nil, err
	}
	return FromEntity(entity), nil
}

func FromEntity(e *service.ModelMapping) *ModelMapping {
	content := ""
	if e.Content != "" {
		content = e.Content
	}
	return &ModelMapping{
		ID:       e.Id,
		Sid:      e.Sid,
		Content:  content,
		CreateAt: e.CreateAt,
		UpdateAt: e.UpdateAt,
	}
}

func (i *imlServiceModelMappingService) Save(ctx context.Context, input *Save) error {
	info, err := i.store.First(ctx, map[string]interface{}{"sid": input.Sid})
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return err
	}
	userID := utils.UserId(ctx)
	if info != nil {
		info.Content = input.Content
		info.Updater = userID
		info.UpdateAt = time.Now()
		return i.store.Save(ctx, info)
	}
	return i.store.Insert(ctx, &service.ModelMapping{
		Sid:      input.Sid,
		Content:  input.Content,
		CreateAt: time.Now(),
		UpdateAt: time.Now(),
		Creator:  userID,
		Updater:  userID,
	})
}
