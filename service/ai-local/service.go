package ai_local

import (
	"context"
	"reflect"

	"github.com/APIParkLab/APIPark/service/universally"
	"github.com/eolinker/go-common/autowire"
)

type ILocalModelService interface {
	universally.IServiceGet[LocalModel]
	universally.IServiceCreate[CreateLocalModel]
	universally.IServiceEdit[EditLocalModel]
	universally.IServiceDelete
	DefaultModel(ctx context.Context) (*LocalModel, error)
}

type ILocalModelPackageService interface {
	universally.IServiceGet[LocalModelPackage]
	universally.IServiceCreate[CreateLocalModelPackage]
	universally.IServiceEdit[EditLocalModelPackage]
	universally.IServiceDelete
	//SearchByModel(ctx context.Context, model string) ([]*LocalModelPackage, error)
}

type ILocalModelInstallStateService interface {
	universally.IServiceGet[LocalModelInstallState]
	universally.IServiceCreate[CreateLocalModelInstallState]
	universally.IServiceEdit[EditLocalModelInstallState]
	universally.IServiceDelete
}

type ILocalModelCacheService interface {
	List(ctx context.Context, model string, typ CacheType) ([]*LocalModelCache, error)
	Delete(ctx context.Context, model string) error
	Save(ctx context.Context, model string, typ CacheType, target string) error
	GetByTarget(ctx context.Context, typ CacheType, target string) (*LocalModelCache, error)
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

	autowire.Auto[ILocalModelCacheService](func() reflect.Value {
		return reflect.ValueOf(new(imlLocalModelCacheService))
	})
}
