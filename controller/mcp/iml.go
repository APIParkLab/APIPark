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
	settingModule        system.ISettingModule                          `autowired:""`
	authorizationModule  application_authorization.IAuthorizationModule `autowired:""`
	appModule            service.IAppModule                             `autowired:""`
	mcpModule            mcp.IMcpModule                                 `autowired:""`
	sessionKeys          sync.Map
	sseServers           map[string]http.Handler
	openSseServer        http.Handler
	openStreamableServer http.Handler
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
	if v, ok := i.sseServers[locale]; ok {
		v.ServeHTTP(ctx.Writer, req)
		return
	}

	i.sseServers[languageEnUs].ServeHTTP(ctx.Writer, req)
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
	i.handleSSE(ctx, i.openSseServer, SessionInfo{
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
	//ctx.Request = ctx.Request.WithContext(utils.SetLabel(ctx.Request.Context(), "app", appId))
	i.handleMessage(ctx, i.openSseServer)
}

func (i *imlMcpController) AppHandleStreamHTTP(ctx *gin.Context) {
	apikey := ctx.Request.Header.Get("Authorization")
	apikey = strings.TrimPrefix(apikey, "Bearer ")
	if apikey == "" {
		ctx.AbortWithStatusJSON(403, gin.H{"code": -1, "msg": "invalid apikey", "success": "fail"})
		return
	}
	appId := ctx.Request.Header.Get("X-Application-Id")
	if appId == "" {
		ctx.AbortWithStatusJSON(403, gin.H{"code": -1, "msg": "invalid app id", "success": "fail"})
		return
	}
	cfg := i.settingModule.Get(ctx)
	req := ctx.Request.WithContext(utils.SetGatewayInvoke(ctx.Request.Context(), cfg.InvokeAddress))

	req = req.WithContext(utils.SetLabel(req.Context(), "apikey", apikey))
	req = req.WithContext(utils.SetLabel(req.Context(), "app", appId))
	req.URL.Path = mcp_server.OpenGlobalMCPPath
	i.openStreamableServer.ServeHTTP(ctx.Writer, req)
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

	return mcp_server.NewMCPConfig(
		mcp_server.TransportTypeStreamableHTTP,
		fmt.Sprintf("%s%s", strings.TrimSuffix(cfg.SitePrefix, "/"), mcp_server.OpenAppMCPPath),
		map[string]string{
			"Authorization":    "Bearer {your_api_key}",
			"X-Application-Id": appId,
		},
		nil,
	).ToString(appInfo.Name), nil
}

func (i *imlMcpController) GlobalMCPConfig(ctx *gin.Context) (string, error) {
	cfg := i.settingModule.Get(ctx)
	if cfg.SitePrefix == "" {
		return "", fmt.Errorf("site prefix is empty")
	}
	return mcp_server.NewMCPConfig(
		mcp_server.TransportTypeStreamableHTTP,
		fmt.Sprintf("%s%s", strings.TrimSuffix(cfg.SitePrefix, "/"), mcp_server.OpenGlobalMCPPath),
		map[string]string{
			"Authorization": "Bearer {your_api_key}",
		},
		nil,
	).ToString("APIPark-MCP-Server"), nil
}

func (i *imlMcpController) OnComplete() {
	i.sseServers = make(map[string]http.Handler)
	for language, tools := range mcpToolsByLanguage {
		s := server.NewMCPServer("APIPark MCP Server", "1.0.0", server.WithLogging())
		s.AddTool(tools[ToolServiceList], i.mcpModule.Services)
		s.AddTool(tools[ToolOpenAPIDocument], i.mcpModule.APIs)
		s.AddTool(tools[ToolInvokeAPI], i.mcpModule.Invoke)
		i.sseServers[language] = server.NewSSEServer(s, server.WithStaticBasePath(fmt.Sprintf("/api/v1/%s", mcp_server.GlobalBasePath)))
		if language == languageEnUs {
			i.openSseServer = server.NewSSEServer(s, server.WithStaticBasePath(fmt.Sprintf("/openapi/v1/%s", strings.Trim(mcp_server.GlobalBasePath, "/"))))
			i.openStreamableServer = server.NewStreamableHTTPServer(s, server.WithEndpointPath(mcp_server.OpenGlobalMCPPath))
		}
	}
}

func (i *imlMcpController) GlobalMCPHandle(ctx *gin.Context) {
	cfg := i.settingModule.Get(ctx)
	req := ctx.Request.WithContext(utils.SetGatewayInvoke(ctx.Request.Context(), cfg.InvokeAddress))
	locale := utils.I18n(ctx)
	if v, ok := i.sseServers[locale]; ok {
		v.ServeHTTP(ctx.Writer, req)
		return
	}
	i.sseServers[languageEnUs].ServeHTTP(ctx.Writer, req)
}

func (i *imlMcpController) GlobalHandleSSE(ctx *gin.Context) {
	apikey := ctx.Request.URL.Query().Get("apikey")
	i.handleSSE(ctx, i.openSseServer, SessionInfo{
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
	i.handleMessage(ctx, i.openSseServer)
}

func (i *imlMcpController) GlobalHandleStreamHTTP(ctx *gin.Context) {
	apikey := ctx.Request.Header.Get("Authorization")
	apikey = strings.TrimPrefix(apikey, "Bearer ")
	cfg := i.settingModule.Get(ctx)
	req := ctx.Request.WithContext(utils.SetGatewayInvoke(ctx.Request.Context(), cfg.InvokeAddress))
	req = req.WithContext(utils.SetLabel(req.Context(), "apikey", apikey))
	i.openStreamableServer.ServeHTTP(ctx.Writer, req)
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
	apikey := ctx.Request.Header.Get("Authorization")
	serviceId := ctx.Request.Header.Get("X-Service-Id")
	if serviceId == "" {
		ctx.AbortWithStatusJSON(403, gin.H{"code": -1, "msg": "invalid service id", "success": "fail"})
		return
	}
	apikey = strings.TrimPrefix(apikey, "Bearer ")
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
