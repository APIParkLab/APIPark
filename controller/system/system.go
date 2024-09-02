package system

import (
	"github.com/eolinker/go-common/autowire"
	"github.com/gin-gonic/gin"
	"reflect"
)

type IExportConfigController interface {
	ExportAll(ctx *gin.Context) error
}

type IImportConfigController interface {
	ImportAll(ctx *gin.Context) error
}

func init() {
	autowire.Auto[IExportConfigController](func() reflect.Value {
		return reflect.ValueOf(new(imlExportConfigController))
	})

	autowire.Auto[IImportConfigController](func() reflect.Value {
		return reflect.ValueOf(new(imlImportConfigController))
	})
}
