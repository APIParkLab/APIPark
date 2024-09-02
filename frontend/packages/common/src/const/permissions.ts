// denied - 禁用； granted - 拥有权限
// 条件 anyOf/oneOf/anyOf/not
// 维度 backend - 后端的权限字段;

export const PERMISSION_DEFINITION = [
    {
      "system.organization.member.view": {
        "granted": {
          "anyOf": [{ "backend": ["system.organization.member.view"] }]
        }
      },
      "system.organization.member.add": {
        "granted": {
          "anyOf": [{ "backend": ["system.organization.member.manager"] }]
        }
      },
      "system.organization.member.edit": {
        "granted": {
          "anyOf": [{ "backend": ["system.organization.member.manager"] }]
        }
      },
      "system.organization.member.remove": {
        "granted": {
          "anyOf": [{ "backend": ["system.organization.member.manager"] }]
        }
      },
      "system.organization.member.delete": {
        "granted": {
          "anyOf": [{ "backend": ["system.organization.member.manager"] }]
        }
      },
      "system.organization.member.block": {
        "granted": {
          "anyOf": [{ "backend": ["system.organization.member.manager"] }]
        }
      },
      "system.organization.member.department.add": {
        "granted": {
          "anyOf": [{ "backend": ["system.organization.member.manager"] }]
        }
      },
      "system.organization.member.department.edit": {
        "granted": {
          "anyOf": [{ "backend": ["system.organization.member.manager"] }]
        }
      },
      "system.organization.member.department.delete": {
        "granted": {
          "anyOf": [{ "backend": ["system.organization.member.manager"] }]
        }
      },
      "system.organization.team.view": {
        "granted": {
          "anyOf": [{ "backend": ["system.organization.team.view"] }]
        }
      },
      "system.organization.team.add": {
        "granted": {
          "anyOf": [{ "backend": ["system.organization.team.manager"] }]
        }
      },
      "system.organization.team.edit": {
        "granted": {
          "anyOf": [{ "backend": ["system.organization.team.manager"] }]
        }
      },
      "system.organization.team.delete": {
        "granted": {
          "anyOf": [{ "backend": ["system.organization.team.manager"] }]
        }
      },
      "system.organization.team.running": {
        "granted": {
          "anyOf": [{ "backend": ["system.organization.team.manager"] }]
        }
      },
      "system.organization.role.view": {
        "granted": {
          "anyOf": [{ "backend": ["system.organization.role.view_system_role","system.organization.role.view_team_role"] }]
        }
      },
      "system.organization.role.system.view": {
        "granted": {
          "anyOf": [{ "backend": ["system.organization.role.view_system_role"] }]
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
          "anyOf": [{ "backend": ["system.organization.role.view_team_role"] }]
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
          "anyOf": [{ "backend": ["system.api_market.service_classification.view"] }]
        }
      },
      "system.api_market.service_classification.add": {
        "granted": {
          "anyOf": [{ "backend": ["system.api_market.service_classification.manager"] }]
        }
      },
      "system.api_market.service_classification.edit": {
        "granted": {
          "anyOf": [{ "backend": ["system.api_market.service_classification.manager"] }]
        }
      },
      "system.api_market.service_classification.delete": {
        "granted": {
          "anyOf": [{ "backend": ["system.api_market.service_classification.manager"] }]
        }
      },
      "system.dashboard.run_view.view":{
        "granted": {
          "anyOf": [{ "backend": ['system.dashboard.run_view.view'] }]
        }
      },
      "system.devops.data_source.view":{
        "granted":{
          "anyOf":[{"backend":['system.devops.data_source.view']}]
        }
      },
      "system.devops.data_source.edit":{
        "granted":{
          "anyOf":[{"backend":['system.devops.data_source.manager']}]
        }
      },
      "system.devops.cluster.view": {
        "granted": {
          "anyOf": [{ "backend": ["system.devops.cluster.view"] }]
        }
      },
      "system.devops.cluster.add": {
        "granted": {
          "anyOf": [{ "backend": ["system.devops.cluster.manager"] }]
        }
      },
      "system.devops.cluster.edit": {
        "granted": {
          "anyOf": [{ "backend": ["system.devops.cluster.manager"] }]
        }
      },
      "system.devops.cluster.delete": {
        "granted": {
          "anyOf": [{ "backend": ["system.devops.cluster.manager"] }]
        }
      },
      "system.devops.ssl_certificate.view": {
        "granted": {
          "anyOf": [{ "backend": ["system.devops.ssl_certificate.view"] }]
        }
      },
      "system.devops.ssl_certificate.add": {
        "granted": {
          "anyOf": [{ "backend": ["system.devops.ssl_certificate.manager"] }]
        }
      },
      "system.devops.ssl_certificate.edit": {
        "granted": {
          "anyOf": [{ "backend": ["system.devops.ssl_certificate.manager"] }]
        }
      },
      "system.devops.ssl_certificate.delete": {
        "granted": {
          "anyOf": [{ "backend": ["system.devops.ssl_certificate.manager"] }]
        }
      },
      "system.devops.log_configuration.view": {
        "granted": {
          "anyOf": [{ "backend": ["system.devops.log_configuration.view"] }]
        }
      },
      "system.devops.log_configuration.add": {
        "granted": {
          "anyOf": [{ "backend": ["system.devops.log_configuration.manager"] }]
        }
      },
      "system.devops.log_configuration.edit": {
        "granted": {
          "anyOf": [{ "backend": ["system.devops.log_configuration.manager"] }]
        }
      },
      "system.devops.log_configuration.publish": {
        "granted": {
          "anyOf": [{ "backend": ["system.devops.log_configuration.manager"] }]
        }
      },
      "system.devops.log_configuration.delete": {
        "granted": {
          "anyOf": [{ "backend": ["system.devops.log_configuration.manager"] }]
        }
      },
      "system.workspace.application.view_all": {
        "granted": {
          "anyOf": [{ "backend": ["system.workspace.application.view_all"] }]
        }
      },
      "system.workspace.service.view_all": {
        "granted": {
          "anyOf": [{ "backend": ["system.workspace.service.view_all"] }]
        }
      },
      "system.workspace.team.view_all": {
        "granted": {
          "anyOf": [{ "backend": ["system.workspace.team.view_all"] }]
        }
      },
      "system.workspace.api_market.view": {
        "granted": {
          "anyOf": [{ "backend": ["system.workspace.api_market.view"] }]
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
          "anyOf": [{ "backend": ["team.service.api_doc.view"] }]
        }
      },
      "team.service.api_doc.add": {
        "granted": {
          "anyOf": [{ "backend": ["team.service.api_doc.manager"] }]
        }
      },
      "team.service.api_doc.edit": {
        "granted": {
          "anyOf": [{ "backend": ["team.service.api_doc.manager"] }]
        }
      },
      "team.service.api_doc.import": {
        "granted": {
          "anyOf": [{ "backend": ["team.service.api_doc.manager"] }]
        }
      },
      "team.service.router.view": {
        "granted": {
          "anyOf": [{ "backend": ["team.service.router.view"] }]
        }
      },
      "team.service.router.add": {
        "granted": {
          "anyOf": [{ "backend": ["team.service.router.manager"] }]
        }
      },
      "team.service.router.edit": {
        "granted": {
          "anyOf": [{ "backend": ["team.service.router.manager"] }]
        }
      },
      "team.service.router.delete": {
        "granted": {
          "anyOf": [{ "backend": ["team.service.router.manager"] }]
        }
      },
      "team.service.upstream.view": {
        "granted": {
          "anyOf": [{ "backend": ["team.service.upstream.view"] }]
        }
      },
      "team.service.upstream.add": {
        "granted": {
          "anyOf": [{ "backend": ["team.service.upstream.manager"] }]
        }
      },
      "team.service.upstream.edit": {
        "granted": {
          "anyOf": [{ "backend": ["team.service.upstream.manager"] }]
        }
      },
      "team.service.upstream.delete": {
        "granted": {
          "anyOf": [{ "backend": ["team.service.upstream.manager"] }]
        }
      },
      "team.service.release.view": {
        "granted": {
          "anyOf": [{ "backend": ["team.service.release.view"] }]
        }
      },
      "team.service.release.add": {
        "granted": {
          "anyOf": [{ "backend": ["team.service.release.manager"] }]
        }
      },
      "team.service.release.online": {
        "granted": {
          "anyOf": [{ "backend": ["team.service.release.manager"] }]
        }
      },
      "team.service.release.stop": {
        "granted": {
          "anyOf": [{ "backend": ["team.service.release.manager"] }]
        }
      },
      "team.service.release.cancel": {
        "granted": {
          "anyOf": [{ "backend": ["team.service.release.manager"] }]
        }
      },
      "team.service.release.rollback": {
        "granted": {
          "anyOf": [{ "backend": ["team.service.release.manager"] }]
        }
      },
      "team.service.release.delete": {
        "granted": {
          "anyOf": [{ "backend": ["team.service.release.manager"] }]
        }
      },
      "team.service.release.approval": {
        "granted": {
          "anyOf": [{ "backend": ["team.service.release.manager"] }]
        }
      },
      "team.service.subscription.view": {
        "granted": {
          "anyOf": [{ "backend": ["team.service.subscription.view"] }]
        }
      },
      "team.service.subscription.approval": {
        "granted": {
          "anyOf": [{ "backend": ["team.service.subscription.manager"] }]
        }
      },
      "team.service.subscription.add": {
        "granted": {
          "anyOf": [{ "backend": ["team.service.subscription.manager"] }]
        }
      },
      "team.service.subscription.delete": {
        "granted": {
          "anyOf": [{ "backend": ["team.service.subscription.manager"] }]
        }
      },
      "team.service.service.view": {
        "granted": {
          "anyOf": [{ "backend": [""] }]
        }
      },
      "team.service.service.add": {
        "granted": {
          "anyOf": [{ "backend": ["team.service.service.manager"] }]
        }
      },
      "team.service.service.edit": {
        "granted": {
          "anyOf": [{ "backend": ["team.service.service.manager"] }]
        }
      },
      "team.service.service.delete": {
        "granted": {
          "anyOf": [{ "backend": ["team.service.service.manager"] }]
        }
      },
      "team.application.subscription.view": {
        "granted": {
          "anyOf": [{ "backend": ["team.application.subscription.view"] }]
        }
      },
      "team.application.subscription.add": {
        "granted": {
          "anyOf": [{ "backend": ["team.application.subscription.manager"] }]
        }
      },
      "team.application.subscription.edit": {
        "granted": {
          "anyOf": [{ "backend": ["team.application.subscription.manager"] }]
        }
      },
      "team.application.subscription.delete": {
        "granted": {
          "anyOf": [{ "backend": ["team.application.subscription.manager"] }]
        }
      },
      "team.application.application.view": {
        "granted": {
          "anyOf": [{ "backend": ["team.application.application.view"] }]
        }
      },
      "team.application.application.add": {
        "granted": {
          "anyOf": [{ "backend": ["team.application.application.manager"] }]
        }
      },
      "team.application.application.edit": {
        "granted": {
          "anyOf": [{ "backend": ["team.application.application.manager"] }]
        }
      },
      "team.application.application.delete": {
        "granted": {
          "anyOf": [{ "backend": ["team.application.application.manager"] }]
        }
      },
      "team.application.authorization.view": {
        "granted": {
          "anyOf": [{ "backend": ["team.application.authorization.view"] }]
        }
      },
      "team.application.authorization.add": {
        "granted": {
          "anyOf": [{ "backend": ["team.application.authorization.manager"] }]
        }
      },
      "team.application.authorization.edit": {
        "granted": {
          "anyOf": [{ "backend": ["team.application.authorization.manager"] }]
        }
      },
      "team.application.authorization.delete": {
        "granted": {
          "anyOf": [{ "backend": ["team.application.authorization.manager"] }]
        }
      },
      "team.team.team.view": {
        "granted": {
          "anyOf": [{ "backend": ["team.team.team.view"] }]
        }
      },
      "team.team.team.edit": {
        "granted": {
          "anyOf": [{ "backend": ["team.team.team.manager"] }]
        }
      },
      "team.team.member.view": {
        "granted": {
          "anyOf": [{ "backend": ["team.team.member.view"] }]
        }
      },
      "team.team.member.add": {
        "granted": {
          "anyOf": [{ "backend": ["team.team.member.manager"] }]
        }
      },
      "team.team.member.edit": {
        "granted": {
          "anyOf": [{ "backend": ["team.team.member.manager"] }]
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