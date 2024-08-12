package core

import (
	"net/http"

	"github.com/eolinker/go-common/pm3"
)

func (p *plugin) MyTeamApi() []pm3.Api {
	return []pm3.Api{
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/team", []string{"context", "query:team"}, []string{"team"}, p.myTeamController.GetTeam),
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/teams", []string{"context", "query:keyword"}, []string{"teams"}, p.myTeamController.Search),
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/simple/teams/mine", []string{"context", "query:keyword"}, []string{"teams"}, p.myTeamController.SimpleTeams),
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/team/members/simple", []string{"context", "query:team", "query:keyword"}, []string{"teams"}, p.myTeamController.SimpleMembers),
		pm3.CreateApiWidthDoc(http.MethodPut, "/api/v1/team", []string{"context", "query:team", "body"}, []string{"team"}, p.myTeamController.EditTeam),
		pm3.CreateApiWidthDoc(http.MethodPost, "/api/v1/team/member", []string{"context", "query:team", "body"}, nil, p.myTeamController.AddMember),
		pm3.CreateApiWidthDoc(http.MethodDelete, "/api/v1/team/member", []string{"context", "query:team", "query:user"}, nil, p.myTeamController.RemoveMember),
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/team/members", []string{"context", "query:team", "query:keyword"}, []string{"members"}, p.myTeamController.Members),

		pm3.CreateApiWidthDoc(http.MethodPut, "/api/v1/team/member/role", []string{"context", "query:team", "body"}, nil, p.myTeamController.UpdateMemberRole),

		// 团队项目操作
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/team/services", []string{"context", "query:team", "query:keyword"}, []string{"services"}, p.serviceController.Search),
		pm3.CreateApiWidthDoc(http.MethodPost, "/api/v1/team/service", []string{"context", "query:team", "body"}, []string{"service"}, p.serviceController.Create),
		pm3.CreateApiWidthDoc(http.MethodPost, "/api/v1/team/app", []string{"context", "query:team", "body"}, []string{"app"}, p.appController.CreateApp),
		pm3.CreateApiWidthDoc(http.MethodDelete, "/api/v1/team/service", []string{"context", "query:service"}, nil, p.serviceController.Delete),
	}
}
