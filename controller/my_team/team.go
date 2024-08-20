package my_team

import (
	"reflect"

	team_dto "github.com/APIParkLab/APIPark/module/my-team/dto"
	"github.com/eolinker/go-common/autowire"
	"github.com/gin-gonic/gin"
)

type ITeamController interface {
	// GetTeam 获取团队信息
	GetTeam(ctx *gin.Context, id string) (*team_dto.Team, error)
	Search(ctx *gin.Context, keyword string) ([]*team_dto.Item, error)
	EditTeam(ctx *gin.Context, id string, team *team_dto.EditTeam) (*team_dto.Team, error)
	MySimpleTeams(ctx *gin.Context, keyword string) ([]*team_dto.SimpleTeam, error)
	SimpleTeams(ctx *gin.Context, keyword string) ([]*team_dto.SimpleTeam, error)
	AddMember(ctx *gin.Context, id string, users *team_dto.UserIDs) error
	RemoveMember(ctx *gin.Context, id string, uuid string) error
	Members(ctx *gin.Context, id string, keyword string) ([]*team_dto.Member, error)
	SimpleMembers(ctx *gin.Context, id string, keyword string) ([]*team_dto.SimpleMember, error)
	UpdateMemberRole(ctx *gin.Context, id string, input *team_dto.UpdateMemberRole) error
}

func init() {
	autowire.Auto[ITeamController](func() reflect.Value {
		return reflect.ValueOf(new(imlTeamController))
	})
}
