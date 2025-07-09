package mcp_server

import (
	"fmt"
	"net/http"
	"strings"
	"sync"

	"github.com/mark3labs/mcp-go/mcp"
	"github.com/mitchellh/mapstructure"

	"github.com/mark3labs/mcp-go/server"
)

var (
	mcpServer       = NewServer()
	ServiceBasePath = "mcp/service"
	GlobalBasePath  = "mcp/global"
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
	*server.MCPServer
	handlers map[string]http.Handler
}

func (h *Handler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	r.URL.Path = strings.TrimSuffix(r.URL.Path, "/")
	if strings.HasSuffix(r.URL.Path, "/mcp") {
		h.handlers["openapi-stream"].ServeHTTP(w, r)
		return
	}
	if strings.HasPrefix(r.URL.Path, "/api") {
		h.handlers["api-sse"].ServeHTTP(w, r)
		return
	} else if strings.HasPrefix(r.URL.Path, "/openapi") {
		h.handlers["openapi-sse"].ServeHTTP(w, r)
		return
	}
	http.NotFound(w, r)
	return
}

func (s *Server) Set(id string, ser *server.MCPServer) {
	s.locker.Lock()
	defer s.locker.Unlock()
	tmp := &Handler{
		MCPServer: ser,
		handlers:  make(map[string]http.Handler),
	}
	tmp.handlers["api-sse"] = server.NewSSEServer(ser, server.WithStaticBasePath(fmt.Sprintf("/api/v1/%s/%s", ServiceBasePath, id)))
	tmp.handlers["openapi-sse"] = server.NewSSEServer(ser, server.WithStaticBasePath(fmt.Sprintf("/openapi/v1/%s/%s", ServiceBasePath, id)))
	tmp.handlers["openapi-stream"] = server.NewStreamableHTTPServer(ser, server.WithEndpointPath(fmt.Sprintf("/openapi/v1/%s/%s/mcp", ServiceBasePath, id)))
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
	m := &Handler{
		MCPServer: ser.MCPServer,
		handlers:  make(map[string]http.Handler),
	}
	for k, v := range ser.handlers {
		m.handlers[k] = v
	}

	return m, true
}

func (s *Server) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	sid, err := genPath(r.URL.Path)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte(err.Error()))
		return
	}
	ser, has := s.Get(sid)
	if has {
		ser.ServeHTTP(w, r)
		return
	}
	http.NotFound(w, r)
	return
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
	ser, has := mcpServer.Get(sid)
	if !has {
		mcpServer.Set(sid, server.NewMCPServer(name, version, server.WithToolCapabilities(true)))
		ser, has = mcpServer.Get(sid)
		if !has {
			return
		}
	}
	ts := make([]server.ServerTool, 0, len(tools))
	for _, tool := range tools {
		ts = append(ts, tool.Tool())
	}
	ser.SetTools(ts...)
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
		toolOptions := make([]mcp.ToolOption, 0, len(a.Params)+2)
		toolOptions = append(toolOptions, mcp.WithDescription(a.Description))
		params := make(map[string]*Param)
		for _, v := range a.Params {
			params[v.Name] = NewParam(Position(v.In), v.Required, v.Description)
			options := make([]mcp.PropertyOption, 0, 2)
			if v.Required {
				options = append(options, mcp.Required())
			}
			options = append(options, mcp.Description(v.Description))
			toolOptions = append(toolOptions, mcp.WithString(v.Name, options...))
		}
		if a.Body != nil {
			type Schema struct {
				Type       string                 `mapstructure:"type"`
				Properties map[string]interface{} `mapstructure:"properties"`
				Items      interface{}            `mapstructure:"items"`
				Required   interface{}            `mapstructure:"required"`
			}
			var tmp Schema
			err = mapstructure.Decode(a.Body, &tmp)
			if err != nil {
				return err
			}
			required := map[string]struct{}{}
			switch t := tmp.Required.(type) {
			case []interface{}:
				for _, v := range t {
					i, ok := v.(string)
					if !ok {
						continue
					}
					required[i] = struct{}{}
				}
			}
			for k, v := range tmp.Properties {
				description := ""
				typ := "string"
				isRequired := false
				if _, ok := required[k]; ok {
					isRequired = true
				}
				var props map[string]interface{}
				var items interface{}
				switch t := v.(type) {
				case map[string]interface{}:
					if m, ok := t["type"]; ok {
						n, ok := m.(string)
						if ok {
							typ = n
						}
					}
					if m, ok := t["description"]; ok {
						n, ok := m.(string)
						if ok {
							description = n
						}
					}
					switch typ {
					case "array":
						if m, ok := t["items"]; ok {
							items = m
						}
					case "object":
						if m, ok := t["properties"]; ok {
							n, ok := m.(map[string]interface{})
							if ok {
								props = n
							}
						}
					}
				}

				params[k] = NewParam(PositionBody, isRequired, description)
				options := make([]mcp.PropertyOption, 0, 3)
				options = append(options, mcp.Description(description))
				if props != nil {
					options = append(options, mcp.Properties(props))
				}
				if items != nil {
					options = append(options, mcp.Items(items))
				}
				switch typ {
				case "string":
					toolOptions = append(toolOptions, mcp.WithString(k, options...))
				case "integer", "number", "float":
					toolOptions = append(toolOptions, mcp.WithNumber(k, options...))
				case "boolean":
					toolOptions = append(toolOptions, mcp.WithBoolean(k, options...))
				case "array":
					toolOptions = append(toolOptions, mcp.WithArray(k, options...))
				case "object":
					toolOptions = append(toolOptions, mcp.WithObject(k, options...))
				default:
					return fmt.Errorf("unsupported type: %s", typ)
				}
			}
		}

		tools = append(tools, NewTool(a.Summary, a.Path, a.Method, a.ContentType, params, toolOptions...))
	}
	SetServer(sid, name, version, tools...)
	return nil
}
