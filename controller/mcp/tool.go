package mcp

import "github.com/mark3labs/mcp-go/mcp"

const (
	ToolServiceList     = "service_list"
	ToolOpenAPIDocument = "openapi_document"
	ToolInvokeAPI       = "invoke_api"

	languageZhCN = "zh-CN"
	languageZhTW = "zh-TW"
	languageEnUs = "en-US"
	languageJaJp = "ja-JP"
)

var mcpToolsByLanguage = map[string]map[string]mcp.Tool{
	languageZhCN: toolsZhCN,
	languageZhTW: toolsZhTW,
	languageEnUs: toolsEnUs,
	languageJaJp: toolsJaJp,
}

var toolsZhTW = map[string]mcp.Tool{
	ToolServiceList: mcp.NewTool(
		ToolServiceList,
		mcp.WithDescription("此工具用於獲取 APIPark 中已註冊服務的列表。每個服務包含其唯一標識（service ID）、名稱、描述及包含的 API 列表等關鍵信息。支持通過關鍵詞進行模糊搜索，以便快速縮小查找範圍。在獲得某個服務的 ID 後，可以調用 openapi_document 工具來獲取該服務的 OpenAPI 文檔，以便後續調用其提供的 API 接口。"),
		mcp.WithString("keyword", mcp.Description("關鍵詞，用於模糊搜索服務"))),
	ToolOpenAPIDocument: mcp.NewTool(
		ToolOpenAPIDocument,
		mcp.WithDescription("此工具用於獲取 APIPark 中服務的 OpenAPI 文檔。"),
		mcp.WithString("service_id", mcp.Description("服務 ID"))),
	ToolInvokeAPI: mcp.NewTool(
		ToolInvokeAPI,
		mcp.WithDescription("此工具可直接發送 API 請求。在調用此工具之前，需要根據該 API 的 OpenAPI 文檔構造所需的請求參數，如請求路徑、方法、查詢參數、頭部信息、主體內容等。使用此工具時不需要傳遞任何認證信息，例如 Authorization 頭部可以省略。"),
		mcp.WithString("path", mcp.Description("API 的請求路徑"), mcp.Required()),
		mcp.WithString("method", mcp.Description("API 的請求方法，例如 GET、POST、PUT"), mcp.Required()),
		mcp.WithString("content-type", mcp.Description("請求的 Content-Type。若方法為 POST、PUT 或 PATCH，則必須指定")),
		mcp.WithObject("query", mcp.Description("請求的查詢參數，類型為 map[string]string")),
		mcp.WithObject("header", mcp.Description("請求的頭部，類型為 map[string]string")),
		mcp.WithString("body", mcp.Description("請求主體內容，通常為 JSON 字符串")),
	),
}

var toolsZhCN = map[string]mcp.Tool{
	ToolServiceList: mcp.NewTool(
		ToolServiceList,
		mcp.WithDescription("此工具用于获取 APIPark 中已注册服务的列表。每个服务包含其唯一标识（service ID）、名称、描述及包含的 API 列表等关键信息。支持通过关键词进行模糊搜索，以便快速缩小查找范围。在获得某个服务的 ID 后，可以调用 openapi_document 工具来获取该服务的 OpenAPI 文档，以便后续调用其提供的 API 接口。"),
		mcp.WithString("keyword", mcp.Description("关键词，用于模糊搜索服务"))),
	ToolOpenAPIDocument: mcp.NewTool(
		ToolOpenAPIDocument, mcp.WithDescription("此工具用于查询指定服务的 OpenAPI 文档。返回的格式支持 OpenAPI v3 和 v2 标准。通过输入服务 ID，可以查看该服务所有 API 的定义、参数结构、请求方式等详细信息，为后续构造 API 调用请求做准备。"),
		mcp.WithString("service", mcp.Description("欲查询的服务唯一标识")),
	),
	ToolInvokeAPI: mcp.NewTool(ToolInvokeAPI,
		mcp.WithDescription("此工具可直接发送 API 请求。在调用此工具之前，需要根据该 API 的 OpenAPI 文档构造所需的请求参数，如请求路径、方法、查询参数、头部信息、主体内容等。使用此工具时不需要传递任何认证信息，例如 Authorization 头部可以省略。"),
		mcp.WithString("path", mcp.Description("API 的请求路径"), mcp.Required()),
		mcp.WithString("method", mcp.Description("API 的请求方法，例如 GET、POST、PUT"), mcp.Required()),
		mcp.WithString("content-type", mcp.Description("请求的 Content-Type。若方法为 POST、PUT 或 PATCH，则必须指定")),
		mcp.WithObject("query", mcp.Description("请求的查询参数，类型为 map[string]string")),
		mcp.WithObject("header", mcp.Description("请求的头部，类型为 map[string]string")),
		mcp.WithString("body", mcp.Description("请求主体内容，通常为 JSON 字符串")),
	),
}

