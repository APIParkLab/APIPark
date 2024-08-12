package my_team

import (
	my_team "github.com/APIParkLab/APIPark/module/my-team"
	team_dto "github.com/APIParkLab/APIPark/module/my-team/dto"
	"github.com/gin-gonic/gin"
)

var (
	_ ITeamController = (*imlTeamController)(nil)
)

type imlTeamController struct {
	module my_team.ITeamModule `autowired:""`
}

func (c *imlTeamController) UpdateMemberRole(ctx *gin.Context, id string, input *team_dto.UpdateMemberRole) error {
	return c.module.UpdateMemberRole(ctx, id, input)
}

func (c *imlTeamController) GetTeam(ctx *gin.Context, id string) (*team_dto.Team, error) {
	return c.module.GetTeam(ctx, id)
}

func (c *imlTeamController) Search(ctx *gin.Context, keyword string) ([]*team_dto.Item, error) {
	
	return c.module.Search(ctx, keyword)
}

func (c *imlTeamController) EditTeam(ctx *gin.Context, id string, team *team_dto.EditTeam) (*team_dto.Team, error) {
	return c.module.Edit(ctx, id, team)
}

func (c *imlTeamController) SimpleTeams(ctx *gin.Context, keyword string) ([]*team_dto.SimpleTeam, error) {
	return c.module.SimpleTeams(ctx, keyword)
}

func (c *imlTeamController) AddMember(ctx *gin.Context, id string, users *team_dto.UserIDs) error {
	return c.module.AddMember(ctx, id, users.Users...)
}

func (c *imlTeamController) RemoveMember(ctx *gin.Context, id string, uuid string) error {
	return c.module.RemoveMember(ctx, id, uuid)
}

func (c *imlTeamController) Members(ctx *gin.Context, id string, keyword string) ([]*team_dto.Member, error) {
	return c.module.Members(ctx, id, keyword)
}

func (c *imlTeamController) SimpleMembers(ctx *gin.Context, id string, keyword string) ([]*team_dto.SimpleMember, error) {
	return c.module.SimpleMembers(ctx, id, keyword)
}
