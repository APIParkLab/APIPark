package service_doc

import (
	"context"
	"reflect"

	"github.com/eolinker/go-common/autowire"
)

type IDocService interface {
	Get(ctx context.Context, sid string) (*Doc, error)
	Save(ctx context.Context, input *SaveDoc) error
}

func init() {
	autowire.Auto[IDocService](func() reflect.Value {
		return reflect.ValueOf(new(imlDocService))
	})
}
