package ai

import (
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
