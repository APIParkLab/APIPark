package tag

import (
	"context"
	"reflect"
	
	tag_dto "github.com/APIParkLab/APIPark/module/tag/dto"
	
	"github.com/eolinker/go-common/autowire"
)

type ITagModule interface {
	// Search 搜索标签
	Search(ctx context.Context, keyword string) ([]*tag_dto.Item, error)
	// Create 创建标签
	Create(ctx context.Context, input *tag_dto.CreateTag) error
	// Delete 删除标签
	Delete(ctx context.Context, id string) error
}

func init() {
	autowire.Auto[ITagModule](func() reflect.Value {
		return reflect.ValueOf(new(imlTagModule))
	})
}
