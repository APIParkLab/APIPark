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
