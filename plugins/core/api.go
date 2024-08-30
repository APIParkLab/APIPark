package core

import (
	"net/http"

	"github.com/eolinker/go-common/pm3"
)

func (p *plugin) apiApis() []pm3.Api {
	return []pm3.Api{
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/service/apis", []string{"context", "query:keyword", "query:service"}, []string{"apis"}, p.apiController.Search),
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/service/api/detail", []string{"context", "query:service", "query:api"}, []string{"api"}, p.apiController.Detail),
		pm3.CreateApiWidthDoc(http.MethodPost, "/api/v1/service/api", []string{"context", "query:service", "body"}, []string{"api"}, p.apiController.Create),
		pm3.CreateApiWidthDoc(http.MethodPut, "/api/v1/service/api", []string{"context", "query:service", "query:api", "body"}, []string{"api"}, p.apiController.Edit),
		pm3.CreateApiWidthDoc(http.MethodDelete, "/api/v1/service/api", []string{"context", "query:service", "query:api"}, nil, p.apiController.Delete),
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/service/api/define", []string{"context", "query:service"}, []string{"prefix", "force"}, p.apiController.Prefix),

		pm3.CreateApiWidthDoc(http.MethodPut, "/api/v1/service/api_doc", []string{"context", "query:service", "body"}, []string{"doc"}, p.apiDocController.UpdateDoc),
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/service/api_doc", []string{"context", "query:service"}, []string{"doc"}, p.apiDocController.GetDoc),

		pm3.CreateApiWidthDoc(http.MethodPost, "/api/v1/service/api_doc/upload", []string{"context", "query:service"}, []string{"doc"}, p.apiDocController.UploadDoc),
	}
}
