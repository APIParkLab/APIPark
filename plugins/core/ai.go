package core

import (
	"net/http"

	"github.com/APIParkLab/APIPark/resources/access"

	"github.com/eolinker/go-common/pm3"
)

func (p *plugin) aiAPIs() []pm3.Api {
	return []pm3.Api{
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/ai/providers/unconfigured", []string{"context"}, []string{"providers"}, p.aiProviderController.UnConfiguredProviders, access.SystemSettingsAiProviderView),
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/ai/providers/configured", []string{"context"}, []string{"providers", "backup"}, p.aiProviderController.ConfiguredProviders, access.SystemSettingsAiProviderView),
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/simple/ai/providers", []string{"context"}, []string{"providers"}, p.aiProviderController.SimpleProviders),
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/ai/provider/config", []string{"context", "query:provider"}, []string{"provider"}, p.aiProviderController.Provider, access.SystemSettingsAiProviderView),
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/simple/ai/provider", []string{"context", "query:provider"}, []string{"provider"}, p.aiProviderController.SimpleProvider),
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/ai/provider/llms", []string{"context", "query:provider"}, []string{"llms", "provider"}, p.aiProviderController.LLMs),
		pm3.CreateApiWidthDoc(http.MethodPut, "/api/v1/ai/provider/sort", []string{"context", "body"}, nil, p.aiProviderController.Sort),
		pm3.CreateApiWidthDoc(http.MethodPut, "/api/v1/ai/provider/config", []string{"context", "query:provider", "body"}, nil, p.aiProviderController.UpdateProviderConfig, access.SystemSettingsAiProviderManager),

		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/ai/apis", []string{"context", "query:keyword", "query:provider", "query:start", "query:end", "query:page", "query:page_size", "query:sort", "query:asc"}, []string{"apis", "total"}, p.aiStatisticController.APIs),
	}
}

func (p *plugin) aiKeyApis() []pm3.Api {
	return []pm3.Api{
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/ai/resource/key", []string{"context", "query:provider", "query:id"}, []string{"info"}, p.aiKeyController.Get),
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/ai/resource/keys", []string{"context", "query:provider", "query:keyword", "query:page", "query:page_size"}, []string{"keys", "total"}, p.aiKeyController.List),
		pm3.CreateApiWidthDoc(http.MethodPost, "/api/v1/ai/resource/key", []string{"context", "query:provider", "body"}, nil, p.aiKeyController.Create),
		pm3.CreateApiWidthDoc(http.MethodPut, "/api/v1/ai/resource/key", []string{"context", "query:provider", "query:id", "body"}, nil, p.aiKeyController.Edit),
		pm3.CreateApiWidthDoc(http.MethodDelete, "/api/v1/ai/resource/key", []string{"context", "query:provider", "query:id"}, nil, p.aiKeyController.Delete),
		pm3.CreateApiWidthDoc(http.MethodPut, "/api/v1/ai/resource/key/enable", []string{"context", "query:provider", "query:id"}, nil, p.aiKeyController.Enable),
		pm3.CreateApiWidthDoc(http.MethodPut, "/api/v1/ai/resource/key/disable", []string{"context", "query:provider", "query:id"}, nil, p.aiKeyController.Disable),
		pm3.CreateApiWidthDoc(http.MethodPut, "/api/v1/ai/resource/key/sort", []string{"context", "query:provider", "body"}, nil, p.aiKeyController.Sort),
	}
}
