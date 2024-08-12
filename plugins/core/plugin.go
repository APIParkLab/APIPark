package core

import (
	"net/http"

	"github.com/eolinker/go-common/pm3"
)

func (p *plugin) PartitionPluginApi() []pm3.Api {
	return []pm3.Api{
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/apinto/plugin/:plugin", []string{"context", "query:partition", "rest:plugin"}, []string{"plugin", "render"}, p.pluginClusterController.Get),
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/apinto/plugins", []string{"context", "query:partition"}, []string{"plugins"}, p.pluginClusterController.List),
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/simple/apinto/plugins/project", []string{"context", "query:project"}, []string{"plugins"}, p.pluginClusterController.Option),
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/simple/apinto/plugin/:name", []string{"context", "rest:name"}, []string{"plugins"}, p.pluginClusterController.Info),
		pm3.CreateApiWidthDoc(http.MethodPut, "/api/v1/apinto/plugin/:plugin", []string{"context", "query:partition", "rest:plugin", "body"}, []string{}, p.pluginClusterController.Set),
	}
}
