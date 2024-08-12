package common

import (
	"github.com/eolinker/go-common/autowire"
	"github.com/gin-gonic/gin"
	"reflect"
)

type ICommonController interface {
	Version(ctx *gin.Context) (string, string, error)
}

func init() {
	autowire.Auto[ICommonController](func() reflect.Value {
		return reflect.ValueOf(new(imlCommonController))
	})
}
