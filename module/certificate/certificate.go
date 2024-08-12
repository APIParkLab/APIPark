package certificate

import (
	"context"
	"reflect"
	
	"github.com/APIParkLab/APIPark/gateway"
	
	certificate_dto "github.com/APIParkLab/APIPark/module/certificate/dto"
	"github.com/eolinker/go-common/autowire"
)

type ICertificateModule interface {
	Create(ctx context.Context, create *certificate_dto.FileInput) error
	Update(ctx context.Context, id string, edit *certificate_dto.FileInput) error
	List(ctx context.Context) ([]*certificate_dto.Certificate, error)
	Detail(ctx context.Context, id string) (*certificate_dto.Certificate, *certificate_dto.File, error)
	Delete(ctx context.Context, id string) error
}

func init() {
	autowire.Auto[ICertificateModule](func() reflect.Value {
		m := new(imlCertificate)
		gateway.RegisterInitHandleFunc(m.initGateway)
		return reflect.ValueOf(m)
	})
}
