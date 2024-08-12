package team_manager

import (
	"github.com/APIParkLab/APIPark/module/team"
	team_dto "github.com/APIParkLab/APIPark/module/team/dto"
	"github.com/gin-gonic/gin"
)

var (
	_ ITeamManagerController = (*imlTeamManagerController)(nil)
)

type imlTeamManagerController struct {
	module team.ITeamModule `autowired:""`
}

func (c *imlTeamManagerController) GetTeam(ctx *gin.Context, id string) (*team_dto.Team, error) {
	return c.module.GetTeam(ctx, id)
}

func (c *imlTeamManagerController) Search(ctx *gin.Context, keyword string) ([]*team_dto.Item, error) {
	return c.module.Search(ctx, keyword)
}

func (c *imlTeamManagerController) CreateTeam(ctx *gin.Context, team *team_dto.CreateTeam) (*team_dto.Team, error) {
	return c.module.Create(ctx, team)
}

func (c *imlTeamManagerController) EditTeam(ctx *gin.Context, id string, team *team_dto.EditTeam) (*team_dto.Team, error) {
	return c.module.Edit(ctx, id, team)
}

func (c *imlTeamManagerController) DeleteTeam(ctx *gin.Context, id string) (string, error) {
	err := c.module.Delete(ctx, id)
	if err != nil {
		return "", err
	}
	return id, nil
}
