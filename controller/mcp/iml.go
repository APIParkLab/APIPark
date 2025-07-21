package mcp

import (
	"fmt"
	"net/http"
	"strings"
	"sync"

	"github.com/APIParkLab/APIPark/module/service"

	application_authorization "github.com/APIParkLab/APIPark/module/application-authorization"

	mcp_server "github.com/APIParkLab/APIPark/mcp-server"
	"github.com/APIParkLab/APIPark/module/mcp"
	"github.com/APIParkLab/APIPark/module/system"
	"github.com/eolinker/go-common/utils"
	"github.com/gin-gonic/gin"
	"github.com/mark3labs/mcp-go/server"
)

var _ IMcpController = (*imlMcpController)(nil)

type imlMcpController struct {
	settingModule       system.ISettingModule                          `autowired:""`
	authorizationModule application_authorization.IAuthorizationModule `autowired:""`
	appModule           service.IAppModule                             `autowired:""`
	mcpModule           mcp.IMcpModule                                 `autowired:""`
	sessionKeys         sync.Map
	server              map[string]http.Handler
	openServer          http.Handler
}

func (i *imlMcpController) AppMCPHandle(ctx *gin.Context) {
	appId := ctx.Param("app")
	if appId == "" {
		ctx.AbortWithStatusJSON(403, gin.H{"code": -1, "msg": "invalid app id", "success": "fail"})
		return
	}
	cfg := i.settingModule.Get(ctx)
	req := ctx.Request.WithContext(utils.SetGatewayInvoke(ctx.Request.Context(), cfg.InvokeAddress))
	req = req.WithContext(utils.SetLabel(req.Context(), "app", appId))
	paths := strings.Split(req.URL.Path, "/")
	req.URL.Path = fmt.Sprintf("/api/v1/%s/%s", mcp_server.GlobalBasePath, paths[len(paths)-1])
	locale := utils.I18n(ctx)
	if v, ok := i.server[locale]; ok {
		v.ServeHTTP(ctx.Writer, req)
		return
	}

	i.server[languageEnUs].ServeHTTP(ctx.Writer, req)
}

func (i *imlMcpController) AppHandleSSE(ctx *gin.Context) {
	apikey := ctx.Request.URL.Query().Get("apikey")
	appId := ctx.Param("app")
	if appId == "" {
		ctx.AbortWithStatusJSON(403, gin.H{"code": -1, "msg": "invalid app id", "success": "fail"})
		return
	}
	ok, err := i.authorizationModule.CheckAPIKeyAuthorizationByApp(ctx, appId, apikey)
	if err != nil {
		ctx.AbortWithStatusJSON(403, gin.H{"code": -1, "msg": err.Error(), "success": "fail"})
		return
	}
	if !ok {
		ctx.AbortWithStatusJSON(403, gin.H{"code": -1, "msg": "invalid apikey", "success": "fail"})
		return
	}

	ctx.Request.URL.Path = fmt.Sprintf("/openapi/v1/%s/sse", mcp_server.GlobalBasePath)
	i.handleSSE(ctx, i.openServer, SessionInfo{
		Apikey: apikey,
		App:    appId,
	})
}

func (i *imlMcpController) AppHandleMessage(ctx *gin.Context) {
	appId := ctx.Param("app")
	if appId == "" {
		ctx.AbortWithStatusJSON(403, gin.H{"code": -1, "msg": "invalid app id", "success": "fail"})
		return
	}
	ctx.Request.URL.Path = fmt.Sprintf("/openapi/v1/%s/message", mcp_server.GlobalBasePath)
	ctx.Request = ctx.Request.WithContext(utils.SetLabel(ctx.Request.Context(), "app", appId))
	i.handleMessage(ctx, i.openServer)
}

func (i *imlMcpController) AppMCPConfig(ctx *gin.Context, appId string) (string, error) {
	cfg := i.settingModule.Get(ctx)
	if cfg.SitePrefix == "" {
		return "", fmt.Errorf("site prefix is empty")
	}
	appInfo, err := i.appModule.GetApp(ctx, appId)
	if err != nil {
		return "", fmt.Errorf("get app info error: %v", err)
	}
	return fmt.Sprintf(mcpDefaultConfig, appInfo.Name, fmt.Sprintf("%s/openapi/v1/mcp/app/%s/sse?apikey={your_api_key}", strings.TrimSuffix(cfg.SitePrefix, "/"), appId)), nil
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
	i.server = make(map[string]http.Handler)
	for language, tools := range mcpToolsByLanguage {
		s := server.NewMCPServer("APIPark MCP Server", "1.0.0", server.WithLogging())
		s.AddTool(tools[ToolServiceList], i.mcpModule.Services)
		s.AddTool(tools[ToolOpenAPIDocument], i.mcpModule.APIs)
		s.AddTool(tools[ToolInvokeAPI], i.mcpModule.Invoke)
		i.server[language] = server.NewSSEServer(s, server.WithStaticBasePath(fmt.Sprintf("/api/v1/%s", mcp_server.GlobalBasePath)))
		if language == languageEnUs {
			i.openServer = server.NewSSEServer(s, server.WithStaticBasePath(fmt.Sprintf("/openapi/v1/%s", strings.Trim(mcp_server.GlobalBasePath, "/"))))
		}
	}
}

