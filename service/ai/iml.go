package ai

import (
	"context"
	"encoding/base64"
	"errors"
	"time"

	"github.com/APIParkLab/APIPark/service/universally"
	"github.com/APIParkLab/APIPark/stores/ai"
	"github.com/eolinker/go-common/auto"
	"github.com/eolinker/go-common/utils"
	"gorm.io/gorm"
)

var _ IProviderService = (*imlProviderService)(nil)

type imlProviderService struct {
	universally.IServiceGet[Provider]
	store ai.IProviderStore `autowired:""`
}

func (i *imlProviderService) MaxPriority(ctx context.Context) (int, error) {
	t, err := i.store.First(ctx, nil, "priority desc")
	if err != nil {
		return 0, err
	}
	return t.Priority, nil
}

func (i *imlProviderService) Save(ctx context.Context, id string, cfg *SetProvider) error {
	userId := utils.UserId(ctx)
	now := time.Now()
	info, err := i.store.First(ctx, map[string]interface{}{"uuid": id})
	if err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return err
		}
		if cfg.Name == nil || cfg.Config == nil || cfg.DefaultLLM == nil {
			return errors.New("invalid params")
		}
		status := 1
		if cfg.Status != nil {
			status = *cfg.Status
		}
		priority := 1
		if cfg.Priority == nil {
			count, err := i.store.Count(ctx, "", nil)
			if err != nil {
				return err
			}
			priority = int(count) + 1
		} else {
			priority = *cfg.Priority
		}
		info = &ai.Provider{
			UUID:       id,
			Name:       *cfg.Name,
			DefaultLLM: *cfg.DefaultLLM,
			Config:     base64.RawStdEncoding.EncodeToString([]byte(*cfg.Config)),
			Status:     status,
			Creator:    userId,
			Updater:    userId,
			Priority:   priority,
			CreateAt:   now,
			UpdateAt:   now,
		}
	} else {
		if cfg.Name != nil {
			info.Name = *cfg.Name
		}
		if cfg.Config != nil {
			info.Config = base64.RawStdEncoding.EncodeToString([]byte(*cfg.Config))
		}
		if cfg.DefaultLLM != nil {
			info.DefaultLLM = *cfg.DefaultLLM
		}
		if cfg.Status != nil {
			info.Status = *cfg.Status
		}
		if cfg.Priority != nil {
			info.Priority = *cfg.Priority
		}
		info.Updater = userId
		info.UpdateAt = now
	}
	return i.store.Save(ctx, info)
}

func (i *imlProviderService) GetLabels(ctx context.Context, ids ...string) map[string]string {
	if len(ids) == 0 {
		return nil
	}
	list, err := i.store.ListQuery(ctx, "`uuid` in (?)", []interface{}{ids}, "id")
	if err != nil {
		return nil
	}
	return utils.SliceToMapO(list, func(i *ai.Provider) (string, string) {
		return i.UUID, i.Name
	})
}

func (i *imlProviderService) OnComplete() {
	i.IServiceGet = universally.NewGet[Provider, ai.Provider](i.store, FromEntity)
	auto.RegisterService("ai_provider", i)
}
