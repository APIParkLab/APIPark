package mcp

import (
	"context"
	"reflect"

	"github.com/eolinker/go-common/autowire"

	"github.com/mark3labs/mcp-go/mcp"
)

type IMcpModule interface {
	// Services 获取服务列表
	Services(ctx context.Context, req mcp.CallToolRequest) (*mcp.CallToolResult, error)
	// Apps 获取应用列表
	Apps(ctx context.Context, req mcp.CallToolRequest) (*mcp.CallToolResult, error)
	// APIs 获取API列表
	APIs(ctx context.Context, req mcp.CallToolRequest) (*mcp.CallToolResult, error)

	// SubscriberAuthorizations 获取订阅者授权
	SubscriberAuthorizations(ctx context.Context, req mcp.CallToolRequest) (*mcp.CallToolResult, error)
	Invoke(ctx context.Context, req mcp.CallToolRequest) (*mcp.CallToolResult, error)
}

func init() {
	autowire.Auto[IMcpModule](func() reflect.Value {
		return reflect.ValueOf(new(imlMcpModule))
	})
}
