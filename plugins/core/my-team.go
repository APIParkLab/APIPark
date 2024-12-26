package core

import (
	"net/http"

	"github.com/APIParkLab/APIPark/resources/access"
	"github.com/eolinker/go-common/pm3"
)

func (p *plugin) MyTeamApi() []pm3.Api {
	return []pm3.Api{
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/team", []string{"context", "query:team"}, []string{"team"}, p.myTeamController.GetTeam, access.SystemWorkspaceTeamViewAll, access.TeamTeamTeamView),
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/teams", []string{"context", "query:keyword"}, []string{"teams"}, p.myTeamController.Search),
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/simple/teams/mine", []string{"context", "query:keyword"}, []string{"teams"}, p.myTeamController.MySimpleTeams),
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/simple/teams", []string{"context", "query:keyword"}, []string{"teams"}, p.myTeamController.SimpleTeams),
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/team/members/simple", []string{"context", "query:team", "query:keyword"}, []string{"teams"}, p.myTeamController.SimpleMembers),
		pm3.CreateApiWidthDoc(http.MethodPut, "/api/v1/team", []string{"context", "query:team", "body"}, []string{"team"}, p.myTeamController.EditTeam, access.SystemWorkspaceTeamManager, access.TeamTeamTeamManager),
		pm3.CreateApiWidthDoc(http.MethodPost, "/api/v1/team/member", []string{"context", "query:team", "body"}, nil, p.myTeamController.AddMember, access.SystemWorkspaceTeamManager, access.TeamTeamMemberManager),
		pm3.CreateApiWidthDoc(http.MethodDelete, "/api/v1/team/member", []string{"context", "query:team", "query:user"}, nil, p.myTeamController.RemoveMember, access.SystemWorkspaceTeamManager, access.TeamTeamMemberManager),
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/team/members", []string{"context", "query:team", "query:keyword"}, []string{"members"}, p.myTeamController.Members, access.SystemWorkspaceTeamViewAll, access.TeamTeamMemberView),

		pm3.CreateApiWidthDoc(http.MethodPut, "/api/v1/team/member/role", []string{"context", "query:team", "body"}, nil, p.myTeamController.UpdateMemberRole, access.SystemWorkspaceTeamManager, access.TeamTeamMemberManager),

		// 团队项目操作
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/team/services", []string{"context", "query:team", "query:keyword", "query:page", "query:page_size", "query:sort", "query:asc", "query:status"}, []string{"services"}, p.serviceController.Search, access.SystemWorkspaceServiceViewAll, access.TeamTeamServiceView),
		pm3.CreateApiWidthDoc(http.MethodPost, "/api/v1/team/service", []string{"context", "query:team", "body"}, []string{"service"}, p.serviceController.Create, access.SystemWorkspaceServiceManagerAll, access.TeamTeamServiceManager),
		pm3.CreateApiWidthDoc(http.MethodPost, "/api/v1/team/app", []string{"context", "query:team", "body"}, []string{"app"}, p.appController.CreateApp, access.SystemWorkspaceApplicationManagerAll, access.TeamTeamConsumerManager),
		pm3.CreateApiWidthDoc(http.MethodDelete, "/api/v1/team/service", []string{"context", "query:service"}, nil, p.serviceController.Delete, access.SystemWorkspaceServiceManagerAll, access.TeamTeamServiceManager),
	}
}
