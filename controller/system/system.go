package system

import (
	"reflect"

	system_dto "github.com/APIParkLab/APIPark/module/system/dto"
	"github.com/eolinker/go-common/autowire"
	"github.com/gin-gonic/gin"
)

type IExportConfigController interface {
	ExportAll(ctx *gin.Context) error
}

type IImportConfigController interface {
	ImportAll(ctx *gin.Context) error
}

type ISettingController interface {
	Get(ctx *gin.Context) (*system_dto.Setting, error)
	Set(ctx *gin.Context, input *system_dto.InputSetting) error
}

func init() {
	autowire.Auto[IExportConfigController](func() reflect.Value {
		return reflect.ValueOf(new(imlExportConfigController))
	})

	autowire.Auto[IImportConfigController](func() reflect.Value {
		return reflect.ValueOf(new(imlImportConfigController))
	})

	autowire.Auto[ISettingController](func() reflect.Value {
		return reflect.ValueOf(new(imlSettingController))
	})
}
