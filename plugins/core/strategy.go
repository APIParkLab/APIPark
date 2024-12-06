package core

import (
	"net/http"

	"github.com/eolinker/go-common/pm3"
)

func (p *plugin) strategyApis() []pm3.Api {
	return []pm3.Api{
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/strategy/global/:driver/list", []string{"context", "query:keyword", "rest:driver", "query:page", "query:page_size", "query:order", "query:sort", "query:filters"}, []string{"list", "total"}, p.strategyController.GlobalStrategyList),
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/strategy/global/:driver", []string{"context", "query:strategy"}, []string{"strategy"}, p.strategyController.GetStrategy),
		pm3.CreateApiWidthDoc(http.MethodPost, "/api/v1/strategy/global/:driver", []string{"context", "rest:driver", "body"}, nil, p.strategyController.CreateGlobalStrategy),
		pm3.CreateApiWidthDoc(http.MethodPut, "/api/v1/strategy/global/:driver", []string{"context", "query:strategy", "body"}, nil, p.strategyController.EditStrategy),
		pm3.CreateApiWidthDoc(http.MethodDelete, "/api/v1/strategy/global/:driver", []string{"context", "query:strategy"}, nil, p.strategyController.DeleteStrategy),
		pm3.CreateApiWidthDoc(http.MethodPatch, "/api/v1/strategy/global/:driver/enable", []string{"context", "query:strategy"}, nil, p.strategyController.EnableStrategy),
		pm3.CreateApiWidthDoc(http.MethodPatch, "/api/v1/strategy/global/:driver/disable", []string{"context", "query:strategy"}, nil, p.strategyController.DisableStrategy),
		pm3.CreateApiWidthDoc(http.MethodPost, "/api/v1/strategy/global/:driver/publish", []string{"context", "rest:driver"}, nil, p.strategyController.PublishGlobalStrategy),
		pm3.CreateApiWidthDoc(http.MethodPatch, "/api/v1/strategy/global/:driver/restore", []string{"context", "query:strategy"}, nil, p.strategyController.Restore),

		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/strategy/service/:driver/list", []string{"context", "query:keyword", "query:service", "rest:driver", "query:page", "query:page_size", "query:order", "query:sort", "query:filters"}, []string{"list", "total"}, p.strategyController.ServiceStrategyList),
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/strategy/service/:driver", []string{"context", "query:strategy"}, []string{"strategy"}, p.strategyController.GetStrategy),
		pm3.CreateApiWidthDoc(http.MethodPost, "/api/v1/strategy/service/:driver", []string{"context", "query:service", "rest:driver", "body"}, nil, p.strategyController.CreateServiceStrategy),
		pm3.CreateApiWidthDoc(http.MethodPut, "/api/v1/strategy/service/:driver", []string{"context", "query:strategy", "body"}, nil, p.strategyController.EditStrategy),
		pm3.CreateApiWidthDoc(http.MethodPatch, "/api/v1/strategy/service/:driver/enable", []string{"context", "query:strategy"}, nil, p.strategyController.EnableStrategy),
		pm3.CreateApiWidthDoc(http.MethodPatch, "/api/v1/strategy/service/:driver/disable", []string{"context", "query:strategy"}, nil, p.strategyController.DisableStrategy),
		pm3.CreateApiWidthDoc(http.MethodDelete, "/api/v1/strategy/service/:driver", []string{"context", "query:service", "query:strategy"}, nil, p.strategyController.DeleteServiceStrategy),
		pm3.CreateApiWidthDoc(http.MethodPatch, "/api/v1/strategy/service/:driver/restore", []string{"context", "query:strategy"}, nil, p.strategyController.Restore),

		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/strategy/global/filter-options", []string{"context"}, []string{"options"}, p.strategyController.FilterGlobalOptions),
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/strategy/service/filter-options", []string{"context"}, []string{"options"}, p.strategyController.FilterServiceOptions),
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/strategy/filter-remote/:name", []string{"context", "rest:name"}, []string{"titles", "list", "total", "key", "value"}, p.strategyController.FilterGlobalRemote),
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/strategy/service/filter-remote/:name", []string{"context", "query:service", "rest:name"}, []string{"titles", "list", "total", "key", "value"}, p.strategyController.FilterServiceRemote),

		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/strategy/global/:driver/to-publishs", []string{"context", "rest:driver"}, []string{"strategies", "source", "version_name", "is_publish"}, p.strategyController.ToPublish),
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/strategy/global/:driver/logs", []string{"context", "query:keyword", "query:strategy", "query:begin", "query:end", "query:page_size", "query:page"}, []string{"logs", "total"}, p.strategyController.GetStrategyLogs),
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/strategy/service/:driver/logs", []string{"context", "query:keyword", "query:strategy", "query:begin", "query:end", "query:page_size", "query:page"}, []string{"logs", "total"}, p.strategyController.GetStrategyLogs),
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/strategy/global/:driver/log", []string{"context", "query:log"}, []string{"log"}, p.strategyController.LogInfo),
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/strategy/service/:driver/log", []string{"context", "query:log"}, []string{"log"}, p.strategyController.LogInfo),
	}
}
