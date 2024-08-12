package tag

import (
	"context"
	
	"github.com/google/uuid"
	
	"github.com/eolinker/go-common/utils"
	
	tag_dto "github.com/APIParkLab/APIPark/module/tag/dto"
	"github.com/APIParkLab/APIPark/service/tag"
)

var (
	_ ITagModule = (*imlTagModule)(nil)
)

type imlTagModule struct {
	tagService tag.ITagService `autowired:""`
}

func (i *imlTagModule) Search(ctx context.Context, keyword string) ([]*tag_dto.Item, error) {
	items, err := i.tagService.Search(ctx, keyword, nil)
	if err != nil {
		return nil, err
	}
	out := utils.SliceToSlice(items, func(item *tag.Tag) *tag_dto.Item {
		return &tag_dto.Item{
			Id:   item.Id,
			Name: item.Name,
		}
	})
	return out, nil
}

func (i *imlTagModule) Create(ctx context.Context, input *tag_dto.CreateTag) error {
	if input.Id == "" {
		input.Id = uuid.New().String()
	}
	return i.tagService.Create(ctx, &tag.CreateTag{
		Id:   input.Id,
		Name: input.Name,
	})
}

func (i *imlTagModule) Delete(ctx context.Context, id string) error {
	return i.tagService.Delete(ctx, id)
}
