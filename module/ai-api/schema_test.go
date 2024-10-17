package ai_api

import (
	"fmt"
	"net/http"
	"testing"

	ai_api_dto "github.com/APIParkLab/APIPark/module/ai-api/dto"
)

func TestSchemaBuild(t *testing.T) {
	// TODO
	doc := genOpenAPI3Template("test", "test")
	variables := []*ai_api_dto.AiPromptVariable{
		{
			Key:         "query",
			Description: "测试参数",
			Require:     true,
		},
	}
	doc.AddOperation("/test", http.MethodPost, genOperation("测试接口", "这是一个测试接口", variables))
	data, err := doc.MarshalJSON()
	if err != nil {
		t.Fatal(err)
	}
	fmt.Println(string(data))
}
