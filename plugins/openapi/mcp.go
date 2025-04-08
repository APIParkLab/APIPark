package openapi

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/eolinker/go-common/ignore"

	mcp_server "github.com/APIParkLab/APIPark/mcp-server"
	"github.com/eolinker/go-common/pm3"
)

func (p *plugin) mcpAPIs() []pm3.Api {
	globalMessagePath := fmt.Sprintf("/openapi/v1/%s/message", strings.Trim(mcp_server.GlobalBasePath, "/"))
	serviceMessagePath := fmt.Sprintf("/openapi/v1/%s/:serviceId/message", strings.Trim(mcp_server.ServiceBasePath, "/"))
	ignore.IgnorePath("openapi", http.MethodPost, globalMessagePath)
	ignore.IgnorePath("openapi", http.MethodPost, serviceMessagePath)
	return []pm3.Api{
		pm3.CreateApiSimple(http.MethodGet, fmt.Sprintf("/openapi/v1/%s/sse", strings.Trim(mcp_server.GlobalBasePath, "/")), p.mcpController.GlobalHandleSSE),
		pm3.CreateApiSimple(http.MethodPost, globalMessagePath, p.mcpController.GlobalHandleMessage),
		pm3.CreateApiSimple(http.MethodGet, fmt.Sprintf("/openapi/v1/%s/:serviceId/sse", strings.Trim(mcp_server.ServiceBasePath, "/")), p.mcpController.ServiceHandleSSE),
		pm3.CreateApiSimple(http.MethodPost, serviceMessagePath, p.mcpController.ServiceHandleMessage),
	}
}
