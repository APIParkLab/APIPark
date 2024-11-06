package core

import (
	"net/http"

	"github.com/APIParkLab/APIPark/resources/access"
	"github.com/eolinker/go-common/pm3"
)

func (p *plugin) certificateApi() []pm3.Api {
	return []pm3.Api{
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/certificates", []string{"context"}, []string{"certificates"}, p.certificateController.ListForPartition, access.SystemSettingsSslCertificateView),
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/certificate", []string{"context", "query:id"}, []string{"certificate", "cert"}, p.certificateController.Detail, access.SystemSettingsSslCertificateView),
		pm3.CreateApiWidthDoc(http.MethodPost, "/api/v1/certificate", []string{"context", "body"}, nil, p.certificateController.Create, access.SystemSettingsSslCertificateManager),
		pm3.CreateApiWidthDoc(http.MethodPut, "/api/v1/certificate", []string{"context", "query:id", "body"}, nil, p.certificateController.Update, access.SystemSettingsSslCertificateManager),
		pm3.CreateApiWidthDoc(http.MethodDelete, "/api/v1/certificate", []string{"context", "query:id"}, []string{"id"}, p.certificateController.Delete, access.SystemSettingsSslCertificateManager),
	}
}
