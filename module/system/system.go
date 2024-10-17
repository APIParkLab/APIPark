package system

import (
	"context"
	"reflect"

	"github.com/eolinker/go-common/autowire"

	system_dto "github.com/APIParkLab/APIPark/module/system/dto"
)

type IExportModule[T any] interface {
	ExportAll(ctx context.Context) ([]*T, error)
}

type ISettingModule interface {
	Get(ctx context.Context) *system_dto.Setting
	Set(ctx context.Context, input *system_dto.InputSetting) error
}

func init() {
	autowire.Auto[ISettingModule](func() reflect.Value {
		return reflect.ValueOf(new(imlSettingModule))
	})

}
