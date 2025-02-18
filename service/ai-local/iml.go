package ai_local

import (
	"context"
	"time"

	"github.com/eolinker/go-common/utils"

	"github.com/APIParkLab/APIPark/service/universally"
	"github.com/APIParkLab/APIPark/stores/ai"
)

var _ ILocalModelService = &imlLocalModelService{}

type imlLocalModelService struct {
	store ai.ILocalModelStore `autowired:""`
	universally.IServiceGet[LocalModel]
	universally.IServiceCreate[CreateLocalModel]
	universally.IServiceEdit[EditLocalModel]
	universally.IServiceDelete
}

func (i *imlLocalModelService) OnComplete() {
	i.IServiceGet = universally.NewGet[LocalModel, ai.LocalModel](i.store, i.fromEntity)
	i.IServiceCreate = universally.NewCreator[CreateLocalModel, ai.LocalModel](i.store, "ai_local_model", i.createEntityHandler, i.uniquestHandler, i.labelHandler)
	i.IServiceEdit = universally.NewEdit[EditLocalModel, ai.LocalModel](i.store, i.updateHandler, i.labelHandler)
	i.IServiceDelete = universally.NewDelete[ai.LocalModel](i.store)
}

func (i *imlLocalModelService) labelHandler(e *ai.LocalModel) []string {
	return []string{e.Name}
}
func (i *imlLocalModelService) uniquestHandler(c *CreateLocalModel) []map[string]interface{} {
	return []map[string]interface{}{{"uuid": c.Id}}
}
func (i *imlLocalModelService) createEntityHandler(c *CreateLocalModel) *ai.LocalModel {
	now := time.Now()
	return &ai.LocalModel{
		Uuid:     c.Id,
		Name:     c.Name,
		Provider: c.Provider,
		State:    c.State,
		CreateAt: now,
		UpdateAt: now,
	}
}

func (i *imlLocalModelService) updateHandler(e *ai.LocalModel, c *EditLocalModel) {
	if c.State != nil {
		e.State = *c.State
	}
	e.UpdateAt = time.Now()

}

func (i *imlLocalModelService) fromEntity(e *ai.LocalModel) *LocalModel {
	return &LocalModel{
		Id:       e.Uuid,
		Name:     e.Name,
		Provider: e.Provider,
		State:    e.State,
		CreateAt: e.CreateAt,
		UpdateAt: e.UpdateAt,
		Creator:  e.Creator,
		Updater:  e.Updater,
	}
}

var (
	_ ILocalModelPackageService = &imlLocalModelPackageService{}
)

type imlLocalModelPackageService struct {
	store ai.ILocalModelPackageStore `autowired:""`
	universally.IServiceGet[LocalModelPackage]
	universally.IServiceCreate[CreateLocalModelPackage]
	universally.IServiceEdit[EditLocalModelPackage]
	universally.IServiceDelete
}

func (i *imlLocalModelPackageService) OnComplete() {
	i.IServiceGet = universally.NewGet[LocalModelPackage, ai.LocalModelPackage](i.store, i.fromEntity)
	i.IServiceCreate = universally.NewCreator[CreateLocalModelPackage, ai.LocalModelPackage](i.store, "ai_local_model_package", i.createEntityHandler, i.uniquestHandler, i.labelHandler)
	i.IServiceEdit = universally.NewEdit[EditLocalModelPackage, ai.LocalModelPackage](i.store, i.updateHandler, i.labelHandler)
	i.IServiceDelete = universally.NewDelete[ai.LocalModelPackage](i.store)
}

func (i *imlLocalModelPackageService) labelHandler(e *ai.LocalModelPackage) []string {
	return []string{e.Uuid}
}

func (i *imlLocalModelPackageService) uniquestHandler(c *CreateLocalModelPackage) []map[string]interface{} {
	return []map[string]interface{}{{"uuid": c.Id}}
}

func (i *imlLocalModelPackageService) createEntityHandler(c *CreateLocalModelPackage) *ai.LocalModelPackage {
	return &ai.LocalModelPackage{
		Uuid:        c.Id,
		Name:        c.Name,
		Size:        c.Size,
		Hash:        c.Hash,
		Description: c.Description,
		IsPopular:   c.Popular,
	}
}

func (i *imlLocalModelPackageService) updateHandler(e *ai.LocalModelPackage, c *EditLocalModelPackage) {
	if c.Size != nil {
		e.Size = *c.Size
	}
	if c.Hash != nil {
		e.Hash = *c.Hash
	}
	if c.Description != nil {
		e.Description = *c.Description
	}
	if c.Popular != nil {
		e.IsPopular = *c.Popular
	}
	if c.Version != nil {
		e.Version = *c.Version
	}
}

