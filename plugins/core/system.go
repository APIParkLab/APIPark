package core

import (
	"net/http"

	"github.com/eolinker/go-common/pm3"
)

func (p *plugin) systemApis() []pm3.Api {
	return []pm3.Api{
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/system/_export", []string{"context"}, nil, p.exportConfigController.ExportAll),
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/system/_import", []string{"context"}, nil, p.importConfigController.ImportAll),

		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/system/general", []string{"context"}, []string{"general"}, p.settingController.Get),
		pm3.CreateApiWidthDoc(http.MethodPost, "/api/v1/system/general", []string{"context", "body"}, nil, p.settingController.Set),
	}
}

func (p *plugin) systemApikeyApis() []pm3.Api {
	return []pm3.Api{
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/system/apikey", []string{"context", "query:apikey"}, []string{"apikey"}, p.systemAPIKeyController.Get),
		pm3.CreateApiWidthDoc(http.MethodPost, "/api/v1/system/apikey", []string{"context", "body"}, nil, p.systemAPIKeyController.Create),
		pm3.CreateApiWidthDoc(http.MethodPut, "/api/v1/system/apikey", []string{"context", "query:apikey", "body"}, nil, p.systemAPIKeyController.Update),
		pm3.CreateApiWidthDoc(http.MethodDelete, "/api/v1/system/apikey", []string{"context", "query:apikey"}, nil, p.systemAPIKeyController.Delete),
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/system/apikeys", []string{"context", "query:keyword"}, []string{"apikeys"}, p.systemAPIKeyController.Search),
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/my/apikeys", []string{"context"}, []string{"apikeys"}, p.systemAPIKeyController.MyAPIKeys),
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/my/app/apikeys", []string{"context", "query:service", "query:app"}, []string{"apps"}, p.systemAPIKeyController.MyAPIKeysByService),
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/simple/system/apikeys", []string{"context"}, []string{"apikeys"}, p.systemAPIKeyController.SimpleList),
	}
}
