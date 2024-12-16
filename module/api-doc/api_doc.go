package api_doc

import (
	"context"
	"errors"

	api_doc_dto "github.com/APIParkLab/APIPark/module/api-doc/dto"
	api_doc "github.com/APIParkLab/APIPark/service/api-doc"
	"github.com/APIParkLab/APIPark/service/service"

	"github.com/eolinker/go-common/auto"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

var _ IAPIDocModule = (*imlAPIDocModule)(nil)

type imlAPIDocModule struct {
	apiDocService  api_doc.IAPIDocService  `autowired:""`
	serviceService service.IServiceService `autowired:""`
}

func (i *imlAPIDocModule) UpdateDoc(ctx context.Context, serviceId string, input *api_doc_dto.UpdateDoc) (*api_doc_dto.ApiDocDetail, error) {
	info, err := i.serviceService.Get(ctx, serviceId)
	if err != nil {
		return nil, err
	}
	if input.Id == "" {
		input.Id = uuid.New().String()
	}
	// 每个API加上前缀

	err = i.apiDocService.UpdateDoc(ctx, serviceId, &api_doc.UpdateDoc{
		ID:      input.Id,
		Content: input.Content,
		Prefix:  info.Prefix,
	})
	if err != nil {
		return nil, err
	}
	return i.GetDoc(ctx, serviceId)
}

func (i *imlAPIDocModule) GetDoc(ctx context.Context, serviceId string) (*api_doc_dto.ApiDocDetail, error) {
	_, err := i.serviceService.Get(ctx, serviceId)
	if err != nil {
		return nil, err
	}
	info, err := i.apiDocService.GetDoc(ctx, serviceId)
	if err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, err
		}
		return nil, nil
	}
	return &api_doc_dto.ApiDocDetail{
		Content:    info.Content,
		Updater:    info.Updater,
		UpdateTime: auto.TimeLabel(info.UpdateAt),
	}, nil
}
