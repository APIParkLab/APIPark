package service_model_mapping

import (
	"context"
	"errors"
	"time"

	"github.com/APIParkLab/APIPark/service/universally"
	"github.com/APIParkLab/APIPark/stores/service"
	"github.com/eolinker/go-common/auto"
	"github.com/eolinker/go-common/utils"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

var _ IServiceModelMappingService = (*imlServiceModelMappingService)(nil)

type imlServiceModelMappingService struct {
	store service.IModelMappingStore `autowired:""`
	universally.IServiceGet[ModelMapping]
	universally.IServiceDelete
	universally.IServiceCreate[Create]
	universally.IServiceEdit[Edit]
}

func (i *imlServiceModelMappingService) GetByService(ctx context.Context, serviceId string) (*ModelMapping, error) {
	w := map[string]interface{}{
		"service": serviceId,
	}
	entity, err := i.store.First(ctx, w)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return &ModelMapping{
				Service: serviceId,
				Content: "",
			}, nil
		}
		return nil, err
	}
	return FromEntity(entity), nil
}

func (i *imlServiceModelMappingService) GetLabels(ctx context.Context, ids ...string) map[string]string {
	if len(ids) == 0 {
		return nil
	}
	list, err := i.store.ListQuery(ctx, "`uuid` in (?)", []interface{}{ids}, "id")
	if err != nil {
		return nil
	}
	return utils.SliceToMapO(list, func(i *service.ModelMapping) (string, string) {
		return i.UUID, i.Service
	})
}

func (i *imlServiceModelMappingService) OnComplete() {
	i.IServiceGet = universally.NewGetSoftDelete[ModelMapping, service.ModelMapping](i.store, FromEntity)
	i.IServiceDelete = universally.NewSoftDelete[service.ModelMapping](i.store)
	i.IServiceCreate = universally.NewCreatorSoftDelete[Create, service.ModelMapping](i.store, "service_model_mapping", createEntityHandler, uniquestHandler, labelHandler)
	i.IServiceEdit = universally.NewEdit[Edit, service.ModelMapping](i.store, updateHandler, labelHandler)
	auto.RegisterService("service_model_mapping", i)
}

func labelHandler(e *service.ModelMapping) []string {
	return []string{e.Service, e.UUID}
}

func uniquestHandler(i *Create) []map[string]interface{} {
	return []map[string]interface{}{{"service": i.Service}}
}

func createEntityHandler(i *Create) *service.ModelMapping {
	now := time.Now()
	return &service.ModelMapping{
		UUID:     uuid.New().String(),
		Service:  i.Service,
		Content:  i.Content,
		CreateAt: now,
		UpdateAt: now,
	}
}

func updateHandler(e *service.ModelMapping, i *Edit) {
	if i.Content != nil {
		e.Content = *i.Content
		e.UpdateAt = time.Now()
	}
}
