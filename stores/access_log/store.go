package access_log

import (
	"reflect"

	"github.com/eolinker/go-common/autowire"
	"github.com/eolinker/go-common/store"
)

type ILogStore interface {
	store.ISearchStore[Log]
}

type imlLogStore struct {
	store.SearchStore[Log]
}

func init() {
	autowire.Auto[ILogStore](func() reflect.Value {
		return reflect.ValueOf(new(imlLogStore))
	})
}