func (i *imlMcpController) GlobalMCPHandle(ctx *gin.Context) {
	cfg := i.settingModule.Get(ctx)
	req := ctx.Request.WithContext(utils.SetGatewayInvoke(ctx.Request.Context(), cfg.InvokeAddress))
	locale := utils.I18n(ctx)
	if v, ok := i.server[locale]; ok {
		v.ServeHTTP(ctx.Writer, req)
		return
	}
	i.server[languageEnUs].ServeHTTP(ctx.Writer, req)
}

func (i *imlMcpController) GlobalHandleSSE(ctx *gin.Context) {
	apikey := ctx.Request.URL.Query().Get("apikey")
	i.handleSSE(ctx, i.openServer, SessionInfo{
		Apikey: apikey,
	})
}

func (i *imlMcpController) handleSSE(ctx *gin.Context, server http.Handler, sIn SessionInfo) {

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
		i.sessionKeys.Store(sessionId, sIn)
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
	apikey := ctx.Request.URL.Query().Get("apikey")
	serviceId := ctx.Param("serviceId")
	if serviceId == "" {
		ctx.AbortWithStatusJSON(403, gin.H{"code": -1, "msg": "invalid service id", "success": "fail"})
		return
	}
	ok, err := i.authorizationModule.CheckAPIKeyAuthorizationByService(ctx, serviceId, apikey)
	if err != nil {
		ctx.AbortWithStatusJSON(403, gin.H{"code": -1, "msg": err.Error(), "success": "fail"})
		return
	}
	if !ok {
		ctx.AbortWithStatusJSON(403, gin.H{"code": -1, "msg": "invalid apikey", "success": "fail"})
		return
	}

	i.handleSSE(ctx, mcp_server.DefaultMCPServer(), SessionInfo{
		Apikey: apikey,
	})
}

func (i *imlMcpController) ServiceHandleMessage(ctx *gin.Context) {
	i.handleMessage(ctx, mcp_server.DefaultMCPServer())
}

func (i *imlMcpController) ServiceHandleStreamHTTP(ctx *gin.Context) {
	apikey := ctx.Request.URL.Query().Get("apikey")
	serviceId := ctx.Param("serviceId")
	if serviceId == "" {
		ctx.AbortWithStatusJSON(403, gin.H{"code": -1, "msg": "invalid service id", "success": "fail"})
		return
	}
	ok, err := i.authorizationModule.CheckAPIKeyAuthorizationByService(ctx, serviceId, apikey)
	if err != nil {
		ctx.AbortWithStatusJSON(403, gin.H{"code": -1, "msg": err.Error(), "success": "fail"})
		return
	}
	if !ok {
		ctx.AbortWithStatusJSON(403, gin.H{"code": -1, "msg": "invalid apikey", "success": "fail"})
		return
	}
	cfg := i.settingModule.Get(ctx)
	req := ctx.Request.WithContext(utils.SetGatewayInvoke(ctx.Request.Context(), cfg.InvokeAddress))
	req = req.WithContext(utils.SetLabel(req.Context(), "apikey", apikey))
	mcp_server.DefaultMCPServer().ServeHTTP(ctx.Writer, req)
}

func (i *imlMcpController) handleMessage(ctx *gin.Context, server http.Handler) {
	sessionId := ctx.Request.URL.Query().Get("sessionId")
	params, ok := i.sessionKeys.Load(sessionId)
	if !ok {
		ctx.String(403, "sessionId not found")
		return
	}
	ps, ok := params.(SessionInfo)
	cfg := i.settingModule.Get(ctx)
	req := ctx.Request.WithContext(utils.SetGatewayInvoke(ctx.Request.Context(), cfg.InvokeAddress))
	req = req.WithContext(utils.SetLabel(req.Context(), "apikey", ps.Apikey))
	req = req.WithContext(utils.SetLabel(req.Context(), "app", ps.App))
	server.ServeHTTP(ctx.Writer, req)
}

type SessionInfo struct {
	Apikey string
	App    string
}
