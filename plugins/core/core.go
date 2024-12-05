package core

import (
	"net/http"

	"github.com/APIParkLab/APIPark/controller/log"

	"github.com/APIParkLab/APIPark/controller/strategy"

	"github.com/APIParkLab/APIPark/controller/ai"
	ai_api "github.com/APIParkLab/APIPark/controller/ai-api"
	"github.com/APIParkLab/APIPark/controller/monitor"
	"github.com/APIParkLab/APIPark/controller/router"
	"github.com/APIParkLab/APIPark/controller/system"

	plugin_cluster "github.com/APIParkLab/APIPark/controller/plugin-cluster"

	"github.com/APIParkLab/APIPark/controller/cluster"

	"github.com/eolinker/ap-account/controller/role"

	"github.com/APIParkLab/APIPark/controller/common"

	dynamic_module "github.com/APIParkLab/APIPark/controller/dynamic-module"

	"github.com/APIParkLab/APIPark/controller/release"

	application_authorization "github.com/APIParkLab/APIPark/controller/application-authorization"

	"github.com/APIParkLab/APIPark/controller/subscribe"

	"github.com/APIParkLab/APIPark/controller/upstream"

	"github.com/APIParkLab/APIPark/controller/service"

	"github.com/APIParkLab/APIPark/controller/catalogue"

	"github.com/APIParkLab/APIPark/controller/my_team"

	"github.com/APIParkLab/APIPark/controller/certificate"
	"github.com/APIParkLab/APIPark/controller/team_manager"
	"github.com/eolinker/go-common/autowire"
	"github.com/eolinker/go-common/pm3"
)

func init() {
	pm3.Register("core", new(Driver))
}

type Driver struct {
}

func (d *Driver) Access() map[string][]string {
	return map[string][]string{}
}

func (d *Driver) Create() (pm3.IPlugin, error) {

	p := new(plugin)
	autowire.Autowired(p)
	return p, nil
}

type plugin struct {
	clusterController           cluster.IClusterController                         `autowired:""`
	certificateController       certificate.ICertificateController                 `autowired:""`
	teamManagerController       team_manager.ITeamManagerController                `autowired:""`
	myTeamController            my_team.ITeamController                            `autowired:""`
	appController               service.IAppController                             `autowired:""`
	serviceController           service.IServiceController                         `autowired:""`
	monitorStatisticController  monitor.IMonitorStatisticController                `autowired:""`
	monitorConfigController     monitor.IMonitorConfigController                   `autowired:""`
	catalogueController         catalogue.ICatalogueController                     `autowired:""`
	upstreamController          upstream.IUpstreamController                       `autowired:""`
	routerController            router.IRouterController                           `autowired:""`
	aiAPIController             ai_api.IAPIController                              `autowired:""`
	apiDocController            router.IAPIDocController                           `autowired:""`
	subscribeController         subscribe.ISubscribeController                     `autowired:""`
	strategyController          strategy.IStrategyController                       `autowired:""`
	appAuthorizationController  application_authorization.IAuthorizationController `autowired:""`
	releaseController           release.IReleaseController                         `autowired:""`
	roleController              role.IRoleController                               `autowired:""`
	subscribeApprovalController subscribe.ISubscribeApprovalController             `autowired:""`
	dynamicModuleController     dynamic_module.IDynamicModuleController            `autowired:""`
	pluginClusterController     plugin_cluster.IPluginClusterController            `autowired:""`
	commonController            common.ICommonController                           `autowired:""`
	exportConfigController      system.IExportConfigController                     `autowired:""`
	importConfigController      system.IImportConfigController                     `autowired:""`
	aiProviderController        ai.IProviderController                             `autowired:""`
	settingController           system.ISettingController                          `autowired:""`
	initController              system.IInitController                             `autowired:""`
	logController               log.ILogController                                 `autowired:""`
	apis                        []pm3.Api
}

func (p *plugin) OnComplete() {
	p.apis = append(p.apis, p.certificateApi()...)
	p.apis = append(p.apis, p.clusterApi()...)
	p.apis = append(p.apis, p.TeamManagerApi()...)
	p.apis = append(p.apis, p.MyTeamApi()...)
	p.apis = append(p.apis, p.ServiceApis()...)
	p.apis = append(p.apis, p.catalogueApi()...)
	p.apis = append(p.apis, p.upstreamApis()...)
	p.apis = append(p.apis, p.apiApis()...)
	p.apis = append(p.apis, p.subscribeApis()...)
	p.apis = append(p.apis, p.appAuthorizationApis()...)
	p.apis = append(p.apis, p.releaseApis()...)
	p.apis = append(p.apis, p.DynamicModuleApis()...)
	p.apis = append(p.apis, p.monitorStatisticApis()...)
	p.apis = append(p.apis, p.PartitionPluginApi()...)
	p.apis = append(p.apis, p.commonApis()...)
	p.apis = append(p.apis, p.systemApis()...)
	p.apis = append(p.apis, p.aiAPIs()...)
	p.apis = append(p.apis, p.strategyApis()...)
	p.apis = append(p.apis, p.logApis()...)
}

func (p *plugin) Name() string {
	return "core"
}

func (p *plugin) APis() []pm3.Api {
	return p.apis
}

func (p *plugin) Assets() map[string]http.FileSystem {
	return nil
}
