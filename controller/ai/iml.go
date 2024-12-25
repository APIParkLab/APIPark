package ai

import (
	"strconv"

	"github.com/APIParkLab/APIPark/module/ai"
	ai_dto "github.com/APIParkLab/APIPark/module/ai/dto"
	"github.com/eolinker/go-common/auto"
	"github.com/gin-gonic/gin"
)

var (
	_ IProviderController = (*imlProviderController)(nil)
)

type imlProviderController struct {
	module ai.IProviderModule `autowired:""`
}

func (i *imlProviderController) Sort(ctx *gin.Context, input *ai_dto.Sort) error {
	return i.module.Sort(ctx, input)
}

func (i *imlProviderController) ConfiguredProviders(ctx *gin.Context) ([]*ai_dto.ConfiguredProviderItem, *auto.Label, error) {
	return i.module.ConfiguredProviders(ctx)
}

func (i *imlProviderController) UnConfiguredProviders(ctx *gin.Context) ([]*ai_dto.ProviderItem, error) {
	return i.module.UnConfiguredProviders(ctx)
}

func (i *imlProviderController) SimpleProviders(ctx *gin.Context) ([]*ai_dto.SimpleProviderItem, error) {
	return i.module.SimpleProviders(ctx)
}

func (i *imlProviderController) Provider(ctx *gin.Context, id string) (*ai_dto.Provider, error) {
	return i.module.Provider(ctx, id)
}

func (i *imlProviderController) SimpleProvider(ctx *gin.Context, id string) (*ai_dto.SimpleProvider, error) {
	return i.module.SimpleProvider(ctx, id)
}

func (i *imlProviderController) LLMs(ctx *gin.Context, driver string) ([]*ai_dto.LLMItem, *ai_dto.ProviderItem, error) {
	return i.module.LLMs(ctx, driver)
}

func (i *imlProviderController) Enable(ctx *gin.Context, id string) error {
	return i.module.UpdateProviderStatus(ctx, id, true)
}

func (i *imlProviderController) Disable(ctx *gin.Context, id string) error {
	return i.module.UpdateProviderStatus(ctx, id, false)
}

func (i *imlProviderController) UpdateProviderConfig(ctx *gin.Context, id string, input *ai_dto.UpdateConfig) error {
	return i.module.UpdateProviderConfig(ctx, id, input)
}

func (i *imlProviderController) UpdateProviderDefaultLLM(ctx *gin.Context, id string, input *ai_dto.UpdateLLM) error {
	return i.module.UpdateProviderDefaultLLM(ctx, id, input)
}

var _ IStatisticController = (*imlStatisticController)(nil)

type imlStatisticController struct {
	module ai.IAIAPIModule `autowired:""`
}

func (i *imlStatisticController) APIs(ctx *gin.Context, keyword string, providerId string, start string, end string, page string, pageSize string, sortCondition string, asc string) ([]*ai_dto.APIItem, int64, error) {
	s, err := strconv.ParseInt(start, 10, 64)
	if err != nil {
		return nil, 0, err
	}

	e, err := strconv.ParseInt(end, 10, 64)
	if err != nil {
		return nil, 0, err
	}

	p, err := strconv.Atoi(page)
	if err != nil {
		if page != "" {
			return nil, 0, err
		}
		p = 1
	}

	ps, err := strconv.Atoi(pageSize)
	if err != nil {
		if pageSize != "" {
			return nil, 0, err
		}
		ps = 15
	}
	return i.module.APIs(ctx, keyword, providerId, s, e, p, ps, sortCondition, asc == "true")
}
