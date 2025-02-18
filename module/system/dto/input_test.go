package system_dto

import (
	"log"
	"testing"
)

func TestMap(t *testing.T) {
	invokeAddress := "http://127.0.0.1:8080"
	ollamaAddress := "http://127.0.0.1:8081"
	input := &InputSetting{
		InvokeAddress: &invokeAddress,
		OllamaAddress: &ollamaAddress,
	}
	err := input.Validate()
	if err != nil {
		t.Error(err)
	}
	log.Println(ToKeyMap(input))
}
