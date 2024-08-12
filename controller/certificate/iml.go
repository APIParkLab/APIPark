package certificate

import (
	"github.com/APIParkLab/APIPark/module/certificate"
	certificate_dto "github.com/APIParkLab/APIPark/module/certificate/dto"
	"github.com/gin-gonic/gin"
)

var (
	_ ICertificateController = (*imlCertificate)(nil)
)

type imlCertificate struct {
	module certificate.ICertificateModule `autowired:""`
}

func (c *imlCertificate) Create(ctx *gin.Context, create *certificate_dto.FileInput) error {
	return c.module.Create(ctx, create)
}

func (c *imlCertificate) Update(ctx *gin.Context, id string, edit *certificate_dto.FileInput) error {
	return c.module.Update(ctx, id, edit)
}

func (c *imlCertificate) ListForPartition(ctx *gin.Context) ([]*certificate_dto.Certificate, error) {
	return c.module.List(ctx)
}

func (c *imlCertificate) Detail(ctx *gin.Context, id string) (*certificate_dto.Certificate, *certificate_dto.File, error) {
	return c.module.Detail(ctx, id)
}

func (c *imlCertificate) Delete(ctx *gin.Context, id string) (string, error) {
	err := c.module.Delete(ctx, id)
	if err != nil {
		return "", err
	}
	return id, nil
}
