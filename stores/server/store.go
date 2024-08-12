package server

import (
	"github.com/APIParkLab/APIPark/stores/universally/commit"
	"github.com/eolinker/go-common/autowire"
	"github.com/eolinker/go-common/store"
	"reflect"
)

type IServerStore interface {
	store.ISearchStore[Server]
}

type imlServerStore struct {
	store.SearchStore[Server]
}

type IServerApiStore interface {
	store.IBaseStore[Api]
}
type storeServerApi struct {
	store.Store[Api]
}
type IServerCommit interface {
	commit.ICommitWKStore[ServerCommit]
}
type IServicePartitionStore interface {
	store.IBaseStore[Partition]
}

type storeServerPartition struct {
	store.Store[Partition]
}

func init() {
	autowire.Auto[IServerStore](func() reflect.Value {
		return reflect.ValueOf(new(imlServerStore))
	})
	
	autowire.Auto[IServerApiStore](func() reflect.Value {
		return reflect.ValueOf(new(storeServerApi))
	})
	
	autowire.Auto[IServerCommit](func() reflect.Value {
		return reflect.ValueOf(commit.NewCommitWithKey[ServerCommit]("server", "setting"))
	})
	autowire.Auto[IServicePartitionStore](func() reflect.Value {
		return reflect.ValueOf(new(storeServerPartition))
	})
	
}
