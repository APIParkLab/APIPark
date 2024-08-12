package permit

import (
	"github.com/APIParkLab/APIPark/controller/permit_system"
	"github.com/APIParkLab/APIPark/controller/permit_team"
	permit_middleware "github.com/APIParkLab/APIPark/middleware/permit"
	"github.com/eolinker/go-common/autowire"
	"github.com/eolinker/go-common/pm3"
)

var (
	_ pm3.IPluginApis       = (*pluginPermit)(nil)
	_ pm3.IPluginMiddleware = (*pluginPermit)(nil)
	_ autowire.Complete     = (*pluginPermit)(nil)
)

type pluginPermit struct {
	systemPermitController permit_system.ISystemPermitController `autowired:""`
	teamPermitController   permit_team.ITeamPermitController     `autowired:""`
	apis                   []pm3.Api
	middlewares            []pm3.IMiddleware
	permitChecker          permit_middleware.IPermitMiddleware `autowired:""`
}

func (p *pluginPermit) OnComplete() {
	p.apis = append(p.apis, p.getSystemApis()...)
	p.apis = append(p.apis, p.getSTeamPermitApis()...)
	p.middlewares = append(p.middlewares, p.permitChecker)
}

func (p *pluginPermit) APis() []pm3.Api {
	return p.apis
}

func (p *pluginPermit) Middlewares() []pm3.IMiddleware {
	return p.middlewares
}

func (p *pluginPermit) Name() string {
	return "permit"
}
