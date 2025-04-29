package core

import (
	"net/http"

	"github.com/eolinker/go-common/ignore"

	"github.com/APIParkLab/APIPark/resources/access"
	"github.com/eolinker/go-common/pm3"
)

func (p *plugin) ServiceApis() []pm3.Api {
	ignore.IgnorePath("login", http.MethodGet, "/api/v1/service/swagger/:id")
	ignore.IgnorePath("login", http.MethodGet, "/api/v1/service/apidoc/:id")
	return []pm3.Api{
		// 项目
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/service/info", []string{"context", "query:service"}, []string{"service"}, p.serviceController.Get, access.SystemWorkspaceServiceViewAll, access.TeamTeamServiceView),
		pm3.CreateApiWidthDoc(http.MethodPut, "/api/v1/service/info", []string{"context", "query:service", "body"}, []string{"service"}, p.serviceController.Edit, access.SystemWorkspaceServiceManagerAll, access.TeamTeamServiceManager),
		pm3.CreateApiWidthDoc(http.MethodDelete, "/api/v1/service/info", []string{"context", "query:service"}, nil, p.serviceController.Delete, access.SystemWorkspaceServiceManagerAll, access.TeamTeamServiceManager),
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/my_services", []string{"context", "query:team", "query:keyword"}, []string{"services"}, p.serviceController.SearchMyServices),
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/services", []string{"context", "query:team", "query:keyword"}, []string{"services"}, p.serviceController.Search, access.SystemWorkspaceServiceViewAll, access.TeamTeamServiceView),
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/simple/services", []string{"context"}, []string{"services"}, p.serviceController.Simple),
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/simple/services/mine", []string{"context"}, []string{"services"}, p.serviceController.MySimple),
		pm3.CreateApiWidthDoc(http.MethodPost, "/api/v1/quick/service/rest", []string{"context"}, []string{}, p.serviceController.QuickCreateRestfulService, access.SystemWorkspaceServiceManagerAll, access.TeamTeamServiceManager),
		pm3.CreateApiWidthDoc(http.MethodPost, "/api/v1/quick/service/ai", []string{"context", "body"}, []string{}, p.serviceController.QuickCreateAIService, access.SystemWorkspaceServiceManagerAll, access.TeamTeamServiceManager),

		// 应用相关
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/app/info", []string{"context", "query:app"}, []string{"app"}, p.appController.GetApp, access.SystemWorkspaceApplicationViewAll, access.TeamTeamConsumerView),
		pm3.CreateApiWidthDoc(http.MethodDelete, "/api/v1/app", []string{"context", "query:app"}, nil, p.appController.DeleteApp, access.SystemWorkspaceApplicationManagerAll, access.TeamTeamConsumerManager),
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/simple/apps", []string{"context", "query:keyword"}, []string{"apps"}, p.appController.SimpleApps),
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/simple/apps/mine", []string{"context", "query:keyword"}, []string{"apps"}, p.appController.MySimpleApps),
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/my_apps", []string{"context", "query:team", "query:keyword"}, []string{"apps"}, p.appController.SearchMyApps),
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/apps", []string{"context", "query:team", "query:keyword"}, []string{"apps"}, p.appController.Search, access.SystemWorkspaceApplicationViewAll),
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/apps/can_subscribe", []string{"context", "query:service"}, []string{"app"}, p.appController.SearchCanSubscribe),
		pm3.CreateApiWidthDoc(http.MethodPut, "/api/v1/app/info", []string{"context", "query:app", "body"}, []string{"app"}, p.appController.UpdateApp, access.SystemWorkspaceApplicationManagerAll, access.TeamTeamConsumerManager),

		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/service/doc", []string{"context", "query:service"}, []string{"doc"}, p.serviceController.ServiceDoc, access.SystemWorkspaceServiceViewAll, access.TeamServiceServiceIntroView),
		pm3.CreateApiWidthDoc(http.MethodPut, "/api/v1/service/doc", []string{"context", "query:service", "body"}, nil, p.serviceController.SaveServiceDoc, access.SystemWorkspaceServiceManagerAll, access.TeamServiceServiceIntroManager),
		pm3.CreateApiSimple(http.MethodGet, "/api/v1/service/swagger/:id", p.serviceController.Swagger),
		pm3.CreateApiSimple(http.MethodGet, "/api/v1/service/apidoc/:id", p.serviceController.Swagger),
		pm3.CreateApiSimple(http.MethodGet, "/api/v1/export/openapi/:id", p.serviceController.ExportSwagger),

		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/service/monitor/top10", []string{"context", "query:service", "query:start", "query:end"}, []string{"apis", "consumers"}, p.serviceController.Top10, access.SystemWorkspaceServiceViewAll, access.TeamTeamServiceView),
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/service/overview/monitor/ai", []string{"context", "query:service", "query:start", "query:end"}, []string{"overview"}, p.serviceController.AIChartOverview, access.SystemWorkspaceServiceViewAll, access.TeamTeamServiceView),
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/service/overview/monitor/rest", []string{"context", "query:service", "query:start", "query:end"}, []string{"overview"}, p.serviceController.RestChartOverview, access.SystemWorkspaceServiceViewAll, access.TeamTeamServiceView),
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/service/overview/basic", []string{"context", "query:service"}, []string{"overview"}, p.serviceController.ServiceOverview, access.SystemWorkspaceServiceViewAll, access.TeamTeamServiceView),
	}
}
