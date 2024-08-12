package permit

import (
	"net/http"

	"github.com/eolinker/go-common/pm3"
)

func (p *pluginPermit) getSystemApis() []pm3.Api {
	return []pm3.Api{
		pm3.CreateApiWidthDoc(http.MethodGet, "/api/v1/profile/permission/system", []string{"context"}, []string{"access"}, p.systemPermitController.Permissions),
	}
}
