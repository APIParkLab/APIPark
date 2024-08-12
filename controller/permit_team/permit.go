package permit_team

import (
	"reflect"

	"github.com/eolinker/go-common/autowire"
	"github.com/gin-gonic/gin"
)

type ITeamPermitController interface {
	Permissions(ctx *gin.Context, team string) ([]string, error)
}

func init() {
	autowire.Auto[ITeamPermitController](func() reflect.Value {
		return reflect.ValueOf(new(imlTeamPermitController))
	})
}
