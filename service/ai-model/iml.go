package ai_model

import (
	"context"
	"errors"
	"github.com/APIParkLab/APIPark/service/universally"
	"github.com/APIParkLab/APIPark/stores/ai"
	"github.com/eolinker/go-common/utils"
	"gorm.io/gorm"
	"time"
)

var _ IProviderModelService = (*imlProviderModelService)(nil)

type imlProviderModelService struct {
	universally.IServiceGet[ProviderModel]
	universally.IServiceCreate[ProviderModel]
	universally.IServiceDelete
	store ai.IProviderModelStore `autowired:""`
}

func (i *imlProviderModelService) CountMapByProvider(ctx context.Context, conditions map[string]interface{}) (map[string]int64, error) {
	return i.store.CountByGroup(ctx, "", conditions, "provider")
}

func (i *imlProviderModelService) Save(ctx context.Context, id string, model *Model) error {
	userId := utils.UserId(ctx)
	now := time.Now()
	info, err := i.store.First(ctx, map[string]interface{}{"uuid": id})
	if err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return err
		}
		if model.Name == nil || model.Provider == nil {
			return errors.New("invalid params")
		}
		info = &ai.ProviderModel{
			UUID:                id,
			Name:                *model.Name,
			Type:                *model.Type,
			AccessConfiguration: *model.AccessConfiguration,
			ModelParameters:     *model.ModelParameters,
			Provider:            *model.Provider,
			Creator:             userId,
			Updater:             userId,
			CreateAt:            now,
			UpdateAt:            now,
		}
	} else {
		if model.Name != nil {
			info.Name = *model.Name
		}
		if model.Type != nil {
			info.Type = *model.Type
		}
		if model.Provider != nil {
			info.Provider = *model.Provider
		}
		if model.AccessConfiguration != nil {
			info.AccessConfiguration = *model.AccessConfiguration
		}
		if model.ModelParameters != nil {
			info.AccessConfiguration = *model.ModelParameters
		}
		info.Updater = userId
		info.UpdateAt = now
	}
	return i.store.Save(ctx, info)
}

func (i *imlProviderModelService) CheckNameDuplicate(ctx context.Context, provider string, name string, excludeId string) bool {
	v, _ := i.store.First(ctx, map[string]interface{}{"provider": provider, "name": name})
	if v == nil {
		return false
	} else {
		if excludeId == "" {
			return true
		} else {
			return v.UUID != excludeId
		}
	}
}

func (i *imlProviderModelService) OnComplete() {
	i.IServiceGet = universally.NewGet[ProviderModel, ai.ProviderModel](i.store, FromEntity)
	i.IServiceDelete = universally.NewDelete[ai.ProviderModel](i.store)
}
