package publish_flow

import (
	"net/http"

	"github.com/eolinker/go-common/pm3"
)

func (p *plugin) getApis() []pm3.Api {
	return []pm3.Api{
		pm3.CreateApiWidthDoc(http.MethodPost, "/api/v1/service/publish/release", []string{"context", "query:service", "body"}, []string{"publish"}, p.controller.ApplyOnRelease),
		pm3.CreateApiWidthDoc(http.MethodPost, "/api/v1/service/publish/release/do", []string{"context", "query:service", "body"}, []string{"publish"}, p.controller.ReleaseDo),
		pm3.CreateApiWidthDoc(http.MethodPost, "/api/v1/service/publish/apply", []string{"context", "query:service", "body"}, []string{"publish"}, p.controller.Apply),
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/service/publishs", []string{"context", "query:service", "query:page", "query:page_size"}, []string{"publishs", "page", "size", "total"}, p.controller.ListPage),
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/service/publish", []string{"context", "query:service", "query:id"}, []string{"publish"}, p.controller.Detail),
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/service/publish/check", []string{"context", "query:service", "query:release"}, []string{"diffs"}, p.controller.CheckPublish),
		pm3.CreateApiWidthDoc(http.MethodDelete, "/api/v1/service/publish/close", []string{"context", "query:service", "query:id"}, []string{}, p.controller.Close),
		pm3.CreateApiWidthDoc(http.MethodDelete, "/api/v1/service/publish/stop", []string{"context", "query:service", "query:id"}, []string{}, p.controller.Stop),
		pm3.CreateApiWidthDoc(http.MethodPut, "/api/v1/service/publish/refuse", []string{"context", "query:service", "query:id", "body"}, []string{}, p.controller.Refuse),
		pm3.CreateApiWidthDoc(http.MethodPut, "/api/v1/service/publish/accept", []string{"context", "query:service", "query:id", "body"}, []string{}, p.controller.Accept),
		pm3.CreateApiWidthDoc(http.MethodPut, "/api/v1/service/publish/execute", []string{"context", "query:service", "query:id"}, []string{}, p.controller.Publish),
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/service/publish/status", []string{"context", "query:service", "query:id"}, []string{"publish_status_list"}, p.controller.PublishStatuses),
	}
}
