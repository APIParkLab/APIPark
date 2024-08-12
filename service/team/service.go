package team

import (
	"reflect"
	
	"github.com/APIParkLab/APIPark/service/universally"
	"github.com/eolinker/go-common/autowire"
)

type ITeamService interface {
	universally.IServiceGet[Team]
	universally.IServiceDelete
	universally.IServiceCreate[CreateTeam]
	universally.IServiceEdit[EditTeam]
}

func init() {
	autowire.Auto[ITeamService](func() reflect.Value {
		return reflect.ValueOf(new(imlTeamService))
	})
}
