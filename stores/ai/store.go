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

func init() {
	autowire.Auto[IProviderStore](func() reflect.Value {
		return reflect.ValueOf(new(imlProviderStore))
	})

	autowire.Auto[ILogMetricsStore](func() reflect.Value {
		return reflect.ValueOf(new(imlLogMetricsStore))
	})

	autowire.Auto[IKeyStore](func() reflect.Value {
		return reflect.ValueOf(new(imlKeyStore))
	})
}
