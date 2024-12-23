package ai_api

import (
	"context"
	"encoding/json"
	"time"

	"github.com/APIParkLab/APIPark/service/universally"
	"github.com/APIParkLab/APIPark/stores/api"
)

var _ IAPIService = (*imlAPIService)(nil)

type imlAPIService struct {
	store api.IAiAPIInfoStore `autowired:""`

	universally.IServiceGet[API]
	universally.IServiceCreate[Create]
	universally.IServiceEdit[Edit]
	universally.IServiceDelete
}

func (i *imlAPIService) CountMapByProvider(ctx context.Context, keyword string, conditions map[string]interface{}) (map[string]int64, error) {
	return i.store.CountByGroup(ctx, keyword, conditions, "provider")
}

func (i *imlAPIService) OnComplete() {
	i.IServiceGet = universally.NewGetSoftDelete[API, api.AiAPIInfo](i.store, FromEntity)
	i.IServiceCreate = universally.NewCreatorSoftDelete[Create, api.AiAPIInfo](i.store, "ai_api_info", createEntityHandler, uniquestHandler, labelHandler)
	i.IServiceEdit = universally.NewEdit[Edit, api.AiAPIInfo](i.store, updateHandler)
	i.IServiceDelete = universally.NewSoftDelete[api.AiAPIInfo](i.store)
}

func labelHandler(e *api.AiAPIInfo) []string {
	return []string{e.Name, e.Uuid}
}
func uniquestHandler(i *Create) []map[string]interface{} {
	return []map[string]interface{}{{"uuid": i.ID}}
}
func createEntityHandler(i *Create) *api.AiAPIInfo {
	now := time.Now()
	cfg, _ := json.Marshal(i.AdditionalConfig)
	return &api.AiAPIInfo{
		Uuid:             i.ID,
		Name:             i.Name,
		Service:          i.Service,
		Path:             i.Path,
		Description:      i.Description,
		Timeout:          i.Timeout,
		Retry:            i.Retry,
		Model:            i.Model,
		Provider:         i.Provider,
		CreateAt:         now,
		UpdateAt:         now,
		AdditionalConfig: string(cfg),
	}
}
func updateHandler(e *api.AiAPIInfo, i *Edit) {
	if i.Name != nil {
		e.Name = *i.Name
	}
	if i.Path != nil {
		e.Path = *i.Path
	}
	if i.Description != nil {
		e.Description = *i.Description
	}
	if i.Timeout != nil {
		e.Timeout = *i.Timeout
	}
	if i.Retry != nil {
		e.Retry = *i.Retry
	}
	if i.Model != nil {
		e.Model = *i.Model
	}
	if i.Provider != nil {
		e.Provider = *i.Provider
	}
	if i.AdditionalConfig != nil {
		cfg, _ := json.Marshal(i.AdditionalConfig)
		e.AdditionalConfig = string(cfg)
	}
	e.UpdateAt = time.Now()
}
