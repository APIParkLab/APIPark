package ai_model

import (
	"encoding/json"
	"fmt"
	ai_model "github.com/APIParkLab/APIPark/module/ai-model"
	model_dto "github.com/APIParkLab/APIPark/module/ai-model/dto"
	"github.com/gin-gonic/gin"
	"strings"
)

var (
	_ IProviderModelController = (*imlProviderModelController)(nil)
)

type imlProviderModelController struct {
	module ai_model.IProviderModelModule `autowired:""`
}

func (i *imlProviderModelController) UpdateProviderModel(ctx *gin.Context, provider string, input *model_dto.EditModel) error {
	if strings.TrimSpace(input.Name) == "" {
		return fmt.Errorf("name is empty")
	}
	if strings.TrimSpace(input.Id) == "" {
		return fmt.Errorf("id is empty")
	}
	if strings.TrimSpace(provider) == "" {
		return fmt.Errorf("provider is empty")
	}
	// check access config & model parameter is json format
	if strings.TrimSpace(input.AccessConfiguration) != "" && !json.Valid([]byte(input.AccessConfiguration)) {
		return fmt.Errorf("access configuration is not json format")
	}
	if strings.TrimSpace(input.ModelParameters) != "" && !json.Valid([]byte(input.ModelParameters)) {
		return fmt.Errorf("model parameters is not json format")
	}

	return i.module.UpdateProviderModel(ctx, provider, input)
}

func (i *imlProviderModelController) DeleteProviderModel(ctx *gin.Context, provider string, id string) error {
	if strings.TrimSpace(id) == "" {
		return fmt.Errorf("id is empty")
	}
	if strings.TrimSpace(provider) == "" {
		return fmt.Errorf("provider is empty")
	}

	return i.module.DeleteProviderModel(ctx, provider, id)
}

func (i *imlProviderModelController) AddProviderModel(ctx *gin.Context, provider string, input *model_dto.Model) (*model_dto.SimpleModel, error) {
	if strings.TrimSpace(input.Name) == "" {
		return nil, fmt.Errorf("name is empty")
	}
	if strings.TrimSpace(provider) == "" {
		return nil, fmt.Errorf("provider is empty")
	}
	// check access config & model parameter is json format
	if strings.TrimSpace(input.AccessConfiguration) != "" && !json.Valid([]byte(input.AccessConfiguration)) {
		return nil, fmt.Errorf("access configuration is not json format")
	}
	if strings.TrimSpace(input.ModelParameters) != "" && !json.Valid([]byte(input.ModelParameters)) {
		return nil, fmt.Errorf("model parameters is not json format")
	}
	return i.module.AddProviderModel(ctx, provider, input)
}
