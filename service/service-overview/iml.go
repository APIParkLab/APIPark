package service_overview

import (
	"context"
	"errors"

	"gorm.io/gorm"

	"github.com/eolinker/go-common/utils"

	"github.com/APIParkLab/APIPark/stores/service"
)

var _ IOverviewService = (*imlOverviewService)(nil)

type imlOverviewService struct {
	store service.IOverviewStore `autowired:""`
}

func genUpdateFields(info *service.Overview, update *Update) {
	if update.ApiCount != nil {
		info.ApiCount = *update.ApiCount
	}
	if update.ReleaseApiCount != nil {
		info.ReleaseApiCount = *update.ReleaseApiCount
	}
	if update.IsReleased != nil {
		info.IsReleased = *update.IsReleased
	}
	return
}

func (i imlOverviewService) Update(ctx context.Context, serviceId string, update *Update) error {
	if update == nil {
		return nil
	}

	info, err := i.store.First(ctx, map[string]interface{}{
		"service": serviceId,
	})
	if err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return err
		}
		info = &service.Overview{
			Service: serviceId,
		}
		genUpdateFields(info, update)
		return i.store.Insert(ctx, info)
	}
	genUpdateFields(info, update)
	_, err = i.store.Update(ctx, info)
	if err != nil {
		return err
	}
	return nil
}

func (i imlOverviewService) List(ctx context.Context, serviceIds ...string) ([]*Overview, error) {
	w := make(map[string]interface{})
	if len(serviceIds) > 0 {
		w = map[string]interface{}{
			"service": serviceIds,
		}
	}
	list, err := i.store.List(ctx, w)
	if err != nil {
		return nil, err
	}
	return utils.SliceToSlice(list, FromEntity), nil
}

func (i imlOverviewService) Map(ctx context.Context, serviceIds ...string) (map[string]*Overview, error) {
	list, err := i.List(ctx, serviceIds...)
	if err != nil {
		return nil, err
	}
	return utils.SliceToMap(list, func(i *Overview) string {
		return i.Service
	}), nil
}
