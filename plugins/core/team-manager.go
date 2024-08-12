package core

import (
	"github.com/eolinker/go-common/pm3"
	"net/http"
)

func (p *plugin) TeamManagerApi() []pm3.Api {
	return []pm3.Api{
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/manager/team", []string{"context", "query:id"}, []string{"team"}, p.teamManagerController.GetTeam),
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/manager/teams", []string{"context", "query:keyword"}, []string{"teams"}, p.teamManagerController.Search),
		pm3.CreateApiWidthDoc(http.MethodPost, "/api/v1/manager/team", []string{"context", "body"}, []string{"team"}, p.teamManagerController.CreateTeam),
		pm3.CreateApiWidthDoc(http.MethodPut, "/api/v1/manager/team", []string{"context", "query:id", "body"}, []string{"team"}, p.teamManagerController.EditTeam),
		pm3.CreateApiWidthDoc(http.MethodDelete, "/api/v1/manager/team", []string{"context", "query:id"}, []string{"id"}, p.teamManagerController.DeleteTeam),
	}
}
