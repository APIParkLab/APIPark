package service_tag

import (
	"context"
	"reflect"

	"github.com/eolinker/go-common/autowire"
)

type ITagService interface {
	Delete(ctx context.Context, tids []string, sids []string) error
	Create(ctx context.Context, input *CreateTag) error
	List(ctx context.Context, sids []string, tids []string) ([]*Tag, error)
}

func init() {
	autowire.Auto[ITagService](func() reflect.Value {
		return reflect.ValueOf(new(imlTagService))
	})
}
