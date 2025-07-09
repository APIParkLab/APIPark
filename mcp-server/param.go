package mcp_server

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
)

var client = http.Client{}

type Position string

const (
	PositionHeader Position = "header"
	PositionBody   Position = "body"
	PositionQuery  Position = "query"
	PositionPath   Position = "path"
)

type ContentType string

const (
	ContentTypeJSON ContentType = "application/json"
	ContentTypeXML  ContentType = "application/xml"
	ContentTypeHTML ContentType = "text/html"
	ContentTypeText ContentType = "text/plain"
	ContentTypeForm ContentType = "application/x-www-form-urlencoded"
	ContentTypeFile ContentType = "multipart/form-data"
)

func NewParam(position Position, required bool, description string) *Param {
	return &Param{position: position, required: required, description: description}
}

type Param struct {
	position    Position
	required    bool
	description string
}

func (p *Param) Description() string {
	return p.description
}

func (p *Param) Required() bool {
	return p.required
}

type BodyParam struct {
	contentType ContentType
	params      map[string]interface{}
}

func NewBodyParam(contentType string) *BodyParam {
	t := ContentType(contentType)
	if t == "" {
		t = ContentTypeJSON
	}
	return &BodyParam{contentType: t}
}

func (p *BodyParam) Set(k string, v interface{}) {
	if p.params == nil {
		p.params = make(map[string]interface{})
	}
	p.params[k] = v
}

func (p *BodyParam) Encode() (string, error) {
	switch p.contentType {
	case ContentTypeJSON:
		data, err := json.Marshal(p.params)
		if err != nil {
			return "", fmt.Errorf("body param encode error: %w", err)
		}
		return string(data), nil
	case ContentTypeForm, ContentTypeFile:
		data := url.Values{}
		for k, v := range p.params {
			data.Set(k, fmt.Sprintf("%v", v))
		}
		return data.Encode(), nil
	default:
		return "", fmt.Errorf("unsupported content type: %s", p.contentType)
	}
}
