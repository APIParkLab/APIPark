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
	result.Components = genComponents()
	result.Paths = new(openapi3.Paths)
	return result
}

func genOperation(description string, variables []*ai_api_dto.AiPromptVariable) *openapi3.Operation {
	operation := openapi3.NewOperation()
	operation.RequestBody = genRequestBody(variables)
	operation.Responses = &openapi3.Responses{}
	operation.Responses.Set("200", genResponse())
	operation.Description = description
	return operation
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
	response.Content = openapi3.NewContentWithSchema(genResponseSchema(), []string{"application/json"})
	description := "Response from the server"
	response.Description = &description
	return &openapi3.ResponseRef{
		Value: response,
	}
}

func genRequestBodySchema(variables []*ai_api_dto.AiPromptVariable) *openapi3.Schema {
	result := openapi3.NewObjectSchema()
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
	result.WithProperty("variables", variableSchema.WithRequired(required))
	result.WithProperty("messages", genMessageSchema())
	result.WithRequired([]string{"variables", "messages"})
	return result
}

func genComponents() *openapi3.Components {
	components := openapi3.NewComponents()
	components.Schemas = make(openapi3.Schemas)
	components.Schemas["Message"] = genMessageSchema().NewRef()
	components.Schemas["Response"] = genResponseSchema().NewRef()
	return &components
}

func genMessageSchema() *openapi3.Schema {
	messageSchema := openapi3.NewObjectSchema()
	messageSchema.Title = "Message"
	messageSchema.Description = "Chat Message"
	roleSchema := openapi3.NewStringSchema()
	roleSchema.Description = "Role of the message sender"
	roleSchema.Example = "assistant"
	contentSchema := openapi3.NewStringSchema()
	contentSchema.Description = "The message content"
	contentSchema.Example = "Hello, how can I help you?"
	messageSchema.WithProperties(map[string]*openapi3.Schema{
		"role":    roleSchema,
		"content": contentSchema,
	})
	return messageSchema
}

func genResponseSchema() *openapi3.Schema {
	responseSchema := openapi3.NewObjectSchema()
	responseSchema.Description = "Response from the server"
	responseSchema.WithPropertyRef("message", openapi3.NewSchemaRef("#/components/schemas/Message", genMessageSchema()))
	responseSchema.WithProperty("code", openapi3.NewInt32Schema().WithMin(0))
	responseSchema.WithProperty("error", openapi3.NewStringSchema())
	responseSchema.WithProperty("finish_reason", openapi3.NewStringSchema().WithEnum([]string{
		"stop",
		"length",
		"function_call",
		"content_filter",
		"null",
	}))
	return responseSchema
}
