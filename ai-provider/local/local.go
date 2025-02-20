package ai_provider_local

import (
	"net/http"
	"net/url"

	"github.com/ollama/ollama/api"
)

var (
	client *api.Client
)

func ResetOllamaAddress(address string) error {
	u, err := url.Parse(address)
	if err != nil {
		return err
	}
	client = api.NewClient(u, http.DefaultClient)
	return nil
}
