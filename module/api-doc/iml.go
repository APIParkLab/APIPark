package api_doc

import (
	"context"
	api_doc_dto "github.com/APIParkLab/APIPark/module/api-doc/dto"
	"github.com/eolinker/go-common/autowire"
	"reflect"
)

type IAPIDocModule interface {
	UpdateDoc(ctx context.Context, serviceId string, input *api_doc_dto.UpdateDoc) (*api_doc_dto.ApiDocDetail, error)
	GetDoc(ctx context.Context, serviceId string) (*api_doc_dto.ApiDocDetail, error)
}

func init() {
	apiDocModule := new(imlAPIDocModule)
	autowire.Auto[IAPIDocModule](func() reflect.Value {
		return reflect.ValueOf(apiDocModule)
	})
}
