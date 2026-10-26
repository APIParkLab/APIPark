package mcp_server

import (
	"fmt"
	"net/http"
	"strings"
	"sync"

	"github.com/modelcontextprotocol/go-sdk/mcp"
)

var (
	mcpServer       = NewServer()
	ServiceBasePath = "mcp/service"
	GlobalBasePath  = "mcp/global"
	AppBasePath     = "mcp/app"

	OpenGlobalMCPPath  = "/openapi/v1/global/mcp"
	OpenAppMCPPath     = "/openapi/v1/app/mcp"
	OpenServiceMCPPath = "/openapi/v1/service/mcp"
)

func NewServer() *Server {
	return &Server{
		servers: make(map[string]*Handler),
	}
}

type Server struct {
	servers map[string]*Handler
	locker  sync.RWMutex
}

type Handler struct {
	server            *mcp.Server
	sseHandler        *mcp.SSEHandler
	streamableHandler *mcp.StreamableHTTPHandler
}

func (h *Handler) Server() *mcp.Server {
	return h.server
}

func (h *Handler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	path := strings.TrimSuffix(r.URL.Path, "/")
	if strings.HasSuffix(path, "/mcp") {
		h.streamableHandler.ServeHTTP(w, r)
		return
	}
	if strings.Contains(path, "/sse") || strings.Contains(path, "/message") {
		h.sseHandler.ServeHTTP(w, r)
		return
	}
	http.NotFound(w, r)
}

func (s *Server) Set(id string, ser *mcp.Server) {
	s.locker.Lock()
	defer s.locker.Unlock()
	tmp := &Handler{
		server: ser,
		sseHandler: mcp.NewSSEHandler(func(req *http.Request) *mcp.Server {
			return ser
		}, nil),
		streamableHandler: mcp.NewStreamableHTTPHandler(func(req *http.Request) *mcp.Server {
			return ser
		}, &mcp.StreamableHTTPOptions{
			// The 2026-07-28 (SEP-2575) generation of the MCP spec is only served
			// by the streamable HTTP transport in stateless mode.
			Stateless: true,
		}),
	}
	s.servers[id] = tmp
}

func (s *Server) Del(id string) {
	s.locker.Lock()
	defer s.locker.Unlock()
	delete(s.servers, id)
}

func (s *Server) Get(id string) (*Handler, bool) {
	s.locker.RLock()
	defer s.locker.RUnlock()
	ser, has := s.servers[id]
	if !has {
		return nil, false
	}
	return ser, true
}

func (s *Server) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	var sid string
	if r.URL.Path == OpenServiceMCPPath {
		sid = r.Header.Get("X-Service-Id")
		if sid == "" {
			http.NotFound(w, r)
			return
		}
	} else {
		id, err := genPath(r.URL.Path)
		if err != nil {
			w.WriteHeader(http.StatusBadRequest)
			w.Write([]byte(err.Error()))
			return
		}
		sid = id
	}

	ser, has := s.Get(sid)
	if has {
		ser.ServeHTTP(w, r)
		return
	}
	http.NotFound(w, r)
}

func genPath(path string) (sid string, err error) {
	path = strings.TrimSuffix(path, "/")
	ps := strings.Split(path, "/")
	if len(ps) < 2 {
		err = fmt.Errorf("invalid path: %s", path)
		return
	}
	sid = ps[len(ps)-2]
	return
}

func SetServer(sid string, name string, version string, tools ...ITool) {
	ser := mcp.NewServer(&mcp.Implementation{
		Name:    name,
		Version: version,
	}, nil)
	for _, tool := range tools {
		if tool != nil && tool.Tool() != nil {
			ser.AddTool(tool.Tool(), tool.Handler())
		}
	}
	mcpServer.Set(sid, ser)
}

func DelServer(sid string) {
	mcpServer.Del(sid)
}

func ServeHTTP(w http.ResponseWriter, r *http.Request) {
	mcpServer.ServeHTTP(w, r)
}

func DefaultMCPServer() *Server {
	return mcpServer
}

func SetServerByOpenapi(sid, name, version, content string) error {
	mcpInfo, err := ConvertMCPFromOpenAPI3Data([]byte(content))
	if err != nil {
		return fmt.Errorf("convert mcp from openapi3 data error: %w", err)
	}
	tools := make([]ITool, 0, len(mcpInfo.Apis))
	for _, a := range mcpInfo.Apis {
		if a == nil {
			continue
		}
		toolName := strings.TrimSpace(a.Summary)
		if toolName == "" {
			toolName = fmt.Sprintf("%s %s", a.Method, a.Path)
		}
		toolDesc := strings.TrimSpace(a.Description)
		if toolDesc == "" {
			toolDesc = toolName
		}

		params := make(map[string]*Param)
		properties := make(map[string]interface{})
		required := make([]string, 0)

		for _, v := range a.Params {
			if v == nil {
				continue
			}
			if v.In == "header" && v.Name == "Authorization" {
				continue
			}
			params[v.Name] = NewParam(Position(v.In), v.Required, v.Description)
			prop := map[string]interface{}{
				"type": "string",
			}
			if v.Description != "" {
				prop["description"] = v.Description
			}
			if v.Schema != nil && v.Schema.Value != nil {
				if v.Schema.Value.Type != nil && len(*v.Schema.Value.Type) > 0 {
					prop["type"] = (*v.Schema.Value.Type)[0]
				}
				if len(v.Schema.Value.Enum) > 0 {
					prop["enum"] = v.Schema.Value.Enum
				}
			}
			properties[v.Name] = prop
			if v.Required {
				required = append(required, v.Name)
			}
		}

		if a.Body != nil {
			// 展平 allOf/oneOf/anyOf，得到扁平的属性集合，
			// 否则组合 schema 的字段会被整体丢弃，Tool 入参将为空。
			body := flattenBodySchema(a.Body)
			reqMap := map[string]struct{}{}
			if names, ok := body["required"].([]string); ok {
				for _, name := range names {
					reqMap[name] = struct{}{}
				}
			}
			bodyProperties, _ := body["properties"].(map[string]interface{})
			for k, v := range bodyProperties {
				description := ""
				typ := "string"
				isRequired := false
				if _, ok := reqMap[k]; ok {
					isRequired = true
				}
				var props map[string]interface{}
				var items interface{}
				if t, ok := v.(map[string]interface{}); ok {
					if m, ok := t["type"].(string); ok {
						typ = m
					}
					if m, ok := t["description"].(string); ok {
						description = m
					}
					switch typ {
					case "array":
						if m, ok := t["items"]; ok {
							items = m
						}
					case "object":
						if m, ok := t["properties"].(map[string]interface{}); ok {
							props = m
						}
					}
				}

				params[k] = NewParam(PositionBody, isRequired, description)
				propMap := map[string]interface{}{
					"type": typ,
				}
				if description != "" {
					propMap["description"] = description
				}
				if props != nil {
					propMap["properties"] = props
				}
				if items != nil {
					propMap["items"] = items
				}
				properties[k] = propMap
				if isRequired {
					required = append(required, k)
				}
			}
		}

		schema := map[string]interface{}{
			"type":       "object",
			"properties": properties,
		}
		if len(required) > 0 {
			schema["required"] = required
		}

		tools = append(tools, NewTool(toolName, toolDesc, schema, a.Path, a.Method, a.ContentType, params))
	}
	SetServer(sid, name, version, tools...)
	return nil
}
