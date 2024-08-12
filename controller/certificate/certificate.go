package certificate

import (
	"reflect"
	
	certificate_dto "github.com/APIParkLab/APIPark/module/certificate/dto"
	"github.com/eolinker/go-common/autowire"
	"github.com/gin-gonic/gin"
)

type ICertificateController interface {
	Create(ctx *gin.Context, create *certificate_dto.FileInput) error
	Update(ctx *gin.Context, id string, edit *certificate_dto.FileInput) error
	ListForPartition(ctx *gin.Context) ([]*certificate_dto.Certificate, error)
	Detail(ctx *gin.Context, id string) (*certificate_dto.Certificate, *certificate_dto.File, error)
	Delete(ctx *gin.Context, id string) (string, error)
}

func init() {
	autowire.Auto[ICertificateController](func() reflect.Value {
		return reflect.ValueOf(new(imlCertificate))
	})
}
