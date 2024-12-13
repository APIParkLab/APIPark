// denied - 禁用； granted - 拥有权限
// 条件 anyOf/oneOf/anyOf/not
// 维度 backend - 后端的权限字段;

export const PERMISSION_DEFINITION = [
    {
      "system.settings.account.view": {
        "granted": {
          "anyOf": [{ "backend": ["system.settings.account.view"] }]
        }
      },
      "system.organization.member.add": {
        "granted": {
          "anyOf": [{ "backend": ["system.settings.account.manager"] }]
        }
      },
      "system.organization.member.edit": {
        "granted": {
          "anyOf": [{ "backend": ["system.settings.account.manager"] }]
        }
      },
      "system.organization.member.remove": {
        "granted": {
          "anyOf": [{ "backend": ["system.settings.account.manager"] }]
        }
      },
      "system.organization.member.delete": {
        "granted": {
          "anyOf": [{ "backend": ["system.settings.account.manager"] }]
        }
      },
      "system.organization.member.block": {
        "granted": {
          "anyOf": [{ "backend": ["system.settings.account.manager"] }]
        }
      },
      "system.organization.member.department.add": {
        "granted": {
          "anyOf": [{ "backend": ["system.settings.account.manager"] }]
        }
      },
      "system.organization.member.department.edit": {
        "granted": {
          "anyOf": [{ "backend": ["system.settings.account.manager"] }]
        }
      },
      "system.organization.member.department.delete": {
        "granted": {
          "anyOf": [{ "backend": ["system.settings.account.manager"] }]
        }
      },
      "system.workspace.team.view_all": {
        "granted": {
          "anyOf": [{ "backend": ["system.workspace.team.view_all"] }]
        }
      },
      "system.organization.team.add": {
        "granted": {
          "anyOf": [{ "backend": ["system.workspace.team.create"] }]
        }
      },
      "system.organization.team.edit": {
        "granted": {
          "anyOf": [{ "backend": ["system.workspace.team.manager"] }]
        }
      },
      "system.organization.team.delete": {
        "granted": {
          "anyOf": [{ "backend": ["system.workspace.team.manager"] }]
        }
      },
      "system.organization.team.running": {
        "granted": {
          "anyOf": [{ "backend": ["system.workspace.team.manager"] }]
        }
      },
      "system.organization.role.view": {
        "granted": {
          "anyOf": [{ "backend": ["system.settings.role.view"] }]
        }
      },
      "system.organization.role.system.view": {
        "granted": {
          "anyOf": [{ "backend": ["system.settings.role.view"] }]
        }
      },
      "system.organization.role.system.add": {
        "granted": {
          "anyOf": [{ "backend": ["system.organization.role.manager_system_role"] }]
        }
      },
      "system.organization.role.system.edit": {
        "granted": {
          "anyOf": [{ "backend": ["system.organization.role.manager_system_role"] }]
        }
      },
      "system.organization.role.system.delete": {
        "granted": {
          "anyOf": [{ "backend": ["system.organization.role.manager_system_role"] }]
        }
      },
      "system.organization.role.team.view": {
        "granted": {
          "anyOf": [{ "backend": ["system.settings.role.view"] }]
        }
      },
      "system.organization.role.team.add": {
        "granted": {
          "anyOf": [{ "backend": ["system.organization.role.manager_team_role"] }]
        }
      },
      "system.organization.role.team.edit": {
        "granted": {
          "anyOf": [{ "backend": ["system.organization.role.manager_team_role"] }]
        }
      },
      "system.organization.role.team.delete": {
        "granted": {
          "anyOf": [{ "backend": ["system.organization.role.manager_team_role"] }]
        }
      },
      "system.api_market.service_classification.view": {
        "granted": {
          "anyOf": [{ "backend": ["system.settings.general.view"] }]
        }
      },
      "system.api_market.service_classification.add": {
        "granted": {
          "anyOf": [{ "backend": ["system.settings.general.manager"] }]
        }
      },
      "system.api_market.service_classification.edit": {
        "granted": {
          "anyOf": [{ "backend": ["system.settings.general.manager"] }]
        }
      },
      "system.api_market.service_classification.delete": {
        "granted": {
          "anyOf": [{ "backend": ["system.settings.general.manager"] }]
        }
      },
      "system.devops.system_setting.view": {
        "granted": {
          "anyOf": [{ "backend": ["system.settings.general.view"] }]
        }
      },
      "system.devops.system_setting.edit": {
        "granted": {
          "anyOf": [{ "backend": ["system.settings.general.manager"] }]
        }
      },
      "system.analysis.run_view.view":{
        "granted": {
          "anyOf": [{ "backend": ['system.analysis.run_view.view'] }]
        }
      },
      "system.settings.data_source.view":{
        "granted":{
          "anyOf":[{"backend":['system.settings.data_source.view']}]
        }
      },
      "system.devops.data_source.edit":{
        "granted":{
          "anyOf":[{"backend":['system.settings.data_source.manager']}]
        }
      },
      "system.settings.api_gateway.view": {
        "granted": {
          "anyOf": [{ "backend": ["system.settings.api_gateway.view"] }]
        }
      },
      "system.devops.cluster.add": {
        "granted": {
          "anyOf": [{ "backend": ["system.settings.api_gateway.manager"] }]
        }
      },
      "system.devops.cluster.edit": {
        "granted": {
          "anyOf": [{ "backend": ["system.settings.api_gateway.manager"] }]
        }
      },
      "system.devops.cluster.delete": {
        "granted": {
          "anyOf": [{ "backend": ["system.settings.api_gateway.manager"] }]
        }
      },
      "system.settings.ai_provider.view": {
        "granted": {
          "anyOf": [{ "backend": ["system.settings.ai_provider.view"] }]
        }
      },
      "system.devops.ai_provider.edit": {
        "granted": {
          "anyOf": [{ "backend": ["system.settings.ai_provider.manager"] }]
        }
      },
      "system.settings.ssl_certificate.view": {
        "granted": {
          "anyOf": [{ "backend": ["system.settings.ssl_certificate.view"] }]
        }
      },
      "system.devops.ssl_certificate.add": {
        "granted": {
          "anyOf": [{ "backend": ["system.settings.ssl_certificate.manager"] }]
        }
      },
      "system.devops.ssl_certificate.edit": {
        "granted": {
          "anyOf": [{ "backend": ["system.settings.ssl_certificate.manager"] }]
        }
      },
      "system.devops.ssl_certificate.delete": {
        "granted": {
          "anyOf": [{ "backend": ["system.settings.ssl_certificate.manager"] }]
        }
      },
      "system.settings.log_configuration.view": {
        "granted": {
          "anyOf": [{ "backend": ["system.settings.log_configuration.view"] }]
        }
      },
      "system.devops.log_configuration.add": {
        "granted": {
          "anyOf": [{ "backend": ["system.settings.log_configuration.manager"] }]
        }
      },
      "system.devops.log_configuration.edit": {
        "granted": {
          "anyOf": [{ "backend": ["system.settings.log_configuration.manager"] }]
        }
      },
      "system.devops.log_configuration.publish": {
        "granted": {
          "anyOf": [{ "backend": ["system.settings.log_configuration.manager"] }]
        }
      },
      "system.devops.log_configuration.delete": {
        "granted": {
          "anyOf": [{ "backend": ["system.settings.log_configuration.manager"] }]
        }
      },
      "system.devops.policy.view": {
        "granted": {
          "anyOf": [{ "backend": ["system.settings.strategy.view"] }]
        }
      },
      "system.devops.policy.add": {
        "granted": {
          "anyOf": [{ "backend": ["system.settings.strategy.manager"] }]
        }
      },
      "system.devops.policy.edit": {
        "granted": {
          "anyOf": [{ "backend": ["system.settings.strategy.manager"] }]
        }
      },
      "system.devops.policy.publish": {
        "granted": {
          "anyOf": [{ "backend": ["system.settings.strategy.manager"] }]
        }
      },
      "system.devops.policy.delete": {
        "granted": {
          "anyOf": [{ "backend": ["system.settings.strategy.manager"] }]
        }
      },
      "system.workspace.application.view_all": {
        "granted": {
          "anyOf": [{ "backend": ["system.workspace.application.view_all"] }]
        }
      },
      "system.workspace.application.edit": {
        "granted": {
          "anyOf": [{ "backend": ["system.workspace.application.manager_all"] }]
        }
      },
      "system.workspace.service.view_all": {
        "granted": {
          "anyOf": [{ "backend": ["system.workspace.service.view_all"] }]
        }
      },
      "system.workspace.service.edit": {
        "granted": {
          "anyOf": [{ "backend": ["system.workspace.service.manager_all"] }]
        }
      },
      "system.api_portal.api_portal.view": {
        "granted": {
          "anyOf": [{ "backend": ["system.api_portal.api_portal.view"] }]
        }
      },
      "system.dashboard.dashboard.view": {
        "granted": {
          "anyOf": [{ "backend": [] }]
        }
      },
      "system.dashboard.systemrunning.view": {
        "granted": {
          "anyOf": [{ "backend": [] }]
        }
      },
      "team.service.api_doc.view": {
        "granted": {
          "anyOf": [{ "backend": ["system.workspace.service.view_all","team.service.api_doc.view"] }]
        }
      },
      "team.service.api_doc.add": {
        "granted": {
          "anyOf": [{ "backend": ["system.workspace.service.manager_all","team.service.api_doc.manager"] }]
        }
      },
      "team.service.api_doc.edit": {
        "granted": {
          "anyOf": [{ "backend": ["system.workspace.service.manager_all","team.service.api_doc.manager"] }]
        }
      },
      "team.service.service_intro.view": {
        "granted": {
          "anyOf": [{ "backend": ["system.workspace.service.view_all","team.service.service_intro.view"] }]
        }
      },
      "team.service.service_intro.add": {
        "granted": {
          "anyOf": [{ "backend": ["system.workspace.service.manager_all","team.service.service_intro.manager"] }]
        }
      },
      "team.service.service_intro.edit": {
        "granted": {
          "anyOf": [{ "backend": ["system.workspace.service.manager_all","team.service.service_intro.manager"] }]
        }
      },
      "team.service.api_doc.import": {
        "granted": {
          "anyOf": [{ "backend": ["system.workspace.service.manager_all","team.service.api_doc.manager"] }]
        }
      },
      "team.service.router.view": {
        "granted": {
          "anyOf": [{ "backend": ["system.workspace.service.view_all","team.service.api.view"] }]
        }
      },
      "team.service.router.add": {
        "granted": {
          "anyOf": [{ "backend": ["system.workspace.service.manager_all","team.service.api.manager"] }]
        }
      },
      "team.service.router.edit": {
        "granted": {
          "anyOf": [{ "backend": ["system.workspace.service.manager_all","team.service.api.manager"] }]
        }
      },
      "team.service.router.delete": {
        "granted": {
          "anyOf": [{ "backend": ["system.workspace.service.manager_all","team.service.api.manager"] }]
        }
      },
      "team.service.upstream.view": {
        "granted": {
          "anyOf": [{ "backend": ["system.workspace.service.view_all","team.service.upstream.view"] }]
        }
      },
      "team.service.upstream.add": {
        "granted": {
          "anyOf": [{ "backend": ["system.workspace.service.manager_all","team.service.upstream.manager"] }]
        }
      },
      "team.service.upstream.edit": {
        "granted": {
          "anyOf": [{ "backend": ["system.workspace.service.manager_all","team.service.upstream.manager"] }]
        }
      },
      "team.service.upstream.delete": {
        "granted": {
          "anyOf": [{ "backend": ["system.workspace.service.manager_all","team.service.upstream.manager"] }]
        }
      },
      "team.service.release.view": {
        "granted": {
          "anyOf": [{ "backend": ["system.workspace.service.view_all","team.service.release.view"] }]
        }
      },
      "team.service.release.add": {
        "granted": {
          "anyOf": [{ "backend": ["system.workspace.service.manager_all","team.service.release.manager"] }]
        }
      },
      "team.service.release.online": {
        "granted": {
          "anyOf": [{ "backend": ["system.workspace.service.manager_all","team.service.release.manager"] }]
        }
      },
      "team.service.release.stop": {
        "granted": {
          "anyOf": [{ "backend": ["system.workspace.service.manager_all","team.service.release.manager"] }]
        }
      },
      "team.service.release.cancel": {
        "granted": {
          "anyOf": [{ "backend": ["system.workspace.service.manager_all","team.service.release.manager"] }]
        }
      },
      "team.service.release.rollback": {
        "granted": {
          "anyOf": [{ "backend": ["system.workspace.service.manager_all","team.service.release.manager"] }]
        }
      },
      "team.service.release.delete": {
        "granted": {
          "anyOf": [{ "backend": ["system.workspace.service.manager_all","team.service.release.manager"] }]
        }
      },
      "team.service.release.approval": {
        "granted": {
          "anyOf": [{ "backend": ["system.workspace.service.manager_all","team.service.release.manager"] }]
        }
      },
      "team.service.subscription.view": {
        "granted": {
          "anyOf": [{ "backend": ["system.workspace.service.view_all","team.service.subscription.view"] }]
        }
      },
      "team.service.subscription.approval": {
        "granted": {
          "anyOf": [{ "backend": ["system.workspace.service.manager_all","team.service.subscription.manager"] }]
        }
      },
      "team.service.subscription.add": {
        "granted": {
          "anyOf": [{ "backend": ["system.workspace.service.manager_all","team.service.subscription.manager"] }]
        }
      },
      "team.service.subscription.delete": {
        "granted": {
          "anyOf": [{ "backend": ["system.workspace.service.manager_all","team.service.subscription.manager"] }]
        }
      },
      "team.service.service.view": {
        "granted": {
          "anyOf": [{ "backend": ["system.workspace.service.manager_all","system.workspace.service.view_all","team.team.service.view"] }]
        }
      },
      "team.service.service.add": {
        "granted": {
          "anyOf": [{ "backend": ["system.workspace.service.manager_all","team.team.service.manager","team.service.service.manager"] }]
        }
      },
      "team.service.service.edit": {
        "granted": {
          "anyOf": [{ "backend": ["system.workspace.service.manager_all","team.team.service.manager","team.service.service.manager"] }]
        }
      },
      "team.service.service.delete": {
        "granted": {
          "anyOf": [{ "backend": ["system.workspace.service.manager_all","team.team.service.manager","team.service.service.manager"] }]
        }
      },
      "team.service.policy.view": {
        "granted": {
          "anyOf": [{ "backend": ["team.service.strategy.view"] }]
        }
      },
      "team.service.policy.add": {
        "granted": {
          "anyOf": [{ "backend": ["team.service.strategy.manager"] }]
        }
      },
      "team.service.policy.edit": {
        "granted": {
          "anyOf": [{ "backend": ["team.service.strategy.manager"] }]
        }
      },
      "team.service.policy.publish": {
        "granted": {
          "anyOf": [{ "backend": ["team.service.strategy.manager"] }]
        }
      },
      "team.service.policy.delete": {
        "granted": {
          "anyOf": [{ "backend": ["team.service.strategy.manager"] }]
        }
      },
      "team.application.subscription.view": {
        "granted": {
          "anyOf": [{ "backend": ["system.workspace.application.view_all","team.consumer.subscription.view_subscribed_service"] }]
        }
      },
      "team.application.subscription.add": {
        "granted": {
          "anyOf": [{ "backend": ["system.workspace.application.manager_all","team.consumer.subscription.subscribe"] }]
        }
      },
      "team.application.subscription.edit": {
        "granted": {
          "anyOf": [{ "backend": ["system.workspace.application.manager_all","team.consumer.subscription.manager_subscribed_services"] }]
        }
      },
      "team.application.subscription.delete": {
        "granted": {
          "anyOf": [{ "backend": ["system.workspace.application.manager_all","team.team.consumer.subscription.manager_subscribed_services"] }]
        }
      },
      "team.application.application.view": {
        "granted": {
          "anyOf": [{ "backend": ["system.workspace.application.view_all","team.team.consumer.view"] }]
        }
      },
      "team.application.application.add": {
        "granted": {
          "anyOf": [{ "backend": ["system.workspace.application.manager_all",'team.team.consumer.manager',"team.consumer.application.manager"] }]
        }
      },
      "team.application.application.edit": {
        "granted": {
          "anyOf": [{ "backend": ["system.workspace.application.manager_all",'team.team.consumer.manager',"team.consumer.application.manager"] }]
        }
      },
      "team.application.application.delete": {
        "granted": {
          "anyOf": [{ "backend": ["system.workspace.application.manager_all",'team.team.consumer.manager',"team.consumer.application.manager"] }]
        }
      },
      "team.consumer.authorization.view": {
        "granted": {
          "anyOf": [{ "backend": ["system.workspace.application.manager_all","system.workspace.application.view_all","team.consumer.authorization.view"] }]
        }
      },
      "team.application.authorization.add": {
        "granted": {
          "anyOf": [{ "backend": ["system.workspace.application.manager_all","team.consumer.authorization.manager"] }]
        }
      },
      "team.application.authorization.edit": {
        "granted": {
          "anyOf": [{ "backend": ["system.workspace.application.manager_all","team.consumer.authorization.manager"] }]
        }
      },
      "team.application.authorization.delete": {
        "granted": {
          "anyOf": [{ "backend": ["system.workspace.application.manager_all","team.consumer.authorization.manager"] }]
        }
      },
      "team.application.authorization.cancelSubApply": {
        "granted": {
          "anyOf": [{ "backend": ["system.workspace.application.manager_all","team.consumer.authorization.manager"] }]
        }
      },
      "team.application.authorization.cancelSub": {
        "granted": {
          "anyOf": [{ "backend": ["system.workspace.application.manager_all","team.consumer.authorization.manager"] }]
        }
      },
      "team.team.team.view": {
        "granted": {
          "anyOf": [{ "backend": ["system.workspace.team.view_all","team.team.team.view"] }]
        }
      },
      "team.team.team.edit": {
        "granted": {
          "anyOf": [{ "backend": ["system.workspace.team.manager","team.team.team.manager"] }]
        }
      },
      "team.team.member.view": {
        "granted": {
          "anyOf": [{ "backend": ["system.workspace.team.view_all","team.team.member.view"] }]
        }
      },
      "team.team.member.add": {
        "granted": {
          "anyOf": [{ "backend": ["system.workspace.team.manager","team.team.member.manager"] }]
        }
      },
      "team.team.member.edit": {
        "granted": {
          "anyOf": [{ "backend": ["system.workspace.team.manager","team.team.member.manager"] }]
        }
      },
      "project.mySystem.topology.view": {
        "granted": {
          "anyOf": [{ "backend": ["project.subscribe_approval"] }]
        }
      },
      "project.mySystem.access.view": {
        "granted": {
          "anyOf": [{ "backend": ["project.permission_manager"] }]
        }
      },
      "project.mySystem.access.edit": {
        "granted": {
          "anyOf": [{ "backend": ["project.permission_manager"] }]
        }
      },
      "project.mySystem.access.delete": {
        "granted": {
          "anyOf": [{ "backend": ["project.permission_manager"] }]
        }
      }
    }
  ];