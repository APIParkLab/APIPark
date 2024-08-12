package catalogue

import (
	"github.com/gin-gonic/gin"
	"reflect"
	
	tag_dto "github.com/APIParkLab/APIPark/module/tag/dto"
	
	catalogue_dto "github.com/APIParkLab/APIPark/module/catalogue/dto"
	
	"github.com/eolinker/go-common/autowire"
)

type ICatalogueController interface {
	// Search 搜索目录、标签列表
	Search(ctx *gin.Context, keyword string) ([]*catalogue_dto.Item, []*tag_dto.Item, error)
	// Create 创建目录
	Create(ctx *gin.Context, input *catalogue_dto.CreateCatalogue) error
	// Edit 修改目录
	Edit(ctx *gin.Context, id string, input *catalogue_dto.EditCatalogue) error
	// Delete 删除目录
	Delete(ctx *gin.Context, id string) error
	// Services 服务列表
	Services(ctx *gin.Context, keyword string) ([]*catalogue_dto.ServiceItem, error)
	// ServiceDetail 服务详情
	ServiceDetail(ctx *gin.Context, sid string) (*catalogue_dto.ServiceDetail, error)
	// Subscribe 订阅服务
	Subscribe(ctx *gin.Context, subscribeInfo *catalogue_dto.SubscribeService) error
	Sort(ctx *gin.Context, sorts *[]*catalogue_dto.SortItem) error
}

func init() {
	autowire.Auto[ICatalogueController](func() reflect.Value {
		return reflect.ValueOf(new(imlCatalogueController))
	})
}
