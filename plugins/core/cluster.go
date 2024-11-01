package core

import (
	"net/http"

	"github.com/APIParkLab/APIPark/resources/access"
	"github.com/eolinker/go-common/pm3"
)

func (p *plugin) clusterApi() []pm3.Api {
	return []pm3.Api{
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/cluster/nodes", []string{"context", "query:partition"}, []string{"nodes"}, p.clusterController.Nodes, access.SystemSettingsApiGatewayView),
		pm3.CreateApiWidthDoc(http.MethodPut, "/api/v1/cluster/reset", []string{"context", "query:partition", "body"}, []string{"nodes"}, p.clusterController.ResetCluster, access.SystemSettingsApiGatewayManager),
		pm3.CreateApiWidthDoc(http.MethodPost, "/api/v1/cluster/check", []string{"context", "body"}, []string{"nodes"}, p.clusterController.Check, access.SystemSettingsApiGatewayManager),
	}
}
