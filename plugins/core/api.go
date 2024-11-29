package core

import (
	"net/http"

	"github.com/APIParkLab/APIPark/resources/access"
	"github.com/eolinker/go-common/pm3"
)

func (p *plugin) apiApis() []pm3.Api {
	return []pm3.Api{
		pm3.CreateApiWidthDoc(http.MethodPost, "/api/v1/simple/service/apis", []string{"context", "body"}, []string{"apis"}, p.routerController.Simple),
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/service/routers", []string{"context", "query:keyword", "query:service"}, []string{"routers"}, p.routerController.Search, access.SystemWorkspaceServiceViewAll, access.TeamServiceApiView),
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/service/router/detail", []string{"context", "query:service", "query:router"}, []string{"router"}, p.routerController.Detail, access.SystemWorkspaceServiceViewAll, access.TeamServiceApiView),
		pm3.CreateApiWidthDoc(http.MethodPost, "/api/v1/service/router", []string{"context", "query:service", "body"}, []string{"router"}, p.routerController.Create, access.SystemWorkspaceServiceManagerAll, access.TeamServiceApiManager),
		pm3.CreateApiWidthDoc(http.MethodPut, "/api/v1/service/router", []string{"context", "query:service", "query:router", "body"}, []string{"router"}, p.routerController.Edit, access.SystemWorkspaceServiceManagerAll, access.TeamServiceApiManager),
		pm3.CreateApiWidthDoc(http.MethodDelete, "/api/v1/service/router", []string{"context", "query:service", "query:router"}, nil, p.routerController.Delete, access.SystemWorkspaceServiceManagerAll, access.TeamServiceApiManager),
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/service/router/define", []string{"context", "query:service"}, []string{"prefix", "force"}, p.routerController.Prefix),

		pm3.CreateApiWidthDoc(http.MethodPut, "/api/v1/service/api_doc", []string{"context", "query:service", "body"}, []string{"doc"}, p.apiDocController.UpdateDoc, access.SystemWorkspaceServiceManagerAll, access.TeamServiceApiDocManager),
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/service/api_doc", []string{"context", "query:service"}, []string{"doc"}, p.apiDocController.GetDoc, access.SystemWorkspaceServiceViewAll, access.TeamServiceApiDocView),

		pm3.CreateApiWidthDoc(http.MethodPost, "/api/v1/service/api_doc/upload", []string{"context", "query:service"}, []string{"doc"}, p.apiDocController.UploadDoc, access.SystemWorkspaceServiceManagerAll, access.TeamServiceApiDocManager),

		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/service/ai-router", []string{"context", "query:service", "query:router"}, []string{"api"}, p.aiAPIController.Get, access.SystemWorkspaceServiceViewAll, access.TeamServiceApiView),
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/service/ai-routers", []string{"context", "query:keyword", "query:service"}, []string{"apis"}, p.aiAPIController.List, access.SystemWorkspaceServiceViewAll, access.TeamServiceApiView),
		pm3.CreateApiWidthDoc(http.MethodPut, "/api/v1/service/ai-router", []string{"context", "query:service", "query:router", "body"}, []string{"api"}, p.aiAPIController.Edit, access.SystemWorkspaceServiceManagerAll, access.TeamServiceApiManager),
		pm3.CreateApiWidthDoc(http.MethodPost, "/api/v1/service/ai-router", []string{"context", "query:service", "body"}, []string{"api"}, p.aiAPIController.Create, access.SystemWorkspaceServiceManagerAll, access.TeamServiceApiManager),
		pm3.CreateApiWidthDoc(http.MethodDelete, "/api/v1/service/ai-router", []string{"context", "query:service", "query:router"}, nil, p.aiAPIController.Delete, access.SystemWorkspaceServiceManagerAll, access.TeamServiceApiManager),
	}
}
