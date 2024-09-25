package core

import (
	"net/http"

	"github.com/eolinker/go-common/pm3"
)

func (p *plugin) apiApis() []pm3.Api {
	return []pm3.Api{
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/service/routers", []string{"context", "query:keyword", "query:service"}, []string{"routers"}, p.routerController.Search),
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/service/router/detail", []string{"context", "query:service", "query:router"}, []string{"router"}, p.routerController.Detail),
		pm3.CreateApiWidthDoc(http.MethodPost, "/api/v1/service/router", []string{"context", "query:service", "body"}, []string{"router"}, p.routerController.Create),
		pm3.CreateApiWidthDoc(http.MethodPut, "/api/v1/service/router", []string{"context", "query:service", "query:router", "body"}, []string{"router"}, p.routerController.Edit),
		pm3.CreateApiWidthDoc(http.MethodDelete, "/api/v1/service/router", []string{"context", "query:service", "query:router"}, nil, p.routerController.Delete),
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/service/router/define", []string{"context", "query:service"}, []string{"prefix", "force"}, p.routerController.Prefix),

		pm3.CreateApiWidthDoc(http.MethodPut, "/api/v1/service/api_doc", []string{"context", "query:service", "body"}, []string{"doc"}, p.apiDocController.UpdateDoc),
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/service/api_doc", []string{"context", "query:service"}, []string{"doc"}, p.apiDocController.GetDoc),

		pm3.CreateApiWidthDoc(http.MethodPost, "/api/v1/service/api_doc/upload", []string{"context", "query:service"}, []string{"doc"}, p.apiDocController.UploadDoc),

		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/service/ai-router", []string{"context", "query:service", "query:router"}, []string{"api"}, p.aiAPIController.Get),
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/service/ai-routers", []string{"context", "query:keyword", "query:service"}, []string{"apis"}, p.aiAPIController.List),
		pm3.CreateApiWidthDoc(http.MethodPut, "/api/v1/service/ai-router", []string{"context", "query:service", "query:router", "body"}, []string{"api"}, p.aiAPIController.Edit),
		pm3.CreateApiWidthDoc(http.MethodPost, "/api/v1/service/ai-router", []string{"context", "query:service", "body"}, []string{"api"}, p.aiAPIController.Create),
		pm3.CreateApiWidthDoc(http.MethodDelete, "/api/v1/service/ai-router", []string{"context", "query:service", "query:router"}, nil, p.aiAPIController.Delete),
	}
}
