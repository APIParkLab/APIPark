package core

import (
	"net/http"

	"github.com/eolinker/go-common/pm3"
)

func (p *plugin) releaseApis() []pm3.Api {
	return []pm3.Api{

		pm3.CreateApiWidthDoc(http.MethodPost, "/api/v1/service/release", []string{"context", "query:service", "body"}, []string{}, p.releaseController.Create),
		pm3.CreateApiWidthDoc(http.MethodDelete, "/api/v1/service/release", []string{"context", "query:service", "query:id"}, []string{}, p.releaseController.Delete),
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/service/release", []string{"context", "query:service", "query:id"}, []string{"release"}, p.releaseController.Detail),
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/service/releases", []string{"context", "query:service"}, []string{"releases"}, p.releaseController.List),
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/service/release/preview", []string{"context", "query:service"}, []string{"running", "diff", "complete"}, p.releaseController.Preview),
	}
}
