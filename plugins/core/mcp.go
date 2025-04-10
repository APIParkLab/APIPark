package core

import (
	"fmt"
	"net/http"

	mcp_server "github.com/APIParkLab/APIPark/mcp-server"
	"github.com/eolinker/go-common/ignore"

	"github.com/eolinker/go-common/pm3"
)

func (p *plugin) mcpAPIs() []pm3.Api {
	serviceSSEPath := fmt.Sprintf("/api/v1/%s/:serviceId/sse", mcp_server.ServiceBasePath)
	serviceMessagePath := fmt.Sprintf("/api/v1/%s/:serviceId/message", mcp_server.ServiceBasePath)
	globalSSEPath := fmt.Sprintf("/api/v1/%s/sse", mcp_server.GlobalBasePath)
	globalMessagePath := fmt.Sprintf("/api/v1/%s/message", mcp_server.GlobalBasePath)
	ignore.IgnorePath("login", http.MethodGet, serviceSSEPath)
	ignore.IgnorePath("login", http.MethodPost, serviceMessagePath)
	ignore.IgnorePath("login", http.MethodGet, globalSSEPath)
	ignore.IgnorePath("login", http.MethodPost, globalMessagePath)
	return []pm3.Api{
		pm3.CreateApiSimple(http.MethodGet, serviceSSEPath, p.mcpController.MCPHandle),
		pm3.CreateApiSimple(http.MethodPost, serviceMessagePath, p.mcpController.MCPHandle),
		pm3.CreateApiSimple(http.MethodGet, globalSSEPath, p.mcpController.GlobalMCPHandle),
		pm3.CreateApiSimple(http.MethodPost, globalMessagePath, p.mcpController.GlobalMCPHandle),
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/global/mcp/config", []string{"context"}, []string{"config"}, p.mcpController.GlobalMCPConfig),
	}
}