func (i *imlLocalModelPackageService) fromEntity(e *ai.LocalModelPackage) *LocalModelPackage {
	return &LocalModelPackage{
		Id:          e.Uuid,
		Name:        e.Name,
		Size:        e.Size,
		Hash:        e.Hash,
		Description: e.Description,
		Version:     e.Version,
		IsPopular:   e.IsPopular,
	}
}

type imlLocalModelInstallStateService struct {
	store ai.ILocalModelInstallStateStore `autowired:""`
	universally.IServiceGet[LocalModelInstallState]
	universally.IServiceCreate[CreateLocalModelInstallState]
	universally.IServiceEdit[EditLocalModelInstallState]
	universally.IServiceDelete
}

func (i *imlLocalModelInstallStateService) OnComplete() {
	i.IServiceGet = universally.NewGet[LocalModelInstallState, ai.LocalModelInstallState](i.store, i.fromEntity)
	i.IServiceCreate = universally.NewCreator[CreateLocalModelInstallState, ai.LocalModelInstallState](i.store, "ai_local_model_install_state", i.createEntityHandler, i.uniquestHandler, i.labelHandler)
	i.IServiceEdit = universally.NewEdit[EditLocalModelInstallState, ai.LocalModelInstallState](i.store, i.updateHandler, i.labelHandler)
	i.IServiceDelete = universally.NewDelete[ai.LocalModelInstallState](i.store)
}

func (i *imlLocalModelInstallStateService) fromEntity(e *ai.LocalModelInstallState) *LocalModelInstallState {
	return &LocalModelInstallState{
		Id:       e.Uuid,
		Complete: e.Complete,
		Total:    e.Total,
		State:    e.State,
		Msg:      e.LastMsg,
		UpdateAt: e.UpdateAt,
	}
}

func (i *imlLocalModelInstallStateService) labelHandler(e *ai.LocalModelInstallState) []string {
	return []string{e.Uuid}
}

func (i *imlLocalModelInstallStateService) uniquestHandler(c *CreateLocalModelInstallState) []map[string]interface{} {
	return []map[string]interface{}{{"uuid": c.Id}}
}

func (i *imlLocalModelInstallStateService) createEntityHandler(c *CreateLocalModelInstallState) *ai.LocalModelInstallState {
	return &ai.LocalModelInstallState{
		Uuid:     c.Id,
		Complete: c.Complete,
		Total:    c.Total,
		State:    c.State,
		LastMsg:  c.Msg,
		UpdateAt: time.Now(),
	}
}

func (i *imlLocalModelInstallStateService) updateHandler(e *ai.LocalModelInstallState, c *EditLocalModelInstallState) {
	if c.Complete != nil {
		e.Complete = *c.Complete
	}
	if c.Total != nil {
		e.Total = *c.Total
	}
	if c.State != nil {
		e.State = *c.State
	}
	if c.Msg != nil {
		e.LastMsg = *c.Msg
	}
	e.UpdateAt = time.Now()
}

var _ ILocalModelCacheService = &imlLocalModelCacheService{}

type imlLocalModelCacheService struct {
	store ai.ILocalModelCacheStore `autowired:""`
}

func (i *imlLocalModelCacheService) GetByTarget(ctx context.Context, typ CacheType, target string) (*LocalModelCache, error) {
	item, err := i.store.First(ctx, map[string]interface{}{"target": target, "type": typ.Int()})
	if err != nil {
		return nil, err
	}
	return &LocalModelCache{
		Model:  item.Model,
		Target: item.Target,
		Type:   CacheType(item.Type),
	}, nil
}

func (i *imlLocalModelCacheService) List(ctx context.Context, model string, typ CacheType) ([]*LocalModelCache, error) {
	list, err := i.store.List(ctx, map[string]interface{}{"model": model, "type": typ.Int()})
	if err != nil {
		return nil, err
	}
	return utils.SliceToSlice(list, func(s *ai.LocalModelCache) *LocalModelCache {
		return &LocalModelCache{
			Model:  s.Model,
			Target: s.Target,
			Type:   CacheType(s.Type),
		}
	}), nil
}

func (i *imlLocalModelCacheService) Delete(ctx context.Context, model string) error {
	_, err := i.store.DeleteWhere(ctx, map[string]interface{}{"model": model})
	if err != nil {
		return err
	}
	return nil
}

func (i *imlLocalModelCacheService) Save(ctx context.Context, model string, typ CacheType, target string) error {
	return i.store.Insert(ctx, &ai.LocalModelCache{
		Model:  model,
		Target: target,
		Type:   typ.Int(),
	})
}
