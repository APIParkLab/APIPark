package team

import (
	"reflect"

	"github.com/eolinker/ap-account/store/member"

	"github.com/eolinker/go-common/autowire"
	"github.com/eolinker/go-common/store"
)

type ITeamStore interface {
	store.ISearchStore[Team]
}

type ITeamMemberStore member.IMemberStore

type imlTeamStore struct {
	store.SearchStoreSoftDelete[Team]
}

func init() {
	autowire.Auto[ITeamStore](func() reflect.Value {
		return reflect.ValueOf(new(imlTeamStore))
	})
	autowire.Auto[ITeamMemberStore](func() reflect.Value {
		return reflect.ValueOf(member.NewMemberStore("team"))
	})
}