var toolsEnUs = map[string]mcp.Tool{
	ToolServiceList: mcp.NewTool(
		ToolServiceList,
		mcp.WithDescription("This tool is used to retrieve a list of registered services in APIPark. Each service includes its unique identifier (service ID), name, description, and a list of APIs it contains. It supports fuzzy searching by keyword for quick narrowing down of results. After obtaining a service ID, you can use the openapi_document tool to get the OpenAPI documentation for that service, which is necessary for invoking its APIs."),
		mcp.WithString("keyword", mcp.Description("Keyword for fuzzy search of services"))),
	ToolOpenAPIDocument: mcp.NewTool(
		ToolOpenAPIDocument,
		mcp.WithDescription("This tool is used to query the OpenAPI documentation of a specified service. The returned format supports both OpenAPI v3 and v2 standards. By entering the service ID, you can view detailed information about all APIs of that service, including definitions, parameter structures, request methods, etc., which prepares you for subsequent API calls."),
		mcp.WithString("service", mcp.Description("Unique identifier of the service to query"))),
	ToolInvokeAPI: mcp.NewTool(
		ToolInvokeAPI,
		mcp.WithDescription("This tool can directly send API requests. Before using this tool, you need to construct the required request parameters based on the OpenAPI documentation of the API, such as request path, method, query parameters, header information, body content, etc. No authentication information like Authorization header is required when using this tool."),
		mcp.WithString("path", mcp.Description("API request path"), mcp.Required()),
		mcp.WithString("method", mcp.Description("API request method, e.g., GET, POST, PUT"), mcp.Required()),
		mcp.WithString("content-type", mcp.Description("Content-Type of the request. Must be specified if method is POST, PUT, or PATCH")),
		mcp.WithObject("query", mcp.Description("Query parameters of the request, type map[string]string")),
		mcp.WithObject("header", mcp.Description("Header information of the request, type map[string]string")),
		mcp.WithString("body", mcp.Description("Body content of the request, usually in JSON string")),
	),
}

var toolsJaJp = map[string]mcp.Tool{
	ToolServiceList: mcp.NewTool(
		ToolServiceList,
		mcp.WithDescription("このツールは、APIParkに登録されているサービスのリストを取得するために使用されます。各サービスには、ユニークな識別子（サービスID）、名前、説明、および含まれるAPIのリストが含まれています。キーワードによるあいまい検索をサポートしており、結果を迅速に絞り込むことができます。サービスIDを取得した後は、openapi_documentツールを使用してそのサービスのOpenAPIドキュメントを取得し、そのAPIを呼び出す準備をします。"),
		mcp.WithString("keyword", mcp.Description("サービスをあいまい検索するためのキーワード"))),
	ToolOpenAPIDocument: mcp.NewTool(
		ToolOpenAPIDocument,
		mcp.WithDescription("このツールは、指定されたサービスのOpenAPIドキュメントを照会するために使用されます。返される形式は、OpenAPI v3およびv2標準の両方をサポートしています。サービスIDを入力することで、そのサービスのすべてのAPIに関する詳細情報（定義、パラメータ構造、リクエスト方法など）を表示し、後続のAPI呼び出しの準備をします。"),
		mcp.WithString("service", mcp.Description("照会するサービスのユニークな識別子"))),
	ToolInvokeAPI: mcp.NewTool(
		ToolInvokeAPI,
		mcp.WithDescription("このツールは、APIリクエストを直接送信できます。このツールを使用する前に、APIのOpenAPIドキュメントに基づいて、必要なリクエストパラメータ（リクエストパス、メソッド、クエリパラメータ、ヘッダー情報、ボディコンテンツなど）を構築する必要があります。このツールを使用する際には、Authorizationヘッダーなどの認証情報は必要ありません。"),
		mcp.WithString("path", mcp.Description("APIのリクエストパス"), mcp.Required()),
		mcp.WithString("method", mcp.Description("APIのリクエストメソッド（例：GET、POST、PUT）"), mcp.Required()),
		mcp.WithString("content-type", mcp.Description("リクエストのContent-Type。メソッドがPOST、PUT、またはPATCHの場合は必須です")),
		mcp.WithObject("query", mcp.Description("リクエストのクエリパラメータ、タイプはmap[string]string")),
		mcp.WithObject("header", mcp.Description("リクエストのヘッダー、タイプはmap[string]string")),
		mcp.WithString("body", mcp.Description("リクエストのボディコンテンツ、通常はJSON文字列")),
	),
}
