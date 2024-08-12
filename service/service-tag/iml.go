package service_tag

import (
	"context"
	
	"github.com/APIParkLab/APIPark/stores/service"
	"github.com/eolinker/go-common/utils"
)

type imlTagService struct {
	store service.IServiceTagStore `autowired:""`
}

func (i *imlTagService) List(ctx context.Context, sids []string, tids []string) ([]*Tag, error) {
	condition := make(map[string]interface{})
	if len(sids) > 0 {
		condition["sid"] = sids
	}
	if len(tids) > 0 {
		condition["tid"] = tids
	}
	result, err := i.store.List(ctx, condition)
	if err != nil {
		return nil, err
	}
	return utils.SliceToSlice(result, func(s *service.Tag) *Tag {
		return &Tag{
			Tid: s.Tid,
			Sid: s.Sid,
		}
	}), nil
}

func (i *imlTagService) Delete(ctx context.Context, tids []string, sids []string) error {
	if len(tids) == 0 && len(sids) == 0 {
		return nil
	}
	conditions := make(map[string]interface{})
	if len(tids) > 0 {
		conditions["tid"] = tids
	}
	if len(sids) > 0 {
		conditions["sid"] = sids
	}
	_, err := i.store.DeleteWhere(ctx, conditions)
	return err
}

func (i *imlTagService) Create(ctx context.Context, input *CreateTag) error {
	return i.store.Insert(ctx, &service.Tag{
		Sid: input.Sid,
		Tid: input.Tid,
	})
}
