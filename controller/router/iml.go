package router

import (
	"io"

	api_doc "github.com/APIParkLab/APIPark/module/api-doc"
	api_doc_dto "github.com/APIParkLab/APIPark/module/api-doc/dto"
	"github.com/APIParkLab/APIPark/module/router"
	router_dto "github.com/APIParkLab/APIPark/module/router/dto"
	"github.com/gin-gonic/gin"
)

var _ IRouterController = (*imlAPIController)(nil)

type imlAPIController struct {
	module router.IRouterModule `autowired:""`
}

func (i *imlAPIController) Simple(ctx *gin.Context, input *router_dto.InputSimpleAPI) ([]*router_dto.SimpleItem, error) {
	return i.module.SimpleAPIs(ctx, input)
}

func (i *imlAPIController) Detail(ctx *gin.Context, serviceId string, apiId string) (*router_dto.Detail, error) {
	return i.module.Detail(ctx, serviceId, apiId)
}

func (i *imlAPIController) Search(ctx *gin.Context, keyword string, serviceId string) ([]*router_dto.Item, error) {
	return i.module.Search(ctx, keyword, serviceId)
}

func (i *imlAPIController) Create(ctx *gin.Context, serviceId string, dto *router_dto.Create) (*router_dto.SimpleDetail, error) {
	return i.module.Create(ctx, serviceId, dto)
}

func (i *imlAPIController) Edit(ctx *gin.Context, serviceId string, apiId string, dto *router_dto.Edit) (*router_dto.SimpleDetail, error) {
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
