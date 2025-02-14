package ai_local

import (
	"reflect"

	"github.com/APIParkLab/APIPark/service/universally"
	"github.com/eolinker/go-common/autowire"
)

type ILocalModelService interface {
	universally.IServiceGet[LocalModel]
	universally.IServiceCreate[CreateLocalModel]
	universally.IServiceEdit[EditLocalModel]
	universally.IServiceDelete
}

type ILocalModelPackageService interface {
	universally.IServiceGet[LocalModelPackage]
	universally.IServiceCreate[CreateLocalModelPackage]
	universally.IServiceEdit[EditLocalModelPackage]
	universally.IServiceDelete
}

type ILocalModelInstallStateService interface {
	universally.IServiceGet[LocalModelInstallState]
	universally.IServiceCreate[CreateLocalModelInstallState]
	universally.IServiceEdit[EditLocalModelInstallState]
	universally.IServiceDelete
}

func init() {
	autowire.Auto[ILocalModelService](func() reflect.Value {
		return reflect.ValueOf(new(imlLocalModelService))
	})
	autowire.Auto[ILocalModelPackageService](func() reflect.Value {
		return reflect.ValueOf(new(imlLocalModelPackageService))
	})

	autowire.Auto[ILocalModelInstallStateService](func() reflect.Value {
		return reflect.ValueOf(new(imlLocalModelInstallStateService))
	})
}
