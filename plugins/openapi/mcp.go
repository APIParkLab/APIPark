package openapi

import (
	"fmt"
	"net/http"
	"strings"

	mcp_server "github.com/APIParkLab/APIPark/mcp-server"
	"github.com/eolinker/go-common/ignore"
	"github.com/eolinker/go-common/pm3"
)

func (p *plugin) mcpAPIs() []pm3.Api {
	globalSSEPath := fmt.Sprintf("/openapi/v1/%s/sse", strings.Trim(mcp_server.GlobalBasePath, "/"))
	globalMessagePath := fmt.Sprintf("/openapi/v1/%s/message", strings.Trim(mcp_server.GlobalBasePath, "/"))

	appSSEPath := fmt.Sprintf("/openapi/v1/%s/:app/sse", strings.Trim(mcp_server.AppBasePath, "/"))
	appMessagePath := fmt.Sprintf("/openapi/v1/%s/:app/message", strings.Trim(mcp_server.AppBasePath, "/"))

	serviceSSEPath := fmt.Sprintf("/openapi/v1/%s/:serviceId/sse", strings.Trim(mcp_server.ServiceBasePath, "/"))
	serviceMessagePath := fmt.Sprintf("/openapi/v1/%s/:serviceId/message", strings.Trim(mcp_server.ServiceBasePath, "/"))
	serviceStreamablePath := fmt.Sprintf("/openapi/v1/%s/:serviceId/mcp", strings.Trim(mcp_server.ServiceBasePath, "/"))

	ignore.IgnorePath("openapi", http.MethodPost, globalMessagePath)
	ignore.IgnorePath("openapi", http.MethodGet, globalSSEPath)
	ignore.IgnorePath("openapi", http.MethodPost, appMessagePath)
	ignore.IgnorePath("openapi", http.MethodGet, appSSEPath)
	ignore.IgnorePath("openapi", http.MethodGet, serviceSSEPath)
	ignore.IgnorePath("openapi", http.MethodPost, serviceMessagePath)
	ignore.IgnorePath("openapi", http.MethodGet, serviceStreamablePath)
	ignore.IgnorePath("openapi", http.MethodPost, serviceStreamablePath)
	ignore.IgnorePath("openapi", http.MethodDelete, serviceStreamablePath)

	return []pm3.Api{
		pm3.CreateApiSimple(http.MethodGet, globalSSEPath, p.mcpController.GlobalHandleSSE),
		pm3.CreateApiSimple(http.MethodPost, globalMessagePath, p.mcpController.GlobalHandleMessage),

		pm3.CreateApiSimple(http.MethodGet, appSSEPath, p.mcpController.AppHandleSSE),
		pm3.CreateApiSimple(http.MethodPost, appMessagePath, p.mcpController.AppHandleMessage),

		pm3.CreateApiSimple(http.MethodGet, serviceSSEPath, p.mcpController.ServiceHandleSSE),
		pm3.CreateApiSimple(http.MethodPost, serviceMessagePath, p.mcpController.ServiceHandleMessage),

		pm3.CreateApiSimple(http.MethodPost, serviceStreamablePath, p.mcpController.ServiceHandleStreamHTTP),
		pm3.CreateApiSimple(http.MethodDelete, serviceStreamablePath, p.mcpController.ServiceHandleStreamHTTP),
		pm3.CreateApiSimple(http.MethodGet, serviceStreamablePath, p.mcpController.ServiceHandleStreamHTTP),
	}

}
