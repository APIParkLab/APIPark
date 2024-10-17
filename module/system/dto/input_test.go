package system_dto

import (
	"log"
	"testing"
)

func TestMap(t *testing.T) {

	input := &InputSetting{
		InvokeAddress: "http://127.0.0.1:8080",
	}
	err := input.Validate()
	if err != nil {
		t.Error(err)
	}
	log.Println(ToKeyMap(input))
}
