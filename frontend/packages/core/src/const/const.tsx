import { RouterMapConfig } from '@common/const/type';
import { ProtectedRoute } from '@core/components/aoplatform/RenderRoutes';
import { AiServiceProvider } from '@core/contexts/AiServiceContext';
import { SystemProvider } from '@core/contexts/SystemContext';
import { TeamProvider } from '@core/contexts/TeamContext';
import AiServiceOutlet from '@core/pages/aiService/AiServiceOutlet';
import Guide from '@core/pages/guide/Guide';
import Login from '@core/pages/Login';
import SystemOutlet from '@core/pages/system/SystemOutlet';
import { TenantManagementProvider } from '@market/contexts/TenantManagementContext';
import { lazy } from 'react';
import { Outlet, Navigate } from 'react-router-dom';


  // 内置插件与对应组件/模块
  export const routerMap:Map<string, RouterMapConfig> = new Map([
    ['basicLayout', { type: 'component', component: <ProtectedRoute />}],
    ['navHidden', { type: 'component', component:  <ProtectedRoute /> }],
    ['login', { type: 'component', component: <Login /> }],
    ['guide',{
      type:'component',
      component:<Guide />
    }],
    ['team', {type: 'module', 
              component:<Outlet/>,
              key: 'team',
              provider: TeamProvider,
              children:[
                  {
                      path:'',
                      key: 'teamList',
                      component: <Navigate to="list" />
                  },
                  {
                      path:'list',
                      key: 'teamList2',
                      lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/team/TeamList.tsx'))
                  },
                  {
                      path:'inside/:teamId',
                      lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/team/TeamInsidePage.tsx')),
                      key: 'teamInside',
                      children:[
                          {
                              path:'member',
                              key: 'teamMember',
                              lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/team/TeamInsideMember.tsx')),
                          },
                          {
                              path:'setting',
                              key: 'teamSetting',
                              lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/team/TeamConfig.tsx')),
                          },
                      ]
                  }
              ]
     }],
    ['service', { 
      type: 'module',
        path:'service',
        component:<SystemOutlet />,
        key: 'service',
        provider: SystemProvider,
        children:[
            {
                path:'',
                key:'serviceList',
                component:<Navigate to="list" />
            },
            {
                path:'list',
                key: 'serviceList2',
                lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/system/SystemList.tsx')),
            },
            {
                path:'list/:teamId',
                key: 'serviceList3',
                lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/system/SystemList.tsx')),
            },
            {
                path:':teamId',
                component:<Outlet/>,
                key: 'serviceInside',
                children:[
                    {
                        path:'inside/:serviceId',
                        key: 'restServiceInside',
                        lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/system/SystemInsidePage.tsx')),
                        children:[
                            {
                                path:'api',
                                key: 'restServiceInsideApi',
                                lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/system/api/SystemInsideApiDocument.tsx')),
                            },
                            {
                                
                                path:'route/create',
                                key: 'restServiceInsideRouteCreate',
                                lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/system/api/SystemInsideRouterCreate')),
                            },
                            {
                                
                                path:'route/:routeId',
                                key: 'restServiceInsideRouteEdit',
                                lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/system/api/SystemInsideRouterCreate')),
                            },
                            {
                                path:'route',
                                key: 'restServiceInsideRoute',
                                lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/system/api/SystemInsideRouterList')),
                            },
                            {
                                path:'upstream',
                                key: 'restServiceInsideUpstream',
                                lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/system/upstream/SystemInsideUpstreamContent.tsx')),
                            },
                            {
                                path:'document',
                                key: 'restServiceInsideDocument',
                                lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/system/SystemInsideDocument.tsx')),
                            },
                            {
                                path:'subscriber',
                                key: 'restServiceInsideSubscriber',
                                lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/system/SystemInsideSubscriber.tsx')),
                                children:[
  
                                ]
                            },
                            {
                                path:'approval',
                                key: 'restServiceInsideApproval',
                                lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/system/approval/SystemInsideApproval.tsx')),
                                children:[
                                    {
                                        path:'',
                                        key: 'restServiceInsideApprovalList',
                                        lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/system/approval/SystemInsideApprovalList.tsx')),
                                    },
                                    {
                                        path:'*',
                                        key: 'restServiceInsideApprovalList2',
                                        lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/system/approval/SystemInsideApprovalList.tsx')),
                                    }
                                ]
                            },
                            {
                                path:'publish',
                                key: 'systemPublish',
                                lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/system/publish/SystemInsidePublish.tsx')),
                                children:[
                                    {
                                        path:'',
                                        key: 'systemPublishList',
                                        lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/system/publish/SystemInsidePublishList.tsx')),
                                    },
                                    {
                                        path:'*',
                                        key: 'systemPublishList2',
                                        lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/system/publish/SystemInsidePublishList.tsx')),
                                    }
                                ]
                            },
                            {
                                path:'setting',
                                key: 'systemConfig',
                                lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/system/SystemConfig.tsx')),
                                children:[
  
                                ]
                            },
                            {
                                path:'servicepolicy',
                                key: 'servicePolicy',
                                lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/policy/servicePolicy')),
                                children:[
  
                                ]
                            },
                        ]
                    },
                    {
                            path:'aiInside/:serviceId',
                            component:<AiServiceOutlet />,
                            provider: AiServiceProvider,
                            key: 'aiServiceInside',
                            lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/aiService/AiServiceInsidePage.tsx')),
                            children:[
                                {
                                    path:'api',
                                    key: 'aiServiceInsideApi',
                                    lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/aiService/api/AiServiceInsideApiDocument')),
                                },
                                {
                                    
                                    path:'route/create',
                                    key: 'aiServiceInsideRouteCreate',
                                    lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/aiService/api/AiServiceInsideRouterCreate')),
                                },
                                {
                                    
                                    path:'route/:routeId',
                                    key: 'aiServiceInsideRouteEdit',
                                    lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/aiService/api/AiServiceInsideRouterCreate')),
                                },
                                {
                                    path:'route',
                                    key: 'aiServiceInsideRouteList',
                                    lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/aiService/api/AiServiceInsideRouterList')),
                                },
                                {
                                    path:'document',
                                    key: 'aiServiceInsideDocument',
                                    lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/aiService/AiServiceInsideDocument.tsx')),
                                },
                                {
                                    path:'subscriber',
                                    key: 'aiServiceInsideSubscriber',
                                    lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/aiService/AiServiceInsideSubscriber.tsx')),
                                    children:[

                                    ]
                                },
                                {
                                    path:'approval',
                                    key: 'aiServiceInsideApproval',
                                    lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/aiService/approval/AiServiceInsideApproval')),
                                    children:[
                                        {
                                            path:'',
                                            key: 'aiServiceInsideApprovalList',
                                            lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/aiService/approval/AiServiceInsideApprovalList')),
                                        },
                                        {
                                            path:'*',
                                            key: 'aiServiceInsideApprovalList2',
                                            lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/aiService/approval/AiServiceInsideApprovalList')),
                                        }
                                    ]
                                },
                                {
                                    path:'publish',
                                    key: 'aiServiceInsidePublish',
                                    lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/aiService/publish/AiServiceInsidePublish')),
                                    children:[
                                        {
                                            path:'',
                                            key: 'aiServiceInsidePublishList',
                                            lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/aiService/publish/AiServiceInsidePublishList')),
                                        },
                                        {
                                            path:'*',
                                            key: 'aiServiceInsidePublishList2',
                                            lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/aiService/publish/AiServiceInsidePublishList')),
                                        }
                                    ]
                                },
                                {
                                    path:'setting',
                                    key: 'aiServiceInsideSetting',
                                    lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/system/SystemConfig.tsx')),
                                    children:[

                                    ]
                                },
                                {
                                    path:'servicepolicy',
                                    key: 'servicePolicy',
                                    lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/policy/servicePolicy')),
                                    children:[
      
                                    ]
                                },
                            ]
                        }
                ]
            }
        ]
     }],
    ['datasourcing', { type: 'component',
      lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/partitions/PartitionInsideDashboardSetting.tsx'))
     }],
     ['cluster', { type: 'component',
      lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/partitions/PartitionInsideCluster.tsx')),
     }],
     ['aisetting', { type: 'component',
      lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/aiSetting/AiSettingList.tsx')),
    }],
     ['cert', { type: 'component',
      lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/partitions/PartitionInsideCert.tsx')),
     }],
  
    ['serviceHub', {
       type: 'module', 
       component:<Outlet />,
       key:'serviceHub',
       children:[
           {
               path:'',
               key: 'serviceHubList',
               component: <Navigate to="list" />
           },
           {
               path:'list',
                key:'serviceHubList2',
                lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@market/pages/serviceHub/ServiceHubList.tsx')),
           },
           {
               path:'detail/:serviceId',
               key:'serviceHubDetail',
               lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@market/pages/serviceHub/ServiceHubDetail.tsx')),
           }]
      }],
  
      ['commonsetting', { type: 'module',
        lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/common/CommonPage.tsx')),
    }],
    
     ['consumer', { type: 'module',
      component:<Outlet />,
      provider:TenantManagementProvider,
      key:'consumer',
      children:[
          {
              path:'',
              key:'consumerList',
              component:<Navigate to="list" />
          },
          {
              path:':teamId/inside/:appId',
              key:'consumerInside',
              lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@market/pages/serviceHub/management/ManagementInsidePage.tsx')),
              children:[
                  {
                      path:'service',
                      key:'consumerInsideService',
                      lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@market/pages/serviceHub/management/ManagementInsideService.tsx')),
                  },
                  {
                      path:'authorization',
                      key:'consumerInsideAuthorization',
                      lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@market/pages/serviceHub/management/ManagementInsideAuth.tsx')),
                  },
                  {
                      path:'setting',
                      key:'consumerSetting',
                      lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@market/pages/serviceHub/management/ManagementAppSetting.tsx')),
                  },
              ]
          },
          {
              path:'list',
              key:'serviceHubManagementList',
              lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@market/pages/serviceHub/management/ServiceHubManagement.tsx')),
          },
          {
              path:'list/:teamId',
              key:'serviceHubManagementList2',
              lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@market/pages/serviceHub/management/ServiceHubManagement.tsx')),
          },
      ]}],
     ['member', { type: 'module',
      lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/member/MemberPage.tsx')),
      children:[
          {
              path:'',
              key:'memberList',
              component:<Navigate to="list" />
          },
          {
              path:'list',
              key:'memberList2',
              lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/member/MemberList.tsx')),
          },
          {
              path:'list/:memberGroupId',
              key:'memberList3',
              lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/member/MemberList.tsx')),
          }
      ],
     }],
     ['role', { type: 'module',
      component:<Outlet></Outlet>,
      children:[
          {
              path: '',
              key: 'roleList',
              component: <Navigate to="list" />
          },
          {
              path:'list',
              key:'roleList2',
              lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/role/RoleList.tsx')),
          },
          {
              path:':roleType/config/:roleId',
              key:'roleConfig',
              lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/role/RoleConfig.tsx')),
          },
          {
              path:':roleType/config',
              key:'roleConfig2',
              lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/role/RoleConfig.tsx')),
          }
      ]
     }],
     ['analytics', { type: 'module',
      lazy:lazy(() => import(/* webpackChunkName: "[request]" */  '@dashboard/pages/Dashboard.tsx')),
      key:'analytics',
      children:[
        {
            path:'total',
            key:'analytics2',
            lazy:lazy(() => import(/* webpackChunkName: "[request]" */  '@dashboard/pages/DashboardTotal.tsx')),
        },
        {
            path:':dashboardType',
            key:'analytics3',
            component:<Outlet />,
            children:[
                {
                    path:'list',
                    lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@dashboard/pages/DashboardList.tsx')),
                    key:'analyticsList'
                },
                {
                    path:'detail/:dashboardDetailId',
                    lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@dashboard/pages/DashboardDetail.tsx')),
                    key:'analyticsDetail'
                },
            ]
        }
      ]
     }],
     ['template', { type: 'module',
            lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@common/components/aoplatform/intelligent-plugin/IntelligentPluginList.tsx')),
     }],
     ['logsettings', { type: 'module',
        lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/logsettings/LogSettings.tsx')),
        key:'logsettings',
        children:[
          {
              path:'template/:moduleId',
              key:'logSettings2',
              lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@common/components/aoplatform/intelligent-plugin/IntelligentPluginList.tsx')),
          },
        ]
       }],
     ['resourcesettings', { type: 'module',
        lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/resourcesettings/ResourceSettings.tsx')),
        key:'resourcesettings',
        children:[
          {
              path:'template/:moduleId',
              lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@common/components/aoplatform/intelligent-plugin/IntelligentPluginList.tsx')),
              key:'resourceSettings2'
          },
        ]
       }],
     ['userProfile', { type: 'module',
      lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/userProfile/UserProfile.tsx')),
      key:'userProfile',
      children:[{
          path:'changepsw',
          lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/userProfile/ChangePsw.tsx')),
          key:'changePsw'
      }]}],
      ['globalPolicy', { type: 'module',
        lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/policy/GlobalPolicyLayout')),
       key:'globalPolicy',
       children:[{
           path:'datamasking',
           component:<Outlet />,
           key:'dataMasking',
           children:[
            {
                path:'list',
                lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/policy/GlobalPolicy')),
                key:'dataMaskingList'
            },
            {
               path:'create',
               lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/policy/dataMasking/DataMaskingConfig')),
               key:'dataMaskingAdd'
           },
           {
              path:':policyId',
              lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/policy/dataMasking/DataMaskingConfig')),
              key:'dataMaskingAdd'
          }]
       }]
    }],
  ])