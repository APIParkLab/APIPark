package ai_api

import (
	"context"
	"encoding/json"
	"time"

	"github.com/eolinker/go-common/utils"

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
		Disable:          i.Disable,
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
	if i.Disable != nil {
		e.Disable = *i.Disable
	}

	e.UpdateAt = time.Now()
}

var _ IAPIUseService = (*imlAPIUseService)(nil)

type imlAPIUseService struct {
	store api.IAiAPIUseStore `autowired:""`
}

func (i *imlAPIUseService) SumByApisPage(ctx context.Context, providerId string, start, end int64, offset, limit int, order string, apiIds ...string) ([]*APIUse, int64, error) {
	list, total, err := i.store.SumByGroupPage(ctx, "api", order, offset, limit, "api,sum(input_token) as input_token,sum(output_token) as output_token,sum(total_token) as total_token", "provider = ? and api in (?) and minute >= ? and minute <= ?", providerId, apiIds, start, end)
	if err != nil {
		return nil, 0, err
	}

	result := make([]*APIUse, 0, len(list))
	for _, v := range list {
		result = append(result, &APIUse{
			API:         v.API,
			InputToken:  v.InputToken,
			OutputToken: v.OutputToken,
			TotalToken:  v.TotalToken,
		})
	}
	return result, total, nil
}

func (i *imlAPIUseService) SumByApis(ctx context.Context, providerId string, start, end int64, apiIds ...string) ([]*APIUse, error) {
	list, err := i.store.SumByGroup(ctx, "api", "api,sum(input_token) as input_token,sum(output_token) as output_token,sum(total_token) as total_token", "provider = ? and api in (?) and minute >= ? and minute <= ?", providerId, apiIds, start, end)
	if err != nil {
		return nil, err
	}

	return utils.SliceToSlice(list, func(v *api.AiAPIUse) *APIUse {
		return &APIUse{
			API:         v.API,
			InputToken:  v.InputToken,
			OutputToken: v.OutputToken,
			TotalToken:  v.TotalToken,
		}
	}), nil
}
