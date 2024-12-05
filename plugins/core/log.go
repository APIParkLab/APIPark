package core

import (
	"net/http"

	"github.com/eolinker/go-common/pm3"
)

func (p *plugin) logApis() []pm3.Api {
	return []pm3.Api{
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/log/:driver", []string{"context", "rest:driver"}, []string{"info"}, p.logController.Get),
		pm3.CreateApiWidthDoc(http.MethodPost, "/api/v1/log/:driver", []string{"context", "rest:driver", "body"}, nil, p.logController.Save),
	}
}
