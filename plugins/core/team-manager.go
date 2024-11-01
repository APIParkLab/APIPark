package core

import (
	"net/http"

	"github.com/APIParkLab/APIPark/resources/access"

	"github.com/eolinker/go-common/pm3"
)

func (p *plugin) TeamManagerApi() []pm3.Api {
	return []pm3.Api{
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/manager/team", []string{"context", "query:id"}, []string{"team"}, p.teamManagerController.GetTeam, access.SystemWorkspaceTeamViewAll, access.TeamTeamTeamView),
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/manager/teams", []string{"context", "query:keyword"}, []string{"teams"}, p.teamManagerController.Search, access.SystemWorkspaceTeamViewAll, access.TeamTeamTeamView),
		pm3.CreateApiWidthDoc(http.MethodPost, "/api/v1/manager/team", []string{"context", "body"}, []string{"team"}, p.teamManagerController.CreateTeam, access.SystemWorkspaceTeamCreate, access.TeamTeamTeamManager),
		pm3.CreateApiWidthDoc(http.MethodPut, "/api/v1/manager/team", []string{"context", "query:id", "body"}, []string{"team"}, p.teamManagerController.EditTeam, access.SystemWorkspaceTeamManager, access.TeamTeamTeamManager),
		pm3.CreateApiWidthDoc(http.MethodDelete, "/api/v1/manager/team", []string{"context", "query:id"}, []string{"id"}, p.teamManagerController.DeleteTeam, access.SystemWorkspaceTeamManager, access.TeamTeamTeamManager),
	}
}
