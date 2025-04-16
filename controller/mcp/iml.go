package mcp

import (
	"fmt"
	"net/http"
	"strings"
	"sync"

	application_authorization "github.com/APIParkLab/APIPark/module/application-authorization"

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
	settingModule       system.ISettingModule                          `autowired:""`
	authorizationModule application_authorization.IAuthorizationModule `autowired:""`
	mcpModule           mcp.IMcpModule                                 `autowired:""`
	sessionKeys         sync.Map
	server              map[string]http.Handler
	openServer          http.Handler
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

func (i *imlMcpController) generateZhCNMCPServer() *server.MCPServer {
	s := server.NewMCPServer("APIPark MCP Server", "1.0.0", server.WithLogging())
	s.AddTool(
		mcp2.NewTool(
			"service_list",
			mcp2.WithDescription("此工具用于获取 APIPark 中已注册服务的列表。每个服务包含其唯一标识（service ID）、名称、描述及包含的 API 列表等关键信息。支持通过关键词进行模糊搜索，以便快速缩小查找范围。在获得某个服务的 ID 后，可以调用 openapi_document 工具来获取该服务的 OpenAPI 文档，以便后续调用其提供的 API 接口。"),
			mcp2.WithString("keyword", mcp2.Description("关键词，用于模糊搜索服务")),
		),
		i.mcpModule.Services,
	)
	s.AddTool(
		mcp2.NewTool(
			"openapi_document",
			mcp2.WithDescription("此工具用于获取指定服务的 OpenAPI 接口文档。返回内容支持 OpenAPI v3 与 v2 两种规范格式。通过传入服务 ID，可以查看该服务的所有 API 定义、参数结构、请求方式等详细信息，为后续构造请求做准备。"),
			mcp2.WithString("service", mcp2.Description("服务的唯一标识 ID")),
		),
		i.mcpModule.APIs,
	)
	s.AddTool(
		mcp2.NewTool(
			"invoke_api",
			mcp2.WithDescription("此工具用于直接调用指定的 API 接口。调用前需根据该接口的 OpenAPI 文档构造必要的请求参数，如请求路径、方法、查询参数、请求头、请求体等。调用过程中无需传递认证信息，例如请求头中的 Authorization 字段不需要提供。"),
			mcp2.WithString("path", mcp2.Description("API 请求路径"), mcp2.Required()),
			mcp2.WithString("method", mcp2.Description("API 请求方法，例如 GET、POST、PUT"), mcp2.Required()),
			mcp2.WithString("content-type", mcp2.Description("请求的 Content-Type 类型。如果方法为 POST、PUT 或 PATCH，则必须指定该字段。")),
			mcp2.WithObject("query", mcp2.Description("请求的查询参数，类型为 map[string]string")),
			mcp2.WithObject("header", mcp2.Description("请求的头部参数，类型为 map[string]string")),
			mcp2.WithString("body", mcp2.Description("请求体内容，通常为 JSON 字符串")),
		),
		i.mcpModule.Invoke,
	)
	return s
}

func (i *imlMcpController) generateZhTWMCPServer() *server.MCPServer {
	s := server.NewMCPServer("APIPark MCP Server", "1.0.0", server.WithLogging())
	s.AddTool(
		mcp2.NewTool(
			"service_list",
			mcp2.WithDescription("此工具用於獲取 APIPark 中已註冊服務的清單。每個服務包含其唯一識別碼（service ID）、名稱、描述以及該服務所包含的 API 列表。支援關鍵字模糊搜尋，可快速縮小查詢範圍。獲取到服務 ID 後，可使用 openapi_document 工具來查詢該服務對應的 OpenAPI 文件，為後續 API 呼叫做準備。"),
			mcp2.WithString("keyword", mcp2.Description("關鍵字，用於模糊搜尋服務")),
		),
		i.mcpModule.Services,
	)
	s.AddTool(
		mcp2.NewTool(
			"openapi_document",
			mcp2.WithDescription("此工具用於查詢指定服務的 OpenAPI 文件。返回的格式支援 OpenAPI v3 與 v2 標準。透過輸入服務 ID，可查閱該服務所有 API 的定義、參數結構、請求方式等細節，有助於後續構造 API 呼叫請求。"),
			mcp2.WithString("service", mcp2.Description("欲查詢的服務唯一識別碼")),
		),
		i.mcpModule.APIs,
	)
	s.AddTool(
		mcp2.NewTool(
			"invoke_api",
			mcp2.WithDescription("此工具可直接發送 API 請求。在呼叫此工具之前，需根據該 API 的 OpenAPI 文件構造所需的請求參數，如請求路徑、方法、查詢參數、標頭、主體等。使用此工具時不需傳送任何認證資訊，例如 Authorization 標頭可省略。"),
			mcp2.WithString("path", mcp2.Description("API 的請求路徑"), mcp2.Required()),
			mcp2.WithString("method", mcp2.Description("API 的請求方法，例如 GET、POST、PUT"), mcp2.Required()),
			mcp2.WithString("content-type", mcp2.Description("請求的 Content-Type。若方法為 POST、PUT 或 PATCH，則必須指定")),
			mcp2.WithObject("query", mcp2.Description("請求的查詢參數，類型為 map[string]string")),
			mcp2.WithObject("header", mcp2.Description("請求的標頭，類型為 map[string]string")),
			mcp2.WithString("body", mcp2.Description("請求主體內容，通常為 JSON 字串")),
		),
		i.mcpModule.Invoke,
	)
	return s
}

func (i *imlMcpController) generateEnMCPServer() *server.MCPServer {
	s := server.NewMCPServer("APIPark MCP Server", "1.0.0", server.WithLogging())
	s.AddTool(
		mcp2.NewTool(
			"service_list",
			mcp2.WithDescription("This tool can retrieve a list of registered services on APIPark, including key information such as service ID, name, description, and API list within the service. Support keyword search to quickly narrow down the search scope. After obtaining the service ID, you can use this ID to call the tool openapi_document to obtain the openapi document of the service for the corresponding service, preparing for subsequent API calls."),
			mcp2.WithString("keyword", mcp2.Description("Keyword for fuzzy search")),
		),
		i.mcpModule.Services,
	)
	s.AddTool(
		mcp2.NewTool(
			"openapi_document",
			mcp2.WithDescription("This tool returns the openAPI documentation for the corresponding service. The format supports the specifications of OpenAPI v3 and OpenAPI v2."),
			mcp2.WithString("service", mcp2.Description("Service ID")),
		),
		i.mcpModule.APIs,
	)
	s.AddTool(
		mcp2.NewTool(
			"invoke_api",
			mcp2.WithDescription("This tool can directly make API calls. Before calling this tool, it is necessary to construct relevant parameters based on the corresponding API's openAPI documentation, including query, header, body, method, path, and other parameters. By using this tool, no authentication related information needs to be transmitted, that is, no request header Authorization needs to be transmitted."),
			mcp2.WithString("path", mcp2.Description("API path"), mcp2.Required()),
			mcp2.WithString("method", mcp2.Description("API method"), mcp2.Required()),
			mcp2.WithString("content-type", mcp2.Description("API Request Content-Type. If method is POST,PUT,PATCH, it must be set. If not set, it will be ignored.")),
			mcp2.WithObject("query", mcp2.Description("API Request query,param type is map[string]string")),
			mcp2.WithObject("header", mcp2.Description("API Request header,param type is map[string]string")),
			mcp2.WithString("body", mcp2.Description("API Request body")),
		),
		i.mcpModule.Invoke,
	)
	return s
}

func (i *imlMcpController) generateJPMCPServer() *server.MCPServer {
	s := server.NewMCPServer("APIPark MCP Server", "1.0.0", server.WithLogging())
	s.AddTool(
		mcp2.NewTool(
			"service_list",
			mcp2.WithDescription("このツールは、APIPark に登録されているサービスの一覧を取得するためのものです。各サービスには、サービスID、名称、説明、およびそのサービスに含まれるAPI一覧といった重要な情報が含まれます。キーワードによるあいまい検索が可能で、目的のサービスを素早く絞り込むことができます。取得したサービスIDを使用して openapi_document ツールを呼び出すことで、そのサービスの OpenAPI ドキュメントを取得でき、APIの利用準備が整います。"),
			mcp2.WithString("keyword", mcp2.Description("キーワード。サービスをあいまい検索するための文字列")),
		),
		i.mcpModule.Services,
	)
	s.AddTool(
		mcp2.NewTool(
			"openapi_document",
			mcp2.WithDescription("指定されたサービスの OpenAPI ドキュメントを取得するためのツールです。OpenAPI v3 および v2 のフォーマットに対応しています。このドキュメントを使用することで、APIのエンドポイント、リクエスト方法、パラメータなどの詳細を確認でき、API呼び出しの準備に役立ちます。"),
			mcp2.WithString("service", mcp2.Description("対象のサービスID")),
		),
		i.mcpModule.APIs,
	)
	s.AddTool(
		mcp2.NewTool(
			"invoke_api",
			mcp2.WithDescription("このツールは、指定された API を直接呼び出すためのものです。呼び出し前に、OpenAPI ドキュメントに基づいて必要なパラメータ（パス、メソッド、クエリ、ヘッダー、ボディなど）を構築する必要があります。呼び出し時に認証情報（例：Authorization ヘッダー）を送信する必要はありません。"),
			mcp2.WithString("path", mcp2.Description("API のリクエストパス"), mcp2.Required()),
			mcp2.WithString("method", mcp2.Description("HTTPメソッド（GET、POST、PUTなど）。"), mcp2.Required()),
			mcp2.WithString("content-type", mcp2.Description("リクエストの Content-Type。メソッドが POST、PUT、PATCH の場合に必須。")),
			mcp2.WithObject("query", mcp2.Description("リクエストのクエリパラメータ。型は map[string]string")),
			mcp2.WithObject("header", mcp2.Description("リクエストヘッダー。型は map[string]string")),
			mcp2.WithString("body", mcp2.Description("リクエストボディ。通常はJSON文字列")),
		),
		i.mcpModule.Invoke,
	)
	return s
}

func (i *imlMcpController) OnComplete() {
	i.server = make(map[string]http.Handler)
	enSer := i.generateEnMCPServer()
	i.server["en-US"] = server.NewSSEServer(enSer, server.WithBasePath(fmt.Sprintf("/api/v1/%s", mcp_server.GlobalBasePath)))
	i.server["zh-CN"] = server.NewSSEServer(i.generateZhCNMCPServer(), server.WithBasePath(fmt.Sprintf("/api/v1/%s", mcp_server.GlobalBasePath)))
	i.server["zh-TW"] = server.NewSSEServer(i.generateZhTWMCPServer(), server.WithBasePath(fmt.Sprintf("/api/v1/%s", mcp_server.GlobalBasePath)))
	i.server["ja-JP"] = server.NewSSEServer(i.generateJPMCPServer(), server.WithBasePath(fmt.Sprintf("/api/v1/%s", mcp_server.GlobalBasePath)))

	i.openServer = server.NewSSEServer(enSer, server.WithBasePath(fmt.Sprintf("/openapi/v1/%s", strings.Trim(mcp_server.GlobalBasePath, "/"))))
}

func (i *imlMcpController) GlobalMCPHandle(ctx *gin.Context) {
	cfg := i.settingModule.Get(ctx)
	req := ctx.Request.WithContext(utils.SetGatewayInvoke(ctx.Request.Context(), cfg.InvokeAddress))
	locale := utils.I18n(ctx)
	if v, ok := i.server[locale]; ok {
		v.ServeHTTP(ctx.Writer, req)
		return
	}
	i.server["en-US"].ServeHTTP(ctx.Writer, req)
}

func (i *imlMcpController) GlobalHandleSSE(ctx *gin.Context) {
	apikey := ctx.Request.URL.Query().Get("apikey")
	i.handleSSE(ctx, i.openServer, apikey)
}

func (i *imlMcpController) handleSSE(ctx *gin.Context, server http.Handler, apikey string) {

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
	apikey := ctx.Request.URL.Query().Get("apikey")
	serviceId := ctx.Param("serviceId")
	if serviceId == "" {
		ctx.AbortWithStatusJSON(403, gin.H{"code": -1, "msg": "invalid service id", "success": "fail"})
		return
	}
	ok, err := i.authorizationModule.CheckAPIKeyAuthorization(ctx, serviceId, apikey)
	if err != nil {
		ctx.AbortWithStatusJSON(403, gin.H{"code": -1, "msg": err.Error(), "success": "fail"})
		return
	}
	if !ok {
		ctx.AbortWithStatusJSON(403, gin.H{"code": -1, "msg": "invalid apikey", "success": "fail"})
		return
	}

	i.handleSSE(ctx, mcp_server.DefaultMCPServer(), apikey)
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
