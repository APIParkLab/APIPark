package ai_api

import (
	ai_api "github.com/APIParkLab/APIPark/module/ai-api"
	ai_api_dto "github.com/APIParkLab/APIPark/module/ai-api/dto"
	"github.com/gin-gonic/gin"
)

var _ IAPIController = (*imlAPIController)(nil)

type imlAPIController struct {
	module ai_api.IAPIModule `autowired:""`
}

func (i *imlAPIController) Create(ctx *gin.Context, serviceId string, input *ai_api_dto.CreateAPI) (*ai_api_dto.API, error) {
	return i.module.Create(ctx, serviceId, input)
}

func (i *imlAPIController) Edit(ctx *gin.Context, serviceId string, apiId string, input *ai_api_dto.EditAPI) (*ai_api_dto.API, error) {
	return i.module.Edit(ctx, serviceId, apiId, input)
}

func (i *imlAPIController) Delete(ctx *gin.Context, serviceId string, apiId string) error {
	return i.module.Delete(ctx, serviceId, apiId)
}

func (i *imlAPIController) List(ctx *gin.Context, keyword string, serviceId string) ([]*ai_api_dto.APIItem, error) {
	return i.module.List(ctx, keyword, serviceId)
}

func (i *imlAPIController) Get(ctx *gin.Context, serviceId string, apiId string) (*ai_api_dto.API, error) {
	return i.module.Get(ctx, serviceId, apiId)
}
