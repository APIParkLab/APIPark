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
	ServiceBasePath = "/api/v1/mcp/service"
	GlobalBasePath  = "/openapi/v1/mcp/global"
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
	serviceId := getServiceId(r.URL.Path)
	sseServer, has := s.sseServers.Get(serviceId)
	if has {
		sseServer.ServeHTTP(w, r)
		return
	}
	http.NotFound(w, r)
	return
}

func getServiceId(path string) string {
	id := strings.TrimPrefix(path, ServiceBasePath)
	id = strings.Trim(id, "/")
	id = strings.TrimSuffix(id, "/message")
	id = strings.TrimSuffix(id, "/sse")
	return id
}

func SetSSEServer(sid string, name string, version string, tools ...ITool) {
	s := server.NewMCPServer(name, version)
	for _, tool := range tools {
		tool.RegisterMCP(s)
	}
	sseServer := server.NewSSEServer(s, server.WithBasePath(fmt.Sprintf("%s/%s", ServiceBasePath, sid)))
	mcpServer.Set(sid, sseServer)
}

func DelSSEServer(sid string) {
	mcpServer.Del(sid)
}

func ServeHTTP(w http.ResponseWriter, r *http.Request) {
	mcpServer.ServeHTTP(w, r)
}
