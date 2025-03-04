package service

import (
	"github.com/eolinker/go-common/autowire"
	"github.com/eolinker/go-common/store"
)
import "reflect"

type IServiceStore interface {
	store.ISearchStore[Service]
	GetModelMapping(service string) (*ModelMapping, error)
	SaveModelMapping(mapping *ModelMapping) error
}
type imlServiceStore struct {
	store.SearchStore[Service]
	mappingStore IModelMappingStore `autowired:""`
}

func (i *imlServiceStore) GetModelMapping(service string) (*ModelMapping, error) {
	return i.mappingStore.First(nil, map[string]interface{}{"service": service})
}

func (i *imlServiceStore) SaveModelMapping(mapping *ModelMapping) error {
	return i.mappingStore.Save(nil, mapping)
}

type IServiceTagStore interface {
	store.IBaseStore[Tag]
}

type imlServiceTagStore struct {
	store.Store[Tag]
}

type IServiceDocStore interface {
	store.ISearchStore[Doc]
}

type imlServiceDocStore struct {
	store.SearchStore[Doc]
}

type IAuthorizationStore interface {
	store.ISearchStore[Authorization]
}

type imlAuthorizationStore struct {
	store.SearchStore[Authorization]
}

func init() {
	autowire.Auto[IServiceStore](func() reflect.Value {
		return reflect.ValueOf(new(imlServiceStore))
	})
	autowire.Auto[IAuthorizationStore](func() reflect.Value {
		return reflect.ValueOf(new(imlAuthorizationStore))
	})
	autowire.Auto[IServiceTagStore](func() reflect.Value {
		return reflect.ValueOf(new(imlServiceTagStore))
	})

	autowire.Auto[IServiceDocStore](func() reflect.Value {
		return reflect.ValueOf(new(imlServiceDocStore))
	})

}
