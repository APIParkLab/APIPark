package router

import (
	"reflect"

	api_doc_dto "github.com/APIParkLab/APIPark/module/api-doc/dto"

	"github.com/gin-gonic/gin"

	"github.com/eolinker/go-common/autowire"

	router_dto "github.com/APIParkLab/APIPark/module/router/dto"
)

type IRouterController interface {
	// Detail 获取API详情
	Detail(ctx *gin.Context, serviceId string, apiId string) (*router_dto.Detail, error)
	// Search 获取API列表
	Search(ctx *gin.Context, keyword string, serviceId string) ([]*router_dto.Item, error)
	// Create 创建API
	Create(ctx *gin.Context, serviceId string, dto *router_dto.Create) (*router_dto.SimpleDetail, error)
	// Edit 编辑API
	Edit(ctx *gin.Context, serviceId string, apiId string, dto *router_dto.Edit) (*router_dto.SimpleDetail, error)
	// Delete 删除API
	Delete(ctx *gin.Context, serviceId string, apiId string) error
	// Prefix 获取API前缀
	Prefix(ctx *gin.Context, serviceId string) (string, bool, error)
	Simple(ctx *gin.Context, input *router_dto.InputSimpleAPI) ([]*router_dto.SimpleItem, error)
}

type IAPIDocController interface {
	// UpdateDoc 更新API文档
	UpdateDoc(ctx *gin.Context, serviceId string, input *api_doc_dto.UpdateDoc) (*api_doc_dto.ApiDocDetail, error)
	// GetDoc 获取API文档
	GetDoc(ctx *gin.Context, serviceId string) (*api_doc_dto.ApiDocDetail, error)

	UploadDoc(ctx *gin.Context, serviceId string) (*api_doc_dto.ApiDocDetail, error)
}

func init() {
	autowire.Auto[IRouterController](func() reflect.Value {
		return reflect.ValueOf(new(imlAPIController))
	})

	autowire.Auto[IAPIDocController](func() reflect.Value {
		return reflect.ValueOf(new(imlAPIDocController))
	})
}
