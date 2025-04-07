package mcp_server

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"

	"github.com/eolinker/go-common/utils"

	"github.com/mark3labs/mcp-go/mcp"
	"github.com/mark3labs/mcp-go/server"
)

type ITool interface {
	RegisterMCP(s *server.MCPServer)
}

type Tool struct {
	name        string
	url         string
	method      string
	contentType string
	opts        []mcp.ToolOption
}

func NewTool(name string, uri string, method string, contentType string, opts ...mcp.ToolOption) ITool {
	return &Tool{
		name:        name,
		url:         uri,
		method:      method,
		contentType: contentType,
		opts:        opts,
	}
}

func (t *Tool) RegisterMCP(s *server.MCPServer) {
	s.AddTool(mcp.NewTool(t.name, t.opts...), func(ctx context.Context, request mcp.CallToolRequest) (*mcp.CallToolResult, error) {
		invokeAddress := utils.GatewayInvoke(ctx)
		if invokeAddress == "" {
			return nil, fmt.Errorf("invoke address is empty")
		}
		u, err := url.Parse(invokeAddress)
		if err != nil {
			return nil, fmt.Errorf("invalid invoke address %s", invokeAddress)
		}
		if u.Scheme == "" {
			u.Scheme = "http"
		}

		path := t.url
		queries := url.Values{}
		headers := make(map[string]string)
		body := ""
		for k, v := range request.Params.Arguments {
			if k == "body" {
				tmp, _ := json.Marshal(v)
				body = string(tmp)
				continue
			}
			sps := strings.SplitN(k, "#", 2)
			if len(sps) != 2 {
				return nil, fmt.Errorf("invalid key %s", k)
			}
			switch sps[0] {
			case "query":
				queries.Set(sps[1], v.(string))
			case "header":
				headers[sps[1]] = v.(string)
			case "path":
				p, ok := v.(string)
				if !ok {
					return nil, fmt.Errorf("invalid path %s", v)
				}
				path = strings.Replace(path, fmt.Sprintf("{%s}", sps[1]), p, -1)
			}
		}
		u.Path = path
		u.RawQuery = queries.Encode()

		req, err := http.NewRequest(t.method, u.String(), strings.NewReader(body))
		if err != nil {
			return nil, err
		}
		for k, v := range headers {
			req.Header.Set(k, v)
		}
		if t.contentType != "" {
			req.Header.Set("Content-Type", t.contentType)
		}
		resp, err := client.Do(req)
		if err != nil {
			return nil, err
		}
		defer resp.Body.Close()
		d, err := io.ReadAll(resp.Body)
		if err != nil {
			return nil, err
		}
		if resp.StatusCode != http.StatusOK {
			return nil, fmt.Errorf("status code %d, %s", resp.StatusCode, string(d))
		}

		return mcp.NewToolResultText(string(d)), nil
	})
}

var client = http.Client{}
