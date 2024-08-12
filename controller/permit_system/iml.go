package permit_system

import (
	"github.com/APIParkLab/APIPark/module/permit/system"
	"github.com/eolinker/go-common/autowire"
	"github.com/gin-gonic/gin"
)

var (
	_ ISystemPermitController = (*imlSystemPermitController)(nil)
	_ autowire.Complete       = (*imlSystemPermitController)(nil)
)

type imlSystemPermitController struct {
	systemPermitModule system.ISystemPermitModule `autowired:""`
}

func (c *imlSystemPermitController) Permissions(ctx *gin.Context) ([]string, error) {
	return c.systemPermitModule.Permissions(ctx)
}

func (c *imlSystemPermitController) OnComplete() {

}
