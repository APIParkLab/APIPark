package ai_model

import (
	"context"
	"github.com/APIParkLab/APIPark/service/universally"
	"github.com/eolinker/go-common/autowire"
	"reflect"
)

type IProviderModelService interface {
	universally.IServiceGet[ProviderModel]
	universally.IServiceDelete
	CountMapByProvider(ctx context.Context, conditions map[string]interface{}) (map[string]int64, error)
	Save(ctx context.Context, id string, cfg *Model) error
	CheckNameDuplicate(ctx context.Context, provider string, name string, excludeId string) bool
}

func init() {
	autowire.Auto[IProviderModelService](func() reflect.Value {
		return reflect.ValueOf(new(imlProviderModelService))
	})
}
