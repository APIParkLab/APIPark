package openapi

import (
	application_authorization "github.com/APIParkLab/APIPark/controller/application-authorization"
	"github.com/APIParkLab/APIPark/controller/mcp"
	"github.com/eolinker/go-common/pm3"
)

var (
	_ pm3.IPlugin           = (*plugin)(nil)
	_ pm3.IPluginMiddleware = (*plugin)(nil)
)

type plugin struct {
	apis                    []pm3.Api
	authorizationController application_authorization.IAuthorizationController `autowired:""`
	mcpController           mcp.IMcpController                                 `autowired:""`
}

func (p *plugin) Middlewares() []pm3.IMiddleware {
	return []pm3.IMiddleware{
		openCheck,
	}
}

func (p *plugin) APis() []pm3.Api {
	return p.apis
}

func (p *plugin) Name() string {
	return "openapi"
}
func (p *plugin) OnComplete() {
	p.apis = p.appAuthorizationApis()
	p.apis = append(p.apis, p.mcpAPIs()...)
}
