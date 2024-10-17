package model_runtime

import "testing"

func TestLoad(t *testing.T) {
	Load()
	for _, p := range Providers() {
		t.Logf("Provider: %s", p.ID())
		t.Log(p.DefaultModel("llm"))
	}
}
