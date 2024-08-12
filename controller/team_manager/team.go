package team_manager

import (
	team_dto "github.com/APIParkLab/APIPark/module/team/dto"
	"github.com/eolinker/go-common/autowire"
	"github.com/gin-gonic/gin"
	"reflect"
)

type ITeamManagerController interface {
	// GetTeam 获取团队信息
	GetTeam(ctx *gin.Context, id string) (*team_dto.Team, error)
	Search(ctx *gin.Context, keyword string) ([]*team_dto.Item, error)
	CreateTeam(ctx *gin.Context, team *team_dto.CreateTeam) (*team_dto.Team, error)
	EditTeam(ctx *gin.Context, id string, team *team_dto.EditTeam) (*team_dto.Team, error)
	DeleteTeam(ctx *gin.Context, id string) (string, error)
}

func init() {
	autowire.Auto[ITeamManagerController](func() reflect.Value {
		return reflect.ValueOf(new(imlTeamManagerController))
	})
}
