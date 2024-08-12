package catalogue

import (
	"reflect"

	"github.com/eolinker/go-common/autowire"
	"github.com/eolinker/go-common/store"
)

type ICatalogueStore interface {
	store.ISearchStore[Catalogue]
}

type imlCatalogueStore struct {
	store.SearchStore[Catalogue]
}

func init() {
	autowire.Auto[ICatalogueStore](func() reflect.Value {
		return reflect.ValueOf(new(imlCatalogueStore))
	})
}
