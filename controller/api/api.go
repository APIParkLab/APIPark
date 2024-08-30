package api

import (
	api_doc_dto "github.com/APIParkLab/APIPark/module/api-doc/dto"
	"reflect"

	"github.com/gin-gonic/gin"

	"github.com/eolinker/go-common/autowire"

	api_dto "github.com/APIParkLab/APIPark/module/api/dto"
)

type IAPIController interface {
	// Detail 获取API详情
	Detail(ctx *gin.Context, serviceId string, apiId string) (*api_dto.ApiDetail, error)
	// Search 获取API列表
	Search(ctx *gin.Context, keyword string, serviceId string) ([]*api_dto.ApiItem, error)
	// Create 创建API
	Create(ctx *gin.Context, serviceId string, dto *api_dto.CreateApi) (*api_dto.ApiSimpleDetail, error)
	// Edit 编辑API
	Edit(ctx *gin.Context, serviceId string, apiId string, dto *api_dto.EditApi) (*api_dto.ApiSimpleDetail, error)
	// Delete 删除API
	Delete(ctx *gin.Context, serviceId string, apiId string) error
	// Prefix 获取API前缀
	Prefix(ctx *gin.Context, serviceId string) (string, bool, error)
}

type IAPIDocController interface {
	// UpdateDoc 更新API文档
	UpdateDoc(ctx *gin.Context, serviceId string, input *api_doc_dto.UpdateDoc) (*api_doc_dto.ApiDocDetail, error)
	// GetDoc 获取API文档
	GetDoc(ctx *gin.Context, serviceId string) (*api_doc_dto.ApiDocDetail, error)

	UploadDoc(ctx *gin.Context, serviceId string) (*api_doc_dto.ApiDocDetail, error)
}

func init() {
	autowire.Auto[IAPIController](func() reflect.Value {
		return reflect.ValueOf(new(imlAPIController))
	})

	autowire.Auto[IAPIDocController](func() reflect.Value {
		return reflect.ValueOf(new(imlAPIDocController))
	})
}
