package ai

import (
	"context"
	"time"

	"github.com/APIParkLab/APIPark/service/universally"
	"github.com/APIParkLab/APIPark/stores/ai"
	"github.com/eolinker/go-common/auto"
	"github.com/eolinker/go-common/utils"
)

var _ IProviderService = (*imlProviderService)(nil)

type imlProviderService struct {
	universally.IServiceGet[Provider]
	universally.IServiceCreate[CreateProvider]
	universally.IServiceEdit[SetProvider]
	universally.IServiceDelete
	store ai.IProviderStore `autowired:""`
}

//func (i *imlProviderService) Save(ctx context.Context, id string, cfg *SetProvider) error {
//	userId := utils.UserId(ctx)
//	now := time.Now()
//	info, err := i.store.First(ctx, map[string]interface{}{"uuid": id})
//	if err != nil {
//		if !errors.Is(err, gorm.ErrRecordNotFound) {
//			return err
//		}
//		if cfg.Name == nil || cfg.Config == nil || cfg.DefaultLLM == nil {
//			return errors.New("invalid params")
//		}
//		status := 1
//		if cfg.Status != nil {
//			status = *cfg.Status
//		}
//
//		info = &ai.Provider{
//			UUID:       id,
//			Name:       *cfg.Name,
//			DefaultLLM: *cfg.DefaultLLM,
//			Config:     base64.RawStdEncoding.EncodeToString([]byte(*cfg.Config)),
//			Status:     status,
//			Creator:    userId,
//			Updater:    userId,
//			//Priority:   priority,
//			CreateAt: now,
//			UpdateAt: now,
//		}
//	} else {
//		if cfg.Name != nil {
//			info.Name = *cfg.Name
//		}
//		if cfg.Config != nil {
//			info.Config = base64.RawStdEncoding.EncodeToString([]byte(*cfg.Config))
//		}
//		if cfg.DefaultLLM != nil {
//			info.DefaultLLM = *cfg.DefaultLLM
//		}
//		if cfg.Status != nil {
//			info.Status = *cfg.Status
//		}
//		//if cfg.Priority != nil {
//		//	info.Priority = *cfg.Priority
//		//}
//		info.Updater = userId
//		info.UpdateAt = now
//	}
//	return i.store.Save(ctx, info)
//}

func (i *imlProviderService) CheckNameDuplicate(ctx context.Context, name string) bool {
	v, _ := i.store.First(ctx, map[string]interface{}{"name": name})
	if v != nil {
		return true
	}
	return false
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
	i.IServiceCreate = universally.NewCreator[CreateProvider, ai.Provider](i.store, "ai_provider", createEntityHandler, uniquestHandler, labelHandler)
	i.IServiceEdit = universally.NewEdit[SetProvider, ai.Provider](i.store, updateHandler, labelHandler)
	i.IServiceDelete = universally.NewDelete[ai.Provider](i.store)
	auto.RegisterService("ai_provider", i)
}

func labelHandler(e *ai.Provider) []string {
	return []string{e.Name, e.UUID}
}

func uniquestHandler(i *CreateProvider) []map[string]interface{} {
	return []map[string]interface{}{{"uuid": i.Id}}
}

func createEntityHandler(i *CreateProvider) *ai.Provider {
	//cfg, _ := json.Marshal(i.Config)
	now := time.Now()
	return &ai.Provider{
		UUID:       i.Id,
		Name:       i.Name,
		DefaultLLM: i.DefaultLLM,
		Config:     i.Config,
		Status:     i.Status,
		CreateAt:   now,
		UpdateAt:   now,
	}
}

func updateHandler(e *ai.Provider, i *SetProvider) {
	if i.Name != nil {
		e.Name = *i.Name
	}
	if i.DefaultLLM != nil {
		e.DefaultLLM = *i.DefaultLLM
	}
	if i.Config != nil {
		e.Config = *i.Config
	}
	if i.Status != nil {
		e.Status = *i.Status
	}
	if i.Priority != nil {
		e.Priority = *i.Priority
	}
	e.UpdateAt = time.Now()
}
