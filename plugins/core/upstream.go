package core

import (
	"net/http"

	"github.com/eolinker/go-common/pm3"
)

func (p *plugin) upstreamApis() []pm3.Api {
	return []pm3.Api{
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/service/upstream", []string{"context", "query:service"}, []string{"upstream"}, p.upstreamController.Get),
		pm3.CreateApiWidthDoc(http.MethodPut, "/api/v1/service/upstream", []string{"context", "query:service", "body"}, []string{"upstream"}, p.upstreamController.Save),
	}
}
