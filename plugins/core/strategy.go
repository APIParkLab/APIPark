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
		pm3.CreateApiWidthDoc(http.MethodPut, "/api/v1/strategy/global/:driver/enable", []string{"context", "query:strategy"}, nil, p.strategyController.EnableStrategy),
		pm3.CreateApiWidthDoc(http.MethodPut, "/api/v1/strategy/global/:driver/disable", []string{"context", "query:strategy"}, nil, p.strategyController.DisableStrategy),

		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/strategy/service/:driver/list", []string{"context", "query:keyword", "query:service", "rest:driver", "query:page", "query:page_size", "query:order", "query:sort", "query:filters"}, []string{"list", "total"}, p.strategyController.ServiceStrategyList),
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/strategy/service/:driver", []string{"context", "query:strategy"}, []string{"strategy"}, p.strategyController.GetStrategy),
		pm3.CreateApiWidthDoc(http.MethodPost, "/api/v1/strategy/service/:driver", []string{"context", "query:service", "rest:driver", "body"}, nil, p.strategyController.CreateServiceStrategy),
		pm3.CreateApiWidthDoc(http.MethodPut, "/api/v1/strategy/service/:driver/enable", []string{"context", "query:strategy"}, nil, p.strategyController.EnableStrategy),
		pm3.CreateApiWidthDoc(http.MethodPut, "/api/v1/strategy/service/:driver/disable", []string{"context", "query:strategy"}, nil, p.strategyController.DisableStrategy),
	}
}
