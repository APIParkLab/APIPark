package core

import (
	"net/http"
	
	"github.com/eolinker/go-common/pm3"
)

func (p *plugin) DynamicModuleApis() []pm3.Api {
	return []pm3.Api{
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/dynamic/:name/info", []string{"context", "rest:name", "query:id"}, []string{"info"}, p.dynamicModuleController.Get),
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/dynamic/:name/list", []string{"context", "rest:name", "query:keyword", "query:partitions", "query:page", "query:pageSize"}, []string{"list", "basic", "total"}, p.dynamicModuleController.List),
		pm3.CreateApiWidthDoc(http.MethodPost, "/api/v1/dynamic/:name", []string{"context", "rest:name", "body"}, []string{"info"}, p.dynamicModuleController.Create),
		pm3.CreateApiWidthDoc(http.MethodPut, "/api/v1/dynamic/:name/config", []string{"context", "rest:name", "query:id", "body"}, []string{"info"}, p.dynamicModuleController.Edit),
		pm3.CreateApiWidthDoc(http.MethodDelete, "/api/v1/dynamic/:name/batch", []string{"context", "rest:name", "query:ids"}, nil, p.dynamicModuleController.Delete),
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/dynamic/:name/render", []string{"context", "rest:name"}, []string{"basic", "render"}, p.dynamicModuleController.Render),
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/simple/dynamics/:group", []string{"context", "rest:group"}, []string{"dynamics"}, p.dynamicModuleController.ModuleDrivers),
		pm3.CreateApiWidthDoc(http.MethodPut, "/api/v1/dynamic/:name/online", []string{"context", "rest:name", "query:id"}, nil, p.dynamicModuleController.Online),
		pm3.CreateApiWidthDoc(http.MethodPut, "/api/v1/dynamic/:name/offline", []string{"context", "rest:name", "query:id"}, nil, p.dynamicModuleController.Offline),
	}
}
