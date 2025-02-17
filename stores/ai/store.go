package ai

import (
	"reflect"

	"github.com/eolinker/go-common/autowire"
	"github.com/eolinker/go-common/store"
)

type IProviderStore interface {
	store.ISearchStore[Provider]
}

type imlProviderStore struct {
	store.SearchStore[Provider]
}

type ILogMetricsStore interface {
	store.ISearchStore[LogMetrics]
}

type imlLogMetricsStore struct {
	store.SearchStore[LogMetrics]
}

type IKeyStore interface {
	store.ISearchStore[Key]
}

type imlKeyStore struct {
	store.SearchStore[Key]
}

type IBalanceStore interface {
	store.ISearchStore[Balance]
}

type imlBalanceStore struct {
	store.SearchStore[Balance]
}

type ILocalModelStore interface {
	store.ISearchStore[LocalModel]
}

type imlLocalModelStore struct {
	store.SearchStore[LocalModel]
}

type ILocalModelPackageStore interface {
	store.ISearchStore[LocalModelPackage]
}

type imlLocalModelPackageStore struct {
	store.SearchStore[LocalModelPackage]
}

type ILocalModelInstallStateStore interface {
	store.ISearchStore[LocalModelInstallState]
}

type imlLocalModelInstallStateStore struct {
	store.SearchStore[LocalModelInstallState]
}

type ILocalModelCacheStore interface {
	store.IBaseStore[LocalModelCache]
}

type imlLocalModelCacheStore struct {
	store.Store[LocalModelCache]
}

func init() {
	autowire.Auto[IProviderStore](func() reflect.Value {
		return reflect.ValueOf(new(imlProviderStore))
	})

	autowire.Auto[ILogMetricsStore](func() reflect.Value {
		return reflect.ValueOf(new(imlLogMetricsStore))
	})

	autowire.Auto[IBalanceStore](func() reflect.Value {
		return reflect.ValueOf(new(imlBalanceStore))
	})

	autowire.Auto[ILocalModelStore](func() reflect.Value {
		return reflect.ValueOf(new(imlLocalModelStore))
	})

	autowire.Auto[ILocalModelPackageStore](func() reflect.Value {
		return reflect.ValueOf(new(imlLocalModelPackageStore))
	})

	autowire.Auto[IKeyStore](func() reflect.Value {
		return reflect.ValueOf(new(imlKeyStore))
	})

	autowire.Auto[ILocalModelInstallStateStore](func() reflect.Value {
		return reflect.ValueOf(new(imlLocalModelInstallStateStore))
	})

	autowire.Auto[ILocalModelCacheStore](func() reflect.Value {
		return reflect.ValueOf(new(imlLocalModelCacheStore))
	})
}
