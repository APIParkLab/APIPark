package ai_api

import (
	"context"
	ai_api_dto "github.com/APIParkLab/APIPark/module/ai-api/dto"
	"github.com/eolinker/go-common/autowire"
	"reflect"
)

type IAPIModule interface {
	Create(ctx context.Context, serviceId string, input *ai_api_dto.CreateAPI) (*ai_api_dto.API, error)
	Edit(ctx context.Context, serviceId string, apiId string, input *ai_api_dto.EditAPI) (*ai_api_dto.API, error)
	Delete(ctx context.Context, serviceId string, apiId string) error
	List(ctx context.Context, keyword, serviceId string) ([]*ai_api_dto.APIItem, error)
	Get(ctx context.Context, serviceId string, apiId string) (*ai_api_dto.API, error)
}

func init() {
	autowire.Auto[IAPIModule](func() reflect.Value {
		m := new(imlAPIModule)
		return reflect.ValueOf(m)
	})
}
