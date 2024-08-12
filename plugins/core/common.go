package core

import (
	"github.com/eolinker/go-common/ignore"
	"github.com/eolinker/go-common/pm3"
	"net/http"
)

func (p *plugin) commonApis() []pm3.Api {
	ignore.IgnorePath("login", http.MethodGet, "/api/v1/common/version")
	return []pm3.Api{
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/common/version", []string{"context"}, []string{"version", "build_time"}, p.commonController.Version),
	}
}
