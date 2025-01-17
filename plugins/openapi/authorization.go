package openapi

import (
	"net/http"

	"github.com/eolinker/go-common/pm3"
)

func (p *plugin) appAuthorizationApis() []pm3.Api {
	return []pm3.Api{
		pm3.CreateApiWidthDoc(http.MethodPost, "/openapi/v1/app/authorization", []string{"context", "query:app", "body"}, []string{"authorization"}, p.authorizationController.AddAuthorization),
		pm3.CreateApiWidthDoc(http.MethodPut, "/openapi/v1/app/authorization", []string{"context", "query:app", "query:authorization", "body"}, []string{"authorization"}, p.authorizationController.EditAuthorization),
		pm3.CreateApiWidthDoc(http.MethodDelete, "/openapi/v1/app/authorization", []string{"context", "query:app", "query:authorization"}, nil, p.authorizationController.DeleteAuthorization),
		pm3.CreateApiWidthDoc(http.MethodGet, "/openapi/v1/app/authorization", []string{"context", "query:app", "query:authorization"}, []string{"authorization"}, p.authorizationController.Info),
		pm3.CreateApiWidthDoc(http.MethodGet, "/openapi/v1/app/authorizations", []string{"context", "query:app"}, []string{"authorizations"}, p.authorizationController.Authorizations),
		pm3.CreateApiWidthDoc(http.MethodGet, "/openapi/v1/app/authorization/details", []string{"context", "query:app", "query:authorization"}, []string{"details"}, p.authorizationController.Detail),
	}
}
