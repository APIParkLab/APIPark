package mcp_server

import (
	"context"
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
	Tool() server.ServerTool
}

type Tool struct {
	name        string
	url         string
	method      string
	contentType string
	params      map[string]*Param
	opts        []mcp.ToolOption
}

func (t *Tool) Tool() server.ServerTool {
	return server.ServerTool{
		Tool:    mcp.NewTool(t.name, t.opts...),
		Handler: generateInvokeTool(t.url, t.method, t.contentType, t.params),
	}
}

func NewTool(name string, uri string, method string, contentType string, params map[string]*Param, opts ...mcp.ToolOption) ITool {
	return &Tool{
		name:        name,
		url:         uri,
		method:      method,
		contentType: contentType,
		params:      params,
		opts:        opts,
	}
}

func generateInvokeTool(path string, method string, contentType string, params map[string]*Param) func(ctx context.Context, request mcp.CallToolRequest) (*mcp.CallToolResult, error) {
	return func(ctx context.Context, request mcp.CallToolRequest) (*mcp.CallToolResult, error) {
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

		queries := url.Values{}
		headers := make(map[string]string)
		bodyParam := NewBodyParam(contentType)
		for k, p := range params {
			vv, ok := request.GetArguments()[k]
			if !ok && p.required {
				return nil, fmt.Errorf("param %s is required", k)
			}
			if p.position == PositionHeader || p.position == PositionQuery || p.position == PositionPath {
				v, ok := vv.(string)
				if !ok || v == "<nil>" {
					if p.required {
						return nil, fmt.Errorf("param %s is required", k)
					}
					continue
				}
			}

			switch p.position {
			case PositionPath:
				path = strings.ReplaceAll(path, "{"+k+"}", fmt.Sprintf("%v", vv))
			case PositionQuery:
				queries.Set(k, fmt.Sprintf("%v", vv))
			case PositionHeader:
				headers[k] = fmt.Sprintf("%v", vv)
			case PositionBody:
				if vv == nil {
					continue
				}
				bodyParam.Set(k, vv)
			}
		}
		bodyData, err := bodyParam.Encode()
		if err != nil {
			return nil, err
		}
		u.Path = path
		u.RawQuery = queries.Encode()

		req, err := http.NewRequest(method, u.String(), strings.NewReader(bodyData))
		if err != nil {
			return nil, err
		}
		for k, v := range headers {
			req.Header.Set(k, v)
		}
		if contentType != "" {
			req.Header.Set("Content-Type", contentType)
		}
		apikey := utils.Label(ctx, "apikey")
		if apikey != "" {
			req.Header.Set("Authorization", apikey)
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
	}
}
