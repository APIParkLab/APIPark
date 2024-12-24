package ai_api

import (
	"context"
	"reflect"

	ai_api_dto "github.com/APIParkLab/APIPark/module/ai-api/dto"
	"github.com/eolinker/go-common/autowire"
)

type IAPIModule interface {
	Create(ctx context.Context, serviceId string, input *ai_api_dto.CreateAPI) error
	Edit(ctx context.Context, serviceId string, apiId string, input *ai_api_dto.EditAPI) error
	Delete(ctx context.Context, serviceId string, apiId string) error
	List(ctx context.Context, keyword, serviceId string) ([]*ai_api_dto.APIItem, error)
	Get(ctx context.Context, serviceId string, apiId string) (*ai_api_dto.API, error)
	Prefix(ctx context.Context, serviceId string) (string, error)
}

func init() {
	autowire.Auto[IAPIModule](func() reflect.Value {
		m := new(imlAPIModule)
		return reflect.ValueOf(m)
	})
}
