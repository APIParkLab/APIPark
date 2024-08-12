package api

import (
	"github.com/APIParkLab/APIPark/module/api"
	api_dto "github.com/APIParkLab/APIPark/module/api/dto"
	"github.com/gin-gonic/gin"
)

var _ IAPIController = (*imlAPIController)(nil)

type imlAPIController struct {
	module api.IApiModule `autowired:""`
}

//func (i *imlAPIController) SimpleList(ctx *gin.Context, serviceId string) ([]*api_dto.ApiSimpleItem, error) {
//	return i.module.SimpleList(ctx, serviceId)
//}

func (i *imlAPIController) Detail(ctx *gin.Context, serviceId string, apiId string) (*api_dto.ApiDetail, error) {
	return i.module.Detail(ctx, serviceId, apiId)
}

func (i *imlAPIController) SimpleDetail(ctx *gin.Context, serviceId string, apiId string) (*api_dto.ApiSimpleDetail, error) {
	return i.module.SimpleDetail(ctx, serviceId, apiId)
}

func (i *imlAPIController) Search(ctx *gin.Context, keyword string, serviceId string) ([]*api_dto.ApiItem, error) {
	return i.module.Search(ctx, keyword, serviceId)
}

func (i *imlAPIController) SimpleSearch(ctx *gin.Context, keyword string, serviceId string) ([]*api_dto.ApiSimpleItem, error) {
	return i.module.SimpleSearch(ctx, keyword, serviceId)
}

func (i *imlAPIController) Create(ctx *gin.Context, serviceId string, dto *api_dto.CreateApi) (*api_dto.ApiSimpleDetail, error) {
	return i.module.Create(ctx, serviceId, dto)
}

func (i *imlAPIController) Edit(ctx *gin.Context, serviceId string, apiId string, dto *api_dto.EditApi) (*api_dto.ApiSimpleDetail, error) {
	return i.module.Edit(ctx, serviceId, apiId, dto)
}

func (i *imlAPIController) Delete(ctx *gin.Context, serviceId string, apiId string) error {
	return i.module.Delete(ctx, serviceId, apiId)
}

func (i *imlAPIController) Copy(ctx *gin.Context, serviceId string, apiId string, dto *api_dto.CreateApi) (*api_dto.ApiSimpleDetail, error) {
	return i.module.Copy(ctx, serviceId, apiId, dto)
}

func (i *imlAPIController) ApiDocDetail(ctx *gin.Context, serviceId string, apiId string) (*api_dto.ApiDocDetail, error) {
	return i.module.ApiDocDetail(ctx, serviceId, apiId)
}

func (i *imlAPIController) ApiProxyDetail(ctx *gin.Context, serviceId string, apiId string) (*api_dto.ApiProxyDetail, error) {
	return i.module.ApiProxyDetail(ctx, serviceId, apiId)
}

func (i *imlAPIController) Prefix(ctx *gin.Context, serviceId string) (string, bool, error) {
	prefix, err := i.module.Prefix(ctx, serviceId)
	if err != nil {
		return "", false, err
	}
	return prefix, true, nil
}
