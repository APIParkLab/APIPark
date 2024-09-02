package core

import (
	"github.com/eolinker/go-common/pm3"
	"net/http"
)

func (p *plugin) systemApis() []pm3.Api {
	return []pm3.Api{
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/system/_export", []string{"context"}, nil, p.exportConfigController.ExportAll),
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/system/_import", []string{"context"}, nil, p.importConfigController.ImportAll),
	}
}
