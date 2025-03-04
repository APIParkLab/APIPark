package service_model_mapping

import (
	"context"
	"reflect"

	"github.com/APIParkLab/APIPark/service/universally"
	"github.com/eolinker/go-common/autowire"
)

type IServiceModelMappingService interface {
	universally.IServiceGet[ModelMapping]
	universally.IServiceCreate[Create]
	universally.IServiceEdit[Edit]
	universally.IServiceDelete

	// GetByService 根据服务ID获取模型映射
	GetByService(ctx context.Context, serviceId string) (*ModelMapping, error)
}

func init() {
	autowire.Auto[IServiceModelMappingService](func() reflect.Value {
		return reflect.ValueOf(new(imlServiceModelMappingService))
	})
}
