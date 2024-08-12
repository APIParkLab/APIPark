package publish_flow

import (
	"github.com/APIParkLab/APIPark/controller/publish"
	"github.com/eolinker/go-common/autowire"
	"github.com/eolinker/go-common/pm3"
)

var (
	_ pm3.IPluginApis   = (*plugin)(nil)
	_ autowire.Complete = (*plugin)(nil)
)

type plugin struct {
	controller publish.IPublishController `autowired:""`
	apis       []pm3.Api
}

func (p *plugin) Name() string {
	return "publish_flow"
}

func (p *plugin) OnComplete() {
	p.apis = append(p.apis, p.getApis()...)
}

func (p *plugin) APis() []pm3.Api {
	return p.apis
}
