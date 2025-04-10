package mcp_server

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/mark3labs/mcp-go/server"

	"github.com/eolinker/eosc"
)

var (
	mcpServer       = NewServer()
	ServiceBasePath = "mcp/service"
	GlobalBasePath  = "mcp/global"
)

func NewServer() *Server {
	return &Server{
		sseServers: eosc.BuildUntyped[string, *server.SSEServer](),
	}
}

type Server struct {
	sseServers eosc.Untyped[string, *server.SSEServer]
}

func (s *Server) Set(path string, sseServer *server.SSEServer) {
	s.sseServers.Set(path, sseServer)
}

func (s *Server) Del(path string) {
	s.sseServers.Del(path)
}

func (s *Server) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	sseServer, has := s.sseServers.Get(trimPath(r.URL.Path))
	if has {
		sseServer.ServeHTTP(w, r)
		return
	}
	http.NotFound(w, r)
	return
}

func trimPath(path string) string {
	path = strings.TrimSuffix(path, "/")
	path = strings.TrimSuffix(path, "/message")
	path = strings.TrimSuffix(path, "/sse")
	return path
}

func SetSSEServer(sid string, name string, version string, tools ...ITool) {
	s := server.NewMCPServer(name, version)
	for _, tool := range tools {
		tool.RegisterMCP(s)
	}
	apiPath := fmt.Sprintf("/api/v1/%s/%s", ServiceBasePath, sid)
	openAPIPath := fmt.Sprintf("/openapi/v1/%s/%s", ServiceBasePath, sid)
	mcpServer.Set(apiPath, server.NewSSEServer(s, server.WithBasePath(apiPath)))
	mcpServer.Set(openAPIPath, server.NewSSEServer(s, server.WithBasePath(openAPIPath)))
}

func DelSSEServer(sid string) {
	apiPath := fmt.Sprintf("/api/v1/%s/%s", ServiceBasePath, sid)
	openAPIPath := fmt.Sprintf("/openapi/v1/%s/%s", ServiceBasePath, sid)
	mcpServer.Del(apiPath)
	mcpServer.Del(openAPIPath)
}

func ServeHTTP(w http.ResponseWriter, r *http.Request) {
	mcpServer.ServeHTTP(w, r)
}

func DefaultMCPServer() *Server {
	return mcpServer
}
