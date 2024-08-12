package catalogue

import (
	"context"
	"reflect"
	
	"github.com/eolinker/go-common/autowire"
	
	catalogue_dto "github.com/APIParkLab/APIPark/module/catalogue/dto"
)

type ICatalogueModule interface {
	// Search 搜索目录
	Search(ctx context.Context, keyword string) ([]*catalogue_dto.Item, error)
	// Create 创建目录
	Create(ctx context.Context, input *catalogue_dto.CreateCatalogue) error
	// Edit 编辑目录
	Edit(ctx context.Context, id string, input *catalogue_dto.EditCatalogue) error
	// Delete 删除目录
	Delete(ctx context.Context, id string) error
	// Services 关键字筛选服务列表
	Services(ctx context.Context, keyword string) ([]*catalogue_dto.ServiceItem, error)
	// ServiceDetail 服务详情
	ServiceDetail(ctx context.Context, sid string) (*catalogue_dto.ServiceDetail, error)
	// Subscribe 订阅服务
	Subscribe(ctx context.Context, subscribeInfo *catalogue_dto.SubscribeService) error
	Sort(ctx context.Context, sorts []*catalogue_dto.SortItem) error
}

func init() {
	autowire.Auto[ICatalogueModule](func() reflect.Value {
		return reflect.ValueOf(new(imlCatalogueModule))
	})
}
