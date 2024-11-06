package core

import (
	"net/http"

	"github.com/APIParkLab/APIPark/resources/access"
	"github.com/eolinker/go-common/pm3"
)

func (p *plugin) catalogueApi() []pm3.Api {
	return []pm3.Api{
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/catalogues", []string{"context", "query:keyword"}, []string{"catalogues", "tags"}, p.catalogueController.Search, access.SystemSettingsGeneralView, access.SystemApiPortalApiPortalView),
		pm3.CreateApiWidthDoc(http.MethodPost, "/api/v1/catalogue", []string{"context", "body"}, nil, p.catalogueController.Create, access.SystemSettingsGeneralManager),
		pm3.CreateApiWidthDoc(http.MethodPut, "/api/v1/catalogue", []string{"context", "query:catalogue", "body"}, nil, p.catalogueController.Edit, access.SystemSettingsGeneralManager),
		pm3.CreateApiWidthDoc(http.MethodDelete, "/api/v1/catalogue", []string{"context", "query:catalogue"}, nil, p.catalogueController.Delete, access.SystemSettingsGeneralManager),
		pm3.CreateApiWidthDoc(http.MethodPut, "/api/v1/catalogue/sort", []string{"context", "body"}, nil, p.catalogueController.Sort, access.SystemSettingsGeneralManager),
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/catalogue/services", []string{"context", "query:keyword"}, []string{"services"}, p.catalogueController.Services, access.SystemApiPortalApiPortalView),
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/catalogue/service", []string{"context", "query:service"}, []string{"service"}, p.catalogueController.ServiceDetail, access.SystemApiPortalApiPortalView),
		pm3.CreateApiWidthDoc(http.MethodPost, "/api/v1/catalogue/service/subscribe", []string{"context", "body"}, nil, p.catalogueController.Subscribe),
	}
}
