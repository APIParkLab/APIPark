package ai_provider_local

import (
	"net/http"
	"net/url"

	"github.com/eolinker/eosc/env"
	"github.com/ollama/ollama/api"
)

var (
	ollamaAddress    = "http://127.0.0.1:11434"
	EnvOllamaAddress = "OLLAMA_ADDRESS"
	client           *api.Client
)

func init() {
	address, has := env.GetEnv(EnvOllamaAddress)
	if !has {
		address = ollamaAddress
	}
	u, err := url.Parse(address)
	if err != nil {
		u, err = url.Parse(ollamaAddress)
		if err != nil {
			panic(err)
		}
	}
	client = api.NewClient(u, http.DefaultClient)
}
