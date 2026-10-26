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

	// allOf/oneOf/anyOf 的分支同样需要展开，否则 json.Marshal 只会保留
	// {"$ref": "..."}，无法拿到真实 schema。
	for _, c := range []struct {
		key  string
		refs openapi3.SchemaRefs
	}{
		{"allOf", ref.Value.AllOf},
		{"oneOf", ref.Value.OneOf},
		{"anyOf", ref.Value.AnyOf},
	} {
		if len(c.refs) == 0 {
			continue
		}
		branches := make([]interface{}, 0, len(c.refs))
		for _, sub := range c.refs {
			v, err := recurseSchemaRef(sub)
			if err != nil {
				return nil, err
			}
			branches = append(branches, v)
		}
		m[c.key] = branches
	}

	return m, nil
}

// schemaRequired 读取 schema 的 required 字段，兼容 json 反序列化产生的
// []interface{} 与本包展平后写回的 []string。
func schemaRequired(schema map[string]interface{}) []string {
	switch names := schema["required"].(type) {
	case []string:
		return names
	case []interface{}:
		res := make([]string, 0, len(names))
		for _, name := range names {
			if s, ok := name.(string); ok {
				res = append(res, s)
			}
		}
		return res
	}
	return nil
}

// flattenBodySchema 将请求体 schema 中的组合关键字展平，使其能转换为 MCP Tool 的扁平入参：
//   - allOf：所有分支都必须满足，合并各分支的 properties 与 required；
//   - oneOf / anyOf：只需满足其中一个分支，合并各分支的 properties，但不继承 required。
//
// 分支内的 $ref 已由 recurseSchemaRef 展开。
func flattenBodySchema(schema map[string]interface{}) map[string]interface{} {
	if schema == nil {
		return nil
	}
	out := make(map[string]interface{}, len(schema))
	for k, v := range schema {
		if k == "allOf" || k == "oneOf" || k == "anyOf" {
			continue
		}
		out[k] = v
	}

	properties := make(map[string]interface{})
	required := make([]string, 0)
	requiredSet := make(map[string]struct{})
	addRequired := func(names []string) {
		for _, name := range names {
			if _, has := requiredSet[name]; has {
				continue
			}
			requiredSet[name] = struct{}{}
			required = append(required, name)
		}
	}
	if props, ok := out["properties"].(map[string]interface{}); ok {
		for k, v := range props {
			if m, ok := v.(map[string]interface{}); ok {
				properties[k] = flattenBodySchema(m)
				continue
			}
			properties[k] = v
		}
	}
	addRequired(schemaRequired(out))

	branches := func(key string) []map[string]interface{} {
		items, ok := schema[key].([]interface{})
		if !ok {
			return nil
		}
		res := make([]map[string]interface{}, 0, len(items))
		for _, item := range items {
			if m, ok := item.(map[string]interface{}); ok {
				res = append(res, m)
			}
		}
		return res
	}
	merge := func(branch map[string]interface{}, inheritRequired bool) {
		branch = flattenBodySchema(branch)
		if props, ok := branch["properties"].(map[string]interface{}); ok {
			for k, v := range props {
				if _, has := properties[k]; !has {
					properties[k] = v
				}
			}
		}
		if inheritRequired {
			addRequired(schemaRequired(branch))
		}
	}
	for _, branch := range branches("allOf") {
		merge(branch, true)
	}
	for _, branch := range branches("oneOf") {
		merge(branch, false)
	}
	for _, branch := range branches("anyOf") {
		merge(branch, false)
	}

	if len(properties) > 0 {
		out["properties"] = properties
		if _, has := out["type"]; !has {
			out["type"] = "object"
		}
	}
	if len(required) > 0 {
		out["required"] = required
	} else {
		delete(out, "required")
	}
	return out
}
