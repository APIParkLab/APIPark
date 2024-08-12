package tag

import (
	"reflect"

	"github.com/eolinker/go-common/autowire"
	"github.com/eolinker/go-common/store"
)

type ITagStore interface {
	store.ISearchStore[Tag]
}

type imlTagStore struct {
	store.SearchStore[Tag]
}

func init() {
	autowire.Auto[ITagStore](func() reflect.Value {
		return reflect.ValueOf(new(imlTagStore))
	})
}
