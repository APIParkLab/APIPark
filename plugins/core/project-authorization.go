package core

import (
	"net/http"

	"github.com/eolinker/go-common/pm3"
)

func (p *plugin) projectAuthorizationApis() []pm3.Api {
	return []pm3.Api{
		pm3.CreateApiWidthDoc(http.MethodPost, "/api/v1/app/authorization", []string{"context", "query:app", "body"}, []string{"authorization"}, p.appAuthorizationController.AddAuthorization),
		pm3.CreateApiWidthDoc(http.MethodPut, "/api/v1/app/authorization", []string{"context", "query:app", "query:authorization", "body"}, []string{"authorization"}, p.appAuthorizationController.EditAuthorization),
		pm3.CreateApiWidthDoc(http.MethodDelete, "/api/v1/app/authorization", []string{"context", "query:app", "query:authorization"}, nil, p.appAuthorizationController.DeleteAuthorization),
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/app/authorization", []string{"context", "query:app", "query:authorization"}, []string{"authorization"}, p.appAuthorizationController.Info),
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/app/authorizations", []string{"context", "query:app"}, []string{"authorizations"}, p.appAuthorizationController.Authorizations),
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/app/authorization/details", []string{"context", "query:app", "query:authorization"}, []string{"details"}, p.appAuthorizationController.Detail),
	}
}
