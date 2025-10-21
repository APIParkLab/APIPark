package mcp_server

import "encoding/json"

type TransportType string

const (
	TransportTypeStreamableHTTP TransportType = "streamable-http"
	TransportTypeSSE            TransportType = "sse"
)

func NewMCPConfig(typ TransportType, url string, headers map[string]string, alwaysAllow []string) *MCPConfig {
	return &MCPConfig{
		Type:        typ,
		URL:         url,
		Headers:     headers,
		AlwaysAllow: alwaysAllow,
	}
}

type MCPConfig struct {
	Type        TransportType     `json:"type"`
	URL         string            `json:"url"`
	Headers     map[string]string `json:"headers,omitempty"`
	AlwaysAllow []string          `json:"alwaysAllow,omitempty"`
}

func (c *MCPConfig) ToString(name string) string {
	m := map[string]interface{}{
		"mcpServers": map[string]interface{}{
			name: c,
		},
	}
	data, _ := json.MarshalIndent(m, "", "\t")
	return string(data)
}
