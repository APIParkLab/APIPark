package mcp

import (
	"fmt"
	"net/http"
	"strings"
	"sync"

	mcp_server "github.com/APIParkLab/APIPark/mcp-server"
	"github.com/APIParkLab/APIPark/module/mcp"
	"github.com/APIParkLab/APIPark/module/system"
	"github.com/eolinker/go-common/utils"
	"github.com/gin-gonic/gin"
	mcp2 "github.com/mark3labs/mcp-go/mcp"
	"github.com/mark3labs/mcp-go/server"
)

var _ IMcpController = (*imlMcpController)(nil)

type imlMcpController struct {
	settingModule system.ISettingModule `autowired:""`
	mcpModule     mcp.IMcpModule        `autowired:""`
	sessionKeys   sync.Map
	server        http.Handler
	openServer    http.Handler
}

var mcpDefaultConfig = `{
  "mcpServers": {
    "%s": {
      "url": "%s"
    }
  }
}
`

func (i *imlMcpController) GlobalMCPConfig(ctx *gin.Context) (string, error) {
	cfg := i.settingModule.Get(ctx)
	if cfg.SitePrefix == "" {
		return "", fmt.Errorf("site prefix is empty")
	}
	return fmt.Sprintf(mcpDefaultConfig, "APIPark-MCP-Server", fmt.Sprintf("%s/openapi/v1/%s/sse?apikey={your_api_key}", strings.TrimSuffix(cfg.SitePrefix, "/"), mcp_server.GlobalBasePath)), nil
}

func (i *imlMcpController) OnComplete() {
	s := server.NewMCPServer("APIPark MCP Server", "1.0.0", server.WithLogging())
	s.AddTool(
		mcp2.NewTool(
			"apipark_service_list",
			mcp2.WithDescription("This tool is a standardized interface provided by the Apipark platform under the MCP (Model Context Protocol) framework, designed to retrieve metadata for all registered services in bulk. By invoking this tool, users can efficiently explore the complete list of published services and their core attributes, serving as a prerequisite for subsequent actions such as querying detailed API lists via service IDs, requesting access permissions, or integrating services."),
			mcp2.WithString("keyword", mcp2.Description("Keyword for fuzzy search")),
		),
		i.mcpModule.Services,
	)
	s.AddTool(
		mcp2.NewTool(
			"apipark_service_api_list",
			mcp2.WithDescription("This tool is a standardized MCP (Model Context Protocol) interface provided by the Apipark platform, designed to retrieve OpenAPI specification documents for all APIs under a specified service using its service ID. By invoking this tool, users gain precise access to detailed API definitions (including endpoints, parameters, request/response schemas) for debugging, integration, or client SDK generation."),
			mcp2.WithString("service", mcp2.Description("Service ID")),
		),
		i.mcpModule.APIs,
	)
	s.AddTool(
		mcp2.NewTool(
			"apipark_invoke_api",
			mcp2.WithDescription("This tool is a core MCP (Model Context Protocol) interface provided by the Apipark platform, enabling users to programmatically invoke APIs using metadata from apipark_service_api_list (API schemas). It acts as a unified gateway for executing API requests with built-in authentication, parameter validation, and error handling, returning structured responses for integration workflows."),
			mcp2.WithString("path", mcp2.Description("API path"), mcp2.Required()),
			mcp2.WithString("method", mcp2.Description("API method"), mcp2.Required()),
			mcp2.WithString("content-type", mcp2.Description("API Request Content-Type. If method is POST,PUT,PATCH, it must be set. If not set, it will be ignored.")),
			mcp2.WithObject("query", mcp2.Description("API Request query,param type is map[string]string")),
			mcp2.WithObject("header", mcp2.Description("API Request header,param type is map[string]string")),
			mcp2.WithString("body", mcp2.Description("API Request body")),
		),
		i.mcpModule.Invoke,
	)
	i.server = server.NewSSEServer(s, server.WithBasePath(fmt.Sprintf("/api/v1/%s", mcp_server.GlobalBasePath)))
	i.openServer = server.NewSSEServer(s, server.WithBasePath(fmt.Sprintf("/openapi/v1/%s", strings.Trim(mcp_server.GlobalBasePath, "/"))))
}

func (i *imlMcpController) GlobalMCPHandle(ctx *gin.Context) {
	cfg := i.settingModule.Get(ctx)
	req := ctx.Request.WithContext(utils.SetGatewayInvoke(ctx.Request.Context(), cfg.InvokeAddress))

	i.server.ServeHTTP(ctx.Writer, req)
}

func (i *imlMcpController) GlobalHandleSSE(ctx *gin.Context) {
	i.handleSSE(ctx, i.openServer)
}

func (i *imlMcpController) handleSSE(ctx *gin.Context, server http.Handler) {
	apikey := ctx.Request.URL.Query().Get("apikey")
	writer := &ResponseWriter{
		Writer:    ctx.Writer,
		sessionId: make(chan string),
	}
	defer close(writer.sessionId)
	sessionId := ""
	go func() {
		var ok bool
		sessionId, ok = <-writer.sessionId
		if !ok {
			return
		}
		i.sessionKeys.Store(sessionId, apikey)
	}()
	server.ServeHTTP(writer, ctx.Request)
	i.sessionKeys.Delete(sessionId)
}

func (i *imlMcpController) GlobalHandleMessage(ctx *gin.Context) {
	i.handleMessage(ctx, i.openServer)
}

func (i *imlMcpController) MCPHandle(ctx *gin.Context) {
	cfg := i.settingModule.Get(ctx)

	req := ctx.Request.WithContext(utils.SetGatewayInvoke(ctx.Request.Context(), cfg.InvokeAddress))
	mcp_server.ServeHTTP(ctx.Writer, req)
}

func (i *imlMcpController) ServiceHandleSSE(ctx *gin.Context) {
	i.handleSSE(ctx, mcp_server.DefaultMCPServer())
}

func (i *imlMcpController) ServiceHandleMessage(ctx *gin.Context) {
	i.handleMessage(ctx, mcp_server.DefaultMCPServer())
}

func (i *imlMcpController) handleMessage(ctx *gin.Context, server http.Handler) {
	sessionId := ctx.Request.URL.Query().Get("sessionId")
	apikey, ok := i.sessionKeys.Load(sessionId)
	if !ok {
		ctx.String(403, "sessionId not found")
		return
	}
	cfg := i.settingModule.Get(ctx)
	req := ctx.Request.WithContext(utils.SetGatewayInvoke(ctx.Request.Context(), cfg.InvokeAddress))
	req = req.WithContext(utils.SetLabel(req.Context(), "apikey", apikey.(string)))
	server.ServeHTTP(ctx.Writer, req)
}
