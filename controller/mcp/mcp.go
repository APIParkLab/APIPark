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
	ServiceHandleSSE(ctx *gin.Context)
	ServiceHandleMessage(ctx *gin.Context)
	GlobalMCPConfig(ctx *gin.Context) (string, error)
	ServiceHandleStreamHTTP(ctx *gin.Context)
}

func init() {
	autowire.Auto[IMcpController](func() reflect.Value {
		return reflect.ValueOf(new(imlMcpController))
	})
}
