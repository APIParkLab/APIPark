package dynamic_module

import (
	"context"
	"errors"
	"time"
	
	"github.com/eolinker/go-common/utils"
	
	"gorm.io/gorm"
	
	dynamic_module "github.com/APIParkLab/APIPark/stores/dynamic-module"
	
	"github.com/APIParkLab/APIPark/service/universally"
)

var _ IDynamicModuleService = (*imlDynamicModuleService)(nil)

type imlDynamicModuleService struct {
	store dynamic_module.IDynamicModuleStore `autowired:""`
	universally.IServiceGet[DynamicModule]
	universally.IServiceDelete
	universally.IServiceCreate[CreateDynamicModule]
	universally.IServiceEdit[EditDynamicModule]
}

func (i *imlDynamicModuleService) ListByPartition(ctx context.Context, partitionId string) ([]*DynamicModule, error) {
	list, err := i.store.List(ctx, map[string]interface{}{"partition": partitionId})
	if err != nil {
		return nil, err
	}
	return utils.SliceToSlice(list, FromEntity), nil
	
}

func (i *imlDynamicModuleService) OnComplete() {
	i.IServiceGet = universally.NewGet[DynamicModule, dynamic_module.DynamicModule](i.store, FromEntity)
	
	i.IServiceDelete = universally.NewDelete[dynamic_module.DynamicModule](i.store)
	
	i.IServiceCreate = universally.NewCreator[CreateDynamicModule, dynamic_module.DynamicModule](i.store, "dynamic_module", createEntityHandler, uniquestHandler, labelHandler)
	
	i.IServiceEdit = universally.NewEdit[EditDynamicModule, dynamic_module.DynamicModule](i.store, updateHandler, labelHandler)
}

func labelHandler(e *dynamic_module.DynamicModule) []string {
	return []string{e.Name, e.UUID, e.Description}
}
func uniquestHandler(i *CreateDynamicModule) []map[string]interface{} {
	return []map[string]interface{}{{"uuid": i.Id}}
}
func createEntityHandler(i *CreateDynamicModule) *dynamic_module.DynamicModule {
	now := time.Now()
	return &dynamic_module.DynamicModule{
		UUID:        i.Id,
		Name:        i.Name,
		Driver:      i.Driver,
		Module:      i.Module,
		Version:     i.Version,
		Description: i.Description,
		Config:      i.Config,
		Profession:  i.Profession,
		Skill:       i.Skill,
		CreateAt:    now,
		UpdateAt:    now,
	}
}

func updateHandler(e *dynamic_module.DynamicModule, i *EditDynamicModule) {
	if i.Name != nil {
		e.Name = *i.Name
	}
	if i.Description != nil {
		e.Description = *i.Description
	}
	if i.Config != nil {
		e.Config = *i.Config
	}
	if i.Version != nil {
		e.Version = *i.Version
	}
	e.UpdateAt = time.Now()
}

var _ IDynamicModulePublishService = &imlDynamicModulePublishService{}

type imlDynamicModulePublishService struct {
	store dynamic_module.IDynamicModulePublishStore `autowired:""`
	universally.IServiceCreate[CreateDynamicModulePublish]
}

func (i *imlDynamicModulePublishService) OnComplete() {
	i.IServiceCreate = universally.NewCreator[CreateDynamicModulePublish, dynamic_module.DynamicModulePublish](i.store, "dynamic_module_publish", i.createEntityHandler, i.uniquestHandler, i.labelHandler)
}

func (i *imlDynamicModulePublishService) Latest(ctx context.Context, dmID string, clusters []string) (map[string]*DynamicModulePublish, error) {
	result := make(map[string]*DynamicModulePublish)
	for _, c := range clusters {
		info, err := i.store.First(ctx, map[string]interface{}{"dynamic_module": dmID, "cluster": c}, "create_at desc")
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				continue
			}
			return nil, err
		}
		result[c] = &DynamicModulePublish{
			ID:            info.UUID,
			DynamicModule: info.DynamicModule,
			Module:        info.Module,
			Cluster:       info.Cluster,
			Creator:       info.Creator,
			Version:       info.Version,
			CreateAt:      info.CreateAt,
		}
	}
	return result, nil
}

func (i *imlDynamicModulePublishService) labelHandler(e *dynamic_module.DynamicModulePublish) []string {
	return []string{e.UUID}
}
func (i *imlDynamicModulePublishService) uniquestHandler(m *CreateDynamicModulePublish) []map[string]interface{} {
	return []map[string]interface{}{{"uuid": m.ID}}
}
func (i *imlDynamicModulePublishService) createEntityHandler(m *CreateDynamicModulePublish) *dynamic_module.DynamicModulePublish {
	now := time.Now()
	return &dynamic_module.DynamicModulePublish{
		UUID:          m.ID,
		DynamicModule: m.DynamicModule,
		Module:        m.Module,
		Cluster:       m.Cluster,
		Version:       m.Version,
		CreateAt:      now,
	}
}
