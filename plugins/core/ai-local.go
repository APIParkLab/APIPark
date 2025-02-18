package core

import (
	"net/http"

	"github.com/eolinker/go-common/pm3"
)

func (p *plugin) aiLocalApis() []pm3.Api {
	return []pm3.Api{
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/model/local/can_deploy", []string{"context", "query:keyword"}, []string{"models"}, p.aiLocalController.ListCanInstall),
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/model/local/list", []string{"context", "query:keyword"}, []string{"models"}, p.aiLocalController.Search),
		pm3.CreateApiSimple(http.MethodPost, "/api/v1/model/local/deploy", p.aiLocalController.Deploy),
		pm3.CreateApiWidthDoc(http.MethodPost, "/api/v1/model/local/deploy/start", []string{"context", "body"}, nil, p.aiLocalController.DeployStart),
		pm3.CreateApiWidthDoc(http.MethodPost, "/api/v1/model/local/cancel_deploy", []string{"context", "body"}, nil, p.aiLocalController.CancelDeploy),
		pm3.CreateApiWidthDoc(http.MethodDelete, "/api/v1/model/local", []string{"context", "query:model"}, nil, p.aiLocalController.RemoveModel),
		pm3.CreateApiWidthDoc(http.MethodPut, "/api/v1/model/local/info", []string{"context", "query:model", "body"}, nil, p.aiLocalController.Update),
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/model/local/state", []string{"context", "query:model"}, []string{"state", "info"}, p.aiLocalController.State),
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/simple/ai/models/local/configured", []string{"context"}, []string{"models"}, p.aiLocalController.SimpleList),

		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/model/local/source/ollama", []string{"context"}, []string{"config"}, p.aiLocalController.OllamaConfig),
		pm3.CreateApiWidthDoc(http.MethodPut, "/api/v1/model/local/source/ollama", []string{"context", "body"}, nil, p.aiLocalController.OllamaConfigUpdate),
	}
}
