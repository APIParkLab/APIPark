package api

import (
	"github.com/APIParkLab/APIPark/module/api"
	api_doc "github.com/APIParkLab/APIPark/module/api-doc"
	api_doc_dto "github.com/APIParkLab/APIPark/module/api-doc/dto"
	api_dto "github.com/APIParkLab/APIPark/module/api/dto"
	"github.com/gin-gonic/gin"
	"io"
)

var _ IAPIController = (*imlAPIController)(nil)

type imlAPIController struct {
	module api.IApiModule `autowired:""`
}

func (i *imlAPIController) Detail(ctx *gin.Context, serviceId string, apiId string) (*api_dto.ApiDetail, error) {
	return i.module.Detail(ctx, serviceId, apiId)
}

func (i *imlAPIController) Search(ctx *gin.Context, keyword string, serviceId string) ([]*api_dto.ApiItem, error) {
	return i.module.Search(ctx, keyword, serviceId)
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

func (i *imlAPIController) Prefix(ctx *gin.Context, serviceId string) (string, bool, error) {
	prefix, err := i.module.Prefix(ctx, serviceId)
	if err != nil {
		return "", false, err
	}
	return prefix, true, nil
}

var _ IAPIDocController = (*imlAPIDocController)(nil)

type imlAPIDocController struct {
	module api_doc.IAPIDocModule `autowired:""`
}

func (i *imlAPIDocController) UpdateDoc(ctx *gin.Context, serviceId string, input *api_doc_dto.UpdateDoc) (*api_doc_dto.ApiDocDetail, error) {
	return i.module.UpdateDoc(ctx, serviceId, input)
}

func (i *imlAPIDocController) GetDoc(ctx *gin.Context, serviceId string) (*api_doc_dto.ApiDocDetail, error) {
	return i.module.GetDoc(ctx, serviceId)
}

func (i *imlAPIDocController) UploadDoc(ctx *gin.Context, serviceId string) (*api_doc_dto.ApiDocDetail, error) {
	// 获取文件内容
	fileHeader, err := ctx.FormFile("doc")
	if err != nil {
		return nil, err
	}

	file, err := fileHeader.Open()
	if err != nil {
		return nil, err
	}
	content, err := io.ReadAll(file)
	if err != nil {
		return nil, err
	}

	return i.module.UpdateDoc(ctx, serviceId, &api_doc_dto.UpdateDoc{
		Content: string(content),
	})
}
