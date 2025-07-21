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
	appSSEPath := fmt.Sprintf("/api/v1/%s/sse", mcp_server.AppBasePath)
	appMessagePath := fmt.Sprintf("/api/v1/%s/message", mcp_server.AppBasePath)
	ignore.IgnorePath("login", http.MethodGet, serviceSSEPath)
	ignore.IgnorePath("login", http.MethodPost, serviceMessagePath)
	ignore.IgnorePath("login", http.MethodGet, globalSSEPath)
	ignore.IgnorePath("login", http.MethodPost, globalMessagePath)
	ignore.IgnorePath("login", http.MethodGet, appSSEPath)
	ignore.IgnorePath("login", http.MethodPost, appMessagePath)
	return []pm3.Api{
		pm3.CreateApiSimple(http.MethodGet, serviceSSEPath, p.mcpController.MCPHandle),
		pm3.CreateApiSimple(http.MethodPost, serviceMessagePath, p.mcpController.MCPHandle),
		pm3.CreateApiSimple(http.MethodGet, globalSSEPath, p.mcpController.GlobalMCPHandle),
		pm3.CreateApiSimple(http.MethodPost, globalMessagePath, p.mcpController.GlobalMCPHandle),
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/global/mcp/config", []string{"context"}, []string{"config"}, p.mcpController.GlobalMCPConfig),
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/app/mcp/config", []string{"context", "query:app"}, []string{"config"}, p.mcpController.AppMCPConfig),
		pm3.CreateApiSimple(http.MethodGet, fmt.Sprintf("/api/v1/%s/:app/sse", mcp_server.AppBasePath), p.mcpController.AppMCPHandle),
		pm3.CreateApiSimple(http.MethodPost, fmt.Sprintf("/api/v1/%s/:app/message", mcp_server.AppBasePath), p.mcpController.AppMCPHandle),
	}
}
