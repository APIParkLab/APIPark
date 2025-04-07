package mcp_server

import (
	"encoding/json"
	"net/http"

	"github.com/getkin/kin-openapi/openapi3"
)

var (
	openapi3Loader = openapi3.NewLoader()
)

type MCPInfo struct {
	Name        string
	Description string
	Apis        []*API
}

type API struct {
	Path        string                 `json:"path"`
	Method      string                 `json:"method"`
	ContentType string                 `json:"content_type"`
	Summary     string                 `json:"summary"`
	Description string                 `json:"description"`
	Params      []*openapi3.Parameter  `json:"params"`
	Body        map[string]interface{} `json:"body"`
}

func ConvertMCPFromOpenAPI3Data(data []byte) (*MCPInfo, error) {
	spec, err := openapi3Loader.LoadFromData(data)
	if err != nil {
		return nil, err
	}
	return parseOpenAPI3(spec)
}

func parseOpenAPI3(spec *openapi3.T) (*MCPInfo, error) {
	items := spec.Paths.Map()
	apis := make([]*API, 0, len(items)*4)
	for path, item := range items {
		pathApis, err := genAPIs(path, item)
		if err != nil {
			return nil, err
		}
		apis = append(apis, pathApis...)
	}

	return &MCPInfo{
		Name:        spec.Info.Title,
		Description: spec.Info.Description,
		Apis:        apis,
	}, nil
}

var (
	validMethods = []string{
		http.MethodGet,
		http.MethodPost,
		http.MethodPut,
		http.MethodPatch,
		http.MethodDelete,
		http.MethodHead,
		http.MethodOptions,
	}
)

func genAPIs(path string, item *openapi3.PathItem) ([]*API, error) {
	apis := make([]*API, 0, 8)
	for _, method := range validMethods {
		opt := item.GetOperation(method)
		if opt == nil {
			continue
		}
		api, err := genAPI(method, path, opt, item.Parameters)
		if err != nil {
			return nil, err
		}
		apis = append(apis, api)
	}
	return apis, nil
}

func genAPI(method string, path string, opt *openapi3.Operation, params openapi3.Parameters) (*API, error) {
	api := &API{
		Method:      method,
		Path:        path,
		Summary:     opt.Summary,
		Description: opt.Description,
		Params:      make([]*openapi3.Parameter, 0, len(params)+len(opt.Parameters)),
	}
	if api.Summary == "" {
		api.Summary = opt.Description
	}
	parameters := make([]*openapi3.ParameterRef, 0, len(params)+len(opt.Parameters))
	parameters = append(parameters, opt.Parameters...)
	parameters = append(parameters, params...)
	for _, param := range parameters {
		if param.Value != nil {
			api.Params = append(api.Params, param.Value)
		}
	}
	if opt.RequestBody != nil && opt.RequestBody.Value != nil && opt.RequestBody.Value.Content != nil {
		for mediaType, media := range opt.RequestBody.Value.Content {
			if media != nil && media.Schema != nil {
				api.ContentType = mediaType
				body, err := recurseSchemaRef(media.Schema)
				if err != nil {
					return nil, err
				}
				api.Body = body
			}
		}
	}

	return api, nil
}

func recurseSchemaRef(ref *openapi3.SchemaRef) (map[string]interface{}, error) {
	if ref == nil || ref.Value == nil {
		return nil, nil
	}
	data, err := json.Marshal(ref.Value)
	if err != nil {
		return nil, err
	}
	m := make(map[string]interface{})
	err = json.Unmarshal(data, &m)
	if err != nil {
		return nil, err
	}

	if ref.Value.Properties != nil {
		m["properties"] = make(map[string]interface{})
		for k, v := range ref.Value.Properties {
			v, err := recurseSchemaRef(v)
			if err != nil {
				return nil, err
			}
			m["properties"].(map[string]interface{})[k] = v
		}
	}
	if ref.Value.Items != nil {
		v, err := recurseSchemaRef(ref.Value.Items)
		if err != nil {
			return nil, err
		}
		m["items"] = v
	}

	return m, nil
}
