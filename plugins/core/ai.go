package core

import (
	"net/http"

	"github.com/APIParkLab/APIPark/resources/access"

	"github.com/eolinker/go-common/pm3"
)

func (p *plugin) aiAPIs() []pm3.Api {
	return []pm3.Api{
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/ai/providers", []string{"context"}, []string{"providers"}, p.aiProviderController.Providers, access.SystemSettingsAiProviderView),
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/simple/ai/providers", []string{"context"}, []string{"providers"}, p.aiProviderController.SimpleProviders),
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/ai/provider/config", []string{"context", "query:provider"}, []string{"provider"}, p.aiProviderController.Provider, access.SystemSettingsAiProviderView),
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/ai/provider/llms", []string{"context", "query:provider"}, []string{"llms", "provider"}, p.aiProviderController.LLMs),
		//pm3.CreateApiWidthDoc(http.MethodPut, "/api/v1/ai/provider/enable", []string{"context", "query:provider"}, nil, p.aiProviderController.isStop),
		//pm3.CreateApiWidthDoc(http.MethodPut, "/api/v1/ai/provider/disable", []string{"context", "query:provider"}, nil, p.aiProviderController.Disable),
		pm3.CreateApiWidthDoc(http.MethodPut, "/api/v1/ai/provider/config", []string{"context", "query:provider", "body"}, nil, p.aiProviderController.UpdateProviderConfig, access.SystemSettingsAiProviderManager),
		//pm3.CreateApiWidthDoc(http.MethodPut, "/api/v1/ai/provider/default-llm", []string{"context", "query:provider", "body"}, nil, p.aiProviderController.UpdateProviderDefaultLLM),
	}
}
