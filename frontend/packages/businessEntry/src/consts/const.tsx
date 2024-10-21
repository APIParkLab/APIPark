import { DashboardProvider } from '@core/contexts/DashboardContext';
import { SystemProvider } from '@core/contexts/SystemContext';
import { TeamProvider } from '@core/contexts/TeamContext';
import Login from '@core/pages/Login';
import SystemOutlet from '@core/pages/system/SystemOutlet';
import { TenantManagementProvider } from '@market/contexts/TenantManagementContext';
import { lazy } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import {ProtectedRoute} from '@businessEntry/components/aoplatform/RenderRoutes';
import Guide from '@core/pages/guide/Guide';

  // 内置插件与对应组件/模块
  export const routerMap:Map<string, unknown> = new Map([
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
        key: 'restService',
        provider: SystemProvider,
        children:[
            {
                path:'',
                key:'restServiceList',
                component:<Navigate to="list" />
            },
            {
                path:'list',
                key: 'restServiceList2',
                lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/system/SystemList.tsx')),
            },
            {
                path:'list/:teamId',
                key: 'restServiceList3',
                lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/system/SystemList.tsx')),
            },
            {
                path:':teamId',
                component:<Outlet/>,
                key: 'restServiceInside',
                children:[
                    {
                        path:'inside/:serviceId',
                        key: 'restServiceInside2',
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
                                path:'router',
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
                                path:'topology',
                                lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/system/SystemTopology.tsx')),
                                key: 'systemTopology',
                                children:[
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
                        ]
                    },
                    {
                            path:'aiInside/:serviceId',
                            component:<AiServiceOutlet />,
                            provider: AiServiceProvider,
                            key: uuidv4(),
                            lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/aiService/AiServiceInsidePage.tsx')),
                            children:[
                                {
                                    path:'api',
                                    key: uuidv4(),
                                    lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/aiService/api/AiServiceInsideApiDocument')),
                                },
                                {
                                    
                                    path:'route/create',
                                    key: uuidv4(),
                                    lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/aiService/api/AiServiceInsideRouterCreate')),
                                },
                                {
                                    
                                    path:'route/:routeId',
                                    key: uuidv4(),
                                    lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/aiService/api/AiServiceInsideRouterCreate')),
                                },
                                {
                                    path:'route',
                                    key: uuidv4(),
                                    lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/aiService/api/AiServiceInsideRouterList')),
                                },
                                {
                                    path:'document',
                                    key: uuidv4(),
                                    lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/aiService/AiServiceInsideDocument.tsx')),
                                },
                                {
                                    path:'subscriber',
                                    key: uuidv4(),
                                    lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/aiService/AiServiceInsideSubscriber.tsx')),
                                    children:[

                                    ]
                                },
                                {
                                    path:'approval',
                                    key: uuidv4(),
                                    lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/aiService/approval/AiServiceInsideApproval')),
                                    children:[
                                        {
                                            path:'',
                                            key: uuidv4(),
                                            lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/aiService/approval/AiServiceInsideApprovalList')),
                                        },
                                        {
                                            path:'*',
                                            key: uuidv4(),
                                            lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/aiService/approval/AiServiceInsideApprovalList')),
                                        }
                                    ]
                                },
                                {
                                    path:'publish',
                                    key: uuidv4(),
                                    lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/aiService/publish/AiServiceInsidePublish')),
                                    children:[
                                        {
                                            path:'',
                                            key: uuidv4(),
                                            lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/aiService/publish/AiServiceInsidePublishList')),
                                        },
                                        {
                                            path:'*',
                                            key: uuidv4(),
                                            lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/aiService/publish/AiServiceInsidePublishList')),
                                        }
                                    ]
                                },
                                {
                                    path:'setting',
                                    key: uuidv4(),
                                    lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/system/SystemConfig.tsx')),
                                    children:[

                                    ]
                                },
                            ]
                        }
                ]
            }
        ]
     }],
    ['datasourcing', { type: 'module',
      lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/partitions/PartitionInsideDashboardSetting.tsx'))
     }],
     ['cluster', { type: 'module',
      lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/partitions/PartitionInsideCluster.tsx')),
     }],
     ['cert', { type: 'module',
      lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/partitions/PartitionInsideCert.tsx')),
     }],
  
    ['serviceHub', {
       type: 'module', 
       component:<Outlet />,
       key:uuidv4(),
       children:[
           {
               path:'',
               key: uuidv4(),
               component: <Navigate to="list" />
           },
           {
               path:'list',
               key:uuidv4(),
               lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@market/pages/serviceHub/ServiceHubList.tsx')),
           },
           {
               path:'detail/:serviceId',
               key:uuidv4(),
               lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@market/pages/serviceHub/ServiceHubDetail.tsx')),
           }]
      }],
  
     ['tenantManagement', { type: 'module',
      component:<Outlet />,
      provider:TenantManagementProvider,
      key:uuidv4(),
      children:[
          {
              path:'',
              key:uuidv4(),
              component:<Navigate to="list" />
          },
          {
              path:':teamId/inside/:appId',
              key:uuidv4(),
              lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@market/pages/serviceHub/management/ManagementInsidePage.tsx')),
              children:[
                  {
                      path:'service',
                      key:uuidv4(),
                      lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@market/pages/serviceHub/management/ManagementInsideService.tsx')),
                  },
                  {
                      path:'authorization',
                      key:uuidv4(),
                      lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@market/pages/serviceHub/management/ManagementInsideAuth.tsx')),
                  },
                  {
                      path:'setting',
                      key:uuidv4(),
                      lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@market/pages/serviceHub/management/ManagementAppSetting.tsx')),
                  },
              ]
          },
          {
              path:'list',
              key:uuidv4(),
              lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@market/pages/serviceHub/management/ServiceHubManagement.tsx')),
          },
          {
              path:'list/:teamId',
              key:uuidv4(),
              lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@market/pages/serviceHub/management/ServiceHubManagement.tsx')),
          },
      ]}],
     ['member', { type: 'module',
      lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/member/MemberPage.tsx')),
      children:[
          {
              path:'',
              key:uuidv4(),
              component:<Navigate to="list" />
          },
          {
              path:'list',
              key:uuidv4(),
              lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/member/MemberList.tsx')),
          },
          {
              path:'list/:memberGroupId',
              key:uuidv4(),
              lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/member/MemberList.tsx')),
          }
      ],
     }],
     ['role', { type: 'module',
      component:<Outlet></Outlet>,
      children:[
          {
              path: '',
              key: uuidv4(),
              component: <Navigate to="list" />
          },
          {
              path:'list',
              key:uuidv4(),
              lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/role/RoleList.tsx')),
          },
          {
              path:':roleType/config',
              key:uuidv4(),
              lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/role/RoleConfig.tsx')),
          },
          {
              path:':roleType/config/:roleId',
              key:uuidv4(),
              lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/role/RoleConfig.tsx')),
          }
      ]
     }],
     ['openapi', { type: 'module',
      lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@openApi/pages/OpenApiList.tsx')),
     }],
     ['analytics', { type: 'module',
      lazy:lazy(() => import(/* webpackChunkName: "[request]" */  '@dashboard/pages/Dashboard.tsx')),
      key:uuidv4(),
      children:[
          {
              path:':dashboardType',
              component:<Outlet/>,
              key:uuidv4(),
              provider:DashboardProvider,
              children:[
                  {
                      path:'list',
                      lazy:lazy(() => import(/* webpackChunkName: "[request]" */  '@dashboard/pages/DashboardList.tsx')),
                      key:uuidv4()
                  },
                  {
                      path:'detail/:dashboardDetailId',
                      lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@dashboard/pages/DashboardDetail.tsx')),
                      key:uuidv4()
                  },
              ]
          },
      ]
     }],
     ['systemrunning', { type: 'module',
      lazy:lazy(() => import(/* webpackChunkName: "[request]" */  '@systemRunning/pages/SystemRunning.tsx')),
     }],
     ['userProfile', { type: 'module',
      lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/userProfile/UserProfile.tsx')),
      key:uuidv4(),
      children:[{
          path:'changepsw',
          lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/userProfile/ChangePsw.tsx')),
          key:uuidv4()
      }]}]
  ])