package ai_api

import (
	ai_api_dto "github.com/APIParkLab/APIPark/module/ai-api/dto"
	"github.com/getkin/kin-openapi/openapi3"
)

func genOpenAPI3Template(title string, description string) *openapi3.T {
	result := new(openapi3.T)
	result.OpenAPI = "3.1.0"
	result.Info = &openapi3.Info{
		Title:       title,
		Description: description,
		Version:     "beta",
	}

	result.Components = components
	result.Paths = new(openapi3.Paths)
	return result
}

func genOperation(summary string, description string, variables []*ai_api_dto.AiPromptVariable) *openapi3.Operation {
	operation := openapi3.NewOperation()
	//operation.Parameters = genRequestParameters(variables)
	operation.Summary = summary
	operation.Description = description
	operation.RequestBody = genRequestBody(variables)
	operation.Responses = &openapi3.Responses{}
	operation.Responses.Set("200", genResponse())
	return operation
}

func genRequestParameters(variables []*ai_api_dto.AiPromptVariable) openapi3.Parameters {
	return openapi3.Parameters{
		{
			Value: &openapi3.Parameter{
				Name:        "variables",
				In:          "body",
				Description: "Replace the variable list of Prompt", // 替换Prompt的变量列表
				Schema:      genVariableSchema(variables).NewRef(),
				Required:    true,
			},
		},
		{
			Value: &openapi3.Parameter{
				Name:        "messages",
				In:          "body",
				Description: "Chat Message",
				Schema:      messagesSchemaRef,
				Required:    true,
			},
		},
	}
}

func genRequestBody(variables []*ai_api_dto.AiPromptVariable) *openapi3.RequestBodyRef {
	requestBody := openapi3.NewRequestBody()
	requestBody.Content = openapi3.NewContentWithSchema(genRequestBodySchema(variables), []string{"application/json"})
	return &openapi3.RequestBodyRef{
		Value: requestBody,
	}
}

func genResponse() *openapi3.ResponseRef {
	response := openapi3.NewResponse()
	response.Content = openapi3.NewContentWithJSONSchemaRef(responseSchemaRef)
	description := "Response from the server"
	response.Description = &description
	return &openapi3.ResponseRef{
		Value: response,
	}
}

func genRequestBodySchema(variables []*ai_api_dto.AiPromptVariable) *openapi3.Schema {
	result := openapi3.NewObjectSchema()
	result.WithProperty("variables", genVariableSchema(variables))
	result.WithPropertyRef("messages", messagesSchemaRef)
	result.WithRequired([]string{"variables", "messages"})
	return result
}

func genVariableSchema(variables []*ai_api_dto.AiPromptVariable) *openapi3.Schema {
	variableSchema := openapi3.NewObjectSchema()
	required := make([]string, 0, len(variables))
	for _, v := range variables {
		val := openapi3.NewStringSchema()
		val.Example = ""
		val.Description = v.Description
		if v.Require {
			required = append(required, v.Key)
		}
		variableSchema.WithProperty(v.Key, val)
	}
	variableSchema.WithRequired(required)
	return variableSchema
}

func genComponents() *openapi3.Components {
	result := openapi3.NewComponents()
	result.Schemas = make(openapi3.Schemas)
	result.Schemas["Message"] = messageSchema.NewRef()
	result.Schemas["Messages"] = messagesSchema.NewRef()
	result.Schemas["Response"] = responseSchema.NewRef()
	return &result
}

var (
	messageSchema     *openapi3.Schema
	messagesSchema    *openapi3.Schema
	messageSchemaRef  *openapi3.SchemaRef
	messagesSchemaRef *openapi3.SchemaRef
	responseSchema    *openapi3.Schema
	responseSchemaRef *openapi3.SchemaRef
	components        *openapi3.Components
)

func init() {
	messageSchema = genMessageSchema()
	messagesSchema = genMessagesSchema()
	messageSchemaRef = openapi3.NewSchemaRef("#/components/schemas/Message", messageSchema)
	messagesSchemaRef = openapi3.NewSchemaRef("#/components/schemas/Messages", messagesSchema)

	responseSchema = genResponseSchema()
	components = genComponents()
	responseSchemaRef = openapi3.NewSchemaRef("#/components/schemas/Response", responseSchema)
}

func genMessageSchema() *openapi3.Schema {
	result := openapi3.NewObjectSchema()
	result.Title = "Message"
	result.Description = "Chat Message"
	roleSchema := openapi3.NewStringSchema()
	roleSchema.Description = "Role of the message sender"
	roleSchema.Example = "assistant"
	contentSchema := openapi3.NewStringSchema()
	contentSchema.Description = "The message content"
	contentSchema.Example = "Hello, how can I help you?"
	result.WithProperties(map[string]*openapi3.Schema{
		"role":    roleSchema,
		"content": contentSchema,
	})
	return result
}

func genMessagesSchema() *openapi3.Schema {
	result := openapi3.NewArraySchema()
	result.Title = "Messages"
	result.Description = "Chat Messages"
	result.Items = openapi3.NewSchemaRef("#/components/schemas/Message", messageSchema)
	return result
}

func genResponseSchema() *openapi3.Schema {
	result := openapi3.NewObjectSchema()
	result.Description = "Response from the server"
	result.WithPropertyRef("message", messageSchemaRef)
	openapi3.NewIntegerSchema()
	result.WithProperty("code", openapi3.NewIntegerSchema())
	result.WithProperty("error", openapi3.NewStringSchema())
	result.WithProperty("finish_reason", openapi3.NewStringSchema().WithEnum(
		"stop",
		"length",
		"function_call",
		"content_filter",
		"null",
	))

	return result
}
