package permit_system

import (
	"reflect"

	"github.com/eolinker/go-common/autowire"
	"github.com/gin-gonic/gin"
)

type ISystemPermitController interface {
	Permissions(ctx *gin.Context) ([]string, error)
}

func init() {
	autowire.Auto[ISystemPermitController](func() reflect.Value {
		return reflect.ValueOf(new(imlSystemPermitController))
	})
}
