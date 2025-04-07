package openapi

import (
	"fmt"
	"net/http"

	"github.com/eolinker/go-common/ignore"

	mcp_server "github.com/APIParkLab/APIPark/mcp-server"
	"github.com/eolinker/go-common/pm3"
)

func (p *plugin) mcpAPIs() []pm3.Api {
	messagePath := fmt.Sprintf("%s/message", mcp_server.GlobalBasePath)
	ignore.IgnorePath("openapi", http.MethodPost, messagePath)
	return []pm3.Api{
		pm3.CreateApiSimple(http.MethodGet, fmt.Sprintf("%s/sse", mcp_server.GlobalBasePath), p.mcpController.GlobalMCPHandle),
		pm3.CreateApiSimple(http.MethodPost, messagePath, p.mcpController.GlobalMCPHandle),
	}
}
