package access

import (
	_ "embed"

	yaml "gopkg.in/yaml.v3"

	"github.com/eolinker/go-common/access"
)

type Access = access.Access

var (
	//go:embed access.yaml
	data []byte
)

func init() {
	ts := make(map[string][]Access)
	err := yaml.Unmarshal(data, &ts)
	if err != nil {
		panic(err)
	}
	for group, asl := range ts {
		access.Add(group, asl)

	}
}

const (
	SystemAnalysisRunViewView             = "system.analysis.run_view.view"
	SystemApiPortalApiPortalView          = "system.api_portal.api_portal.view"
	SystemSettingsAccountManager          = "system.settings.account.manager"
	SystemSettingsAccountView             = "system.settings.account.view"
	SystemSettingsAiProviderManager       = "system.settings.ai_provider.manager"
	SystemSettingsAiProviderView          = "system.settings.ai_provider.view"
	SystemSettingsApiGatewayManager       = "system.settings.api_gateway.manager"
	SystemSettingsApiGatewayView          = "system.settings.api_gateway.view"
	SystemSettingsDataSourceManager       = "system.settings.data_source.manager"
	SystemSettingsDataSourceView          = "system.settings.data_source.view"
	SystemSettingsGeneralManager          = "system.settings.general.manager"
	SystemSettingsGeneralView             = "system.settings.general.view"
	SystemSettingsLogConfigurationManager = "system.settings.log_configuration.manager"
	SystemSettingsLogConfigurationView    = "system.settings.log_configuration.view"
	SystemSettingsRoleView                = "system.settings.role.view"
	SystemSettingsSslCertificateManager   = "system.settings.ssl_certificate.manager"
	SystemSettingsSslCertificateView      = "system.settings.ssl_certificate.view"
	SystemWorkspaceApplicationManagerAll  = "system.workspace.application.manager_all"
	SystemWorkspaceApplicationViewAll     = "system.workspace.application.view_all"
	SystemWorkspaceServiceManagerAll      = "system.workspace.service.manager_all"
	SystemWorkspaceServiceViewAll         = "system.workspace.service.view_all"
	SystemWorkspaceTeamCreate             = "system.workspace.team.create"
	SystemWorkspaceTeamManager            = "system.workspace.team.manager"
	SystemWorkspaceTeamViewAll            = "system.workspace.team.view_all"
)

const (
	TeamConsumerApplicationManager            = "team.consumer.application.manager"
	TeamConsumerAuthorizationManager          = "team.consumer.authorization.manager"
	TeamConsumerAuthorizationView             = "team.consumer.authorization.view"
	TeamConsumerSubscriptionManagerSubscribed = "team.consumer.subscription.manager_subscribed_services"
	TeamConsumerSubscriptionSubscribe         = "team.consumer.subscription.subscribe"
	TeamConsumerSubscriptionViewSubscribed    = "team.consumer.subscription.view_subscribed_service"
	TeamServiceApiManager                     = "team.service.api.manager"
	TeamServiceApiView                        = "team.service.api.view"
	TeamServiceApiDocManager                  = "team.service.api_doc.manager"
	TeamServiceApiDocView                     = "team.service.api_doc.view"
	TeamServiceReleaseManager                 = "team.service.release.manager"
	TeamServiceReleaseView                    = "team.service.release.view"
	TeamServiceServiceManager                 = "team.service.service.manager"
	TeamServiceServiceIntroManager            = "team.service.service_intro.manager"
	TeamServiceServiceIntroView               = "team.service.service_intro.view"
	TeamServiceSubscriptionManager            = "team.service.subscription.manager"
	TeamServiceSubscriptionView               = "team.service.subscription.view"
	TeamServiceUpstreamManager                = "team.service.upstream.manager"
	TeamServiceUpstreamView                   = "team.service.upstream.view"
	TeamTeamConsumerManager                   = "team.team.consumer.manager"
	TeamTeamConsumerView                      = "team.team.consumer.view"
	TeamTeamMemberManager                     = "team.team.member.manager"
	TeamTeamMemberView                        = "team.team.member.view"
	TeamTeamServiceManager                    = "team.team.service.manager"
	TeamTeamServiceView                       = "team.team.service.view"
	TeamTeamTeamManager                       = "team.team.team.manager"
	TeamTeamTeamView                          = "team.team.team.view"
)
