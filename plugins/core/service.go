package core

import (
	"net/http"

	"github.com/eolinker/go-common/pm3"
)

func (p *plugin) ServiceApis() []pm3.Api {
	return []pm3.Api{
		// 项目
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/service/info", []string{"context", "query:service"}, []string{"service"}, p.serviceController.Get),
		pm3.CreateApiWidthDoc(http.MethodPut, "/api/v1/service/info", []string{"context", "query:service", "body"}, []string{"service"}, p.serviceController.Edit),
		pm3.CreateApiWidthDoc(http.MethodDelete, "/api/v1/service/info", []string{"context", "query:service"}, nil, p.serviceController.Delete),
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/my_services", []string{"context", "query:team", "query:keyword"}, []string{"services"}, p.serviceController.SearchMyServices),
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/services", []string{"context", "query:team", "query:keyword"}, []string{"services"}, p.serviceController.Search),

		//pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/simple/services/mine", []string{"context", "query:keyword"}, []string{"services"}, p.serviceController.MySimple),
		//
		//pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/simple/services", []string{"context", "query:keyword"}, []string{"services"}, p.serviceController.Simple),

		// AI服务
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/ai-services", []string{"context", "query:service", "query:keyword"}, []string{"service"}, p.serviceController.SearchAIServices),
		pm3.CreateApiWidthDoc(http.MethodPost, "/api/v1/team/ai-service", []string{"context", "query:team", "body"}, []string{"service"}, p.serviceController.CreateAIService),
		pm3.CreateApiWidthDoc(http.MethodPut, "/api/v1/ai-service/info", []string{"context", "query:service", "body"}, []string{"service"}, p.serviceController.Edit),
		pm3.CreateApiWidthDoc(http.MethodDelete, "/api/v1/ai-service", []string{"context", "query:service"}, nil, p.serviceController.DeleteAIService),
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/my_ai_services", []string{"context", "query:team", "query:keyword"}, []string{"services"}, p.serviceController.SearchMyAIServices),
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/ai-service/info", []string{"context", "query:service"}, []string{"services"}, p.serviceController.Get),

		// 应用相关
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/app/info", []string{"context", "query:app"}, []string{"app"}, p.appController.GetApp),
		pm3.CreateApiWidthDoc(http.MethodDelete, "/api/v1/app", []string{"context", "query:app"}, nil, p.appController.DeleteApp),
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/simple/apps", []string{"context", "query:keyword"}, []string{"apps"}, p.appController.SimpleApps),
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/simple/apps/mine", []string{"context", "query:keyword"}, []string{"apps"}, p.appController.MySimpleApps),
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/my_apps", []string{"context", "query:team", "query:keyword"}, []string{"apps"}, p.appController.SearchMyApps),
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/apps", []string{"context", "query:team", "query:keyword"}, []string{"apps"}, p.appController.Search),
		pm3.CreateApiWidthDoc(http.MethodPut, "/api/v1/app/info", []string{"context", "query:app", "body"}, []string{"app"}, p.appController.UpdateApp),

		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/service/doc", []string{"context", "query:service"}, []string{"doc"}, p.serviceController.ServiceDoc),
		pm3.CreateApiWidthDoc(http.MethodPut, "/api/v1/service/doc", []string{"context", "query:service", "body"}, nil, p.serviceController.SaveServiceDoc),
	}
}
