package api

import (
	"reflect"
	
	"github.com/gin-gonic/gin"
	
	"github.com/eolinker/go-common/autowire"
	
	api_dto "github.com/APIParkLab/APIPark/module/api/dto"
)

type IAPIController interface {
	// Detail 获取API详情
	Detail(ctx *gin.Context, serviceId string, apiId string) (*api_dto.ApiDetail, error)
	// SimpleDetail 获取API简要详情
	SimpleDetail(ctx *gin.Context, serviceId string, apiId string) (*api_dto.ApiSimpleDetail, error)
	// Search 获取API列表
	Search(ctx *gin.Context, keyword string, serviceId string) ([]*api_dto.ApiItem, error)
	// SimpleSearch 获取API简要列表
	SimpleSearch(ctx *gin.Context, keyword string, serviceId string) ([]*api_dto.ApiSimpleItem, error)
	//SimpleList(ctx *gin.Context, serviceId string) ([]*api_dto.ApiSimpleItem, error)
	// Create 创建API
	Create(ctx *gin.Context, serviceId string, dto *api_dto.CreateApi) (*api_dto.ApiSimpleDetail, error)
	// Edit 编辑API
	Edit(ctx *gin.Context, serviceId string, apiId string, dto *api_dto.EditApi) (*api_dto.ApiSimpleDetail, error)
	// Delete 删除API
	Delete(ctx *gin.Context, serviceId string, apiId string) error
	// Copy 复制API
	Copy(ctx *gin.Context, serviceId string, apiId string, dto *api_dto.CreateApi) (*api_dto.ApiSimpleDetail, error)
	// ApiDocDetail 获取API文档详情
	ApiDocDetail(ctx *gin.Context, serviceId string, apiId string) (*api_dto.ApiDocDetail, error)
	// ApiProxyDetail 获取API代理详情
	ApiProxyDetail(ctx *gin.Context, serviceId string, apiId string) (*api_dto.ApiProxyDetail, error)
	// Prefix 获取API前缀
	Prefix(ctx *gin.Context, serviceId string) (string, bool, error)
}

func init() {
	autowire.Auto[IAPIController](func() reflect.Value {
		return reflect.ValueOf(new(imlAPIController))
	})
}
