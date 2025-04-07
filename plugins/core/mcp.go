package core

import (
	"fmt"
	"net/http"

	"github.com/eolinker/go-common/ignore"

	mcp_server "github.com/APIParkLab/APIPark/mcp-server"

	"github.com/eolinker/go-common/pm3"
)

func (p *plugin) mcpAPIs() []pm3.Api {
	serviceMCPPath := fmt.Sprintf("%s/:serviceId/:event", mcp_server.ServiceBasePath)
	ignore.IgnorePath("login", http.MethodGet, serviceMCPPath)
	ignore.IgnorePath("login", http.MethodPost, serviceMCPPath)
	return []pm3.Api{
		pm3.CreateApiSimple(http.MethodGet, serviceMCPPath, p.mcpController.MCPHandle),
		pm3.CreateApiSimple(http.MethodPost, serviceMCPPath, p.mcpController.MCPHandle),
	}
}
