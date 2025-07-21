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
	APIs(ctx context.Context, req mcp.CallToolRequest) (*mcp.CallToolResult, error)
	Invoke(ctx context.Context, req mcp.CallToolRequest) (*mcp.CallToolResult, error)
}

func init() {
	autowire.Auto[IMcpModule](func() reflect.Value {
		return reflect.ValueOf(new(imlMcpModule))
	})
}
