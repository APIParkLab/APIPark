package core

import (
	"net/http"

	"github.com/eolinker/go-common/pm3"
)

func (p *plugin) certificateApi() []pm3.Api {
	return []pm3.Api{
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/certificates", []string{"context"}, []string{"certificates"}, p.certificateController.ListForPartition),
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/certificate", []string{"context", "query:id"}, []string{"certificate", "cert"}, p.certificateController.Detail),
		pm3.CreateApiWidthDoc(http.MethodPost, "/api/v1/certificate", []string{"context", "body"}, nil, p.certificateController.Create),
		pm3.CreateApiWidthDoc(http.MethodPut, "/api/v1/certificate", []string{"context", "query:id", "body"}, nil, p.certificateController.Update),
		pm3.CreateApiWidthDoc(http.MethodDelete, "/api/v1/certificate", []string{"context", "query:id"}, []string{"id"}, p.certificateController.Delete),
	}
}
