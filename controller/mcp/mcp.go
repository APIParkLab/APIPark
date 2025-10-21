package mcp

import (
	"reflect"

	"github.com/eolinker/go-common/autowire"
	"github.com/gin-gonic/gin"
)

type IMcpController interface {
	MCPHandle(ctx *gin.Context)

	GlobalMCPHandle(ctx *gin.Context)
	GlobalHandleSSE(ctx *gin.Context)
	GlobalHandleMessage(ctx *gin.Context)
	GlobalHandleStreamHTTP(ctx *gin.Context)
	GlobalMCPConfig(ctx *gin.Context) (string, error)

	AppMCPHandle(ctx *gin.Context)
	AppHandleSSE(ctx *gin.Context)
	AppHandleMessage(ctx *gin.Context)
	AppHandleStreamHTTP(ctx *gin.Context)
	AppMCPConfig(ctx *gin.Context, appId string) (string, error)

	ServiceHandleSSE(ctx *gin.Context)
	ServiceHandleMessage(ctx *gin.Context)

	ServiceHandleStreamHTTP(ctx *gin.Context)
}

func init() {
	autowire.Auto[IMcpController](func() reflect.Value {
		return reflect.ValueOf(new(imlMcpController))
	})
}
