import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Login from "@core/pages/Login.tsx"
import BasicLayout from '@common/components/aoplatform/BasicLayout';
import {createElement, ReactElement,ReactNode,Suspense, useEffect, useState} from 'react';
import { v4 as uuidv4 } from 'uuid'
import {App, Skeleton} from "antd";
import ApprovalPage from "@core/pages/approval/ApprovalPage.tsx";
import {SystemProvider} from "@core/contexts/SystemContext.tsx";
import {useGlobalContext} from "@common/contexts/GlobalStateContext.tsx";
import {FC,lazy} from 'react';
import { TeamProvider } from '@core/contexts/TeamContext.tsx';
import SystemOutlet from '@core/pages/system/SystemOutlet.tsx';
import { DashboardProvider } from '@core/contexts/DashboardContext.tsx';
import { TenantManagementProvider } from '@market/contexts/TenantManagementContext.tsx';
import React from 'react';
import usePluginLoader from '@businessEntry/hooks/pluginLoader.ts';
import Guide from '@core/pages/guide/Guide.tsx';
import AiServiceOutlet from '@core/pages/aiService/AiServiceOutlet.tsx';
import { AiServiceProvider } from '@core/contexts/AiServiceContext.tsx';

export type RouteConfig = {
    path:string
    component?:ReactElement
    children?:(RouteConfig|false)[]
    key:string
    provider?:FC<{ children: ReactNode; }>
    lazy?:unknown
}
const APP_MODE = import.meta.env.VITE_APP_MODE;
export type RouterParams  = {
    teamId:string
    apiId:string
    serviceId:string
    clusterId:string;
    memberGroupId:string
    userGroupId:string
    pluginName:string
    moduleId:string
    accessType:'project'|'team'|'service'
    categoryId:string
    tagId:string
    dashboardType:string
    dashboardDetailId:string
    topologyId:string
    appId:string
    roleType:string
    roleId:string
}

const PUBLIC_ROUTES:RouteConfig[] = [
    {
        path:'/',
        component:<Login/>,
        key: 'root',
    },
    {
        path:'/login',
        component:<Login/>,
        key: 'login'
    },
    {
        path:'/',
        component:<ProtectedRoute/>,
        key: 'layout',
        children:[
            {
                path:'guide/*',
                component:<Guide />,
                key:'guide'
            },
            {
                path:'team',
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
            },
            {
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
                                        key: uuidv4(),
                                        lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/system/api/SystemInsideRouterCreate')),
                                    },
                                    {
                                        
                                        path:'route/:routeId',
                                        key: uuidv4(),
                                        lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/system/api/SystemInsideRouterCreate')),
                                    },
                                    {
                                        path:'route',
                                        key: uuidv4(),
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
            },
            {
                path:'datasourcing',
                key: 'dataSourcing',
                lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/partitions/PartitionInsideDashboardSetting.tsx')),
            },
            {
                path:'cluster',
                key: 'cluster',
                lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/partitions/PartitionInsideCluster.tsx')),
            },
            {
                path:'aisetting',
                key: 'aiSetting',
                lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/aiSetting/AiSettingList.tsx')),
            },
            {
                path:'cert',
                key: 'cert',
                lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/partitions/PartitionInsideCert.tsx')),
            },
            {
                path:'serviceHub',
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
            },
            {
                path:'commonsetting',
                lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/common/CommonPage.tsx')),
                key:uuidv4(),
            },
            {
                path:'consumer',
                component:<Outlet />,
                provider:TenantManagementProvider,
                key:'tenantManagement',
                children:[
                    {
                        path:'',
                        key:'tenantManagementList',
                        component:<Navigate to="list" />
                    },
                    {
                        path:':teamId/inside/:appId',
                        key:'tenantManagementInside',
                        lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@market/pages/serviceHub/management/ManagementInsidePage.tsx')),
                        children:[
                            {
                                path:'service',
                                key:'tenantManagementInsideService',
                                lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@market/pages/serviceHub/management/ManagementInsideService.tsx')),
                            },
                            {
                                path:'authorization',
                                key:'tenantManagementInsideAuthorization',
                                lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@market/pages/serviceHub/management/ManagementInsideAuth.tsx')),
                            },
                            {
                                path:'setting',
                                key:'tenantManagementSetting',
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
                ]
            },
            {
                path:'member',
                key:'member',
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
                ]
            },
            {
                path:'role',
                key:'role',
                component:<Outlet />,
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
                    },{
                        path:':roleType/config/:roleId',
                        key:'roleConfig',
                        lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/role/RoleConfig.tsx')),
                    },{
                        path:':roleType/config',
                        key:'roleConfig2',
                        lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/role/RoleConfig.tsx')),
                    }
                ]
            },
            {
                path:'analytics',
                lazy:lazy(() => import(/* webpackChunkName: "[request]" */  '@dashboard/pages/Dashboard.tsx')),
                key:'analytics',
                children:[
                    {
                        path:'total',
                        key:'analytics2',
                        lazy:lazy(() => import(/* webpackChunkName: "[request]" */  '@dashboard/pages/DashboardTotal.tsx')),
                    },
                ]
            },
            {
                path:'template/:moduleId',
                lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@common/components/aoplatform/intelligent-plugin/IntelligentPluginList.tsx')),
                key:'intelligentPlugin'
            },
            {
                path:'logsettings/*',
                lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/logsettings/LogSettings.tsx')),
                key: 'logSettings',
                children:[{
                    path:'template/:moduleId',
                    lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@common/components/aoplatform/intelligent-plugin/IntelligentPluginList.tsx')),
                    key:'logSettings2'
                }]
                
            },
            APP_MODE ==='pro' && {
                path:'resourcesettings/*',
                lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/resourcesettings/ResourceSettings.tsx')),
                key: 'resourceSettings',
                children:[{
                    path:'template/:moduleId',
                    lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@common/components/aoplatform/intelligent-plugin/IntelligentPluginList.tsx')),
                    key:'resourceSettings2'
                }]
                
            },
            {
                path:'userProfile/*',
                lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/userProfile/UserProfile.tsx')),
                key:'userProfile',
                children:[{
                    path:'changepsw',
                    lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/userProfile/ChangePsw.tsx')),
                    key:'changePsw'
                }]
            },
            APP_MODE === 'pro' &&{
                path:'openapi',
                lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@openApi/pages/OpenApiList.tsx')),
                key:'openApi',
            },
            {
                path:'systemrunning',
                lazy:lazy(() => import(/* webpackChunkName: "[request]" */  '@systemRunning/pages/SystemRunning.tsx')),
                key:'systemRunning'
            },
        ]
    }
]

const RenderRoutes = ()=> {
    const { loadPlugins } = usePluginLoader()
    const [routeConfig , setRouteConfig] = useState<RouteConfig[]>(PUBLIC_ROUTES)
    useEffect(()=>{
        loadPlugins().then((res)=>{
            console.log('newRouteConfig',res)
            setRouteConfig(res as RouteConfig[])
        })
    },[])

    return (
        <App className="h-full" message={{ maxCount: 1 }}>
            <Router>
                <Routes>
                    {generateRoutes(routeConfig)}
                </Routes>
            </Router>
        </App>
        )
}

const generateRoutes = (routerConfig: RouteConfig[]) => {
    return routerConfig?.map((route: RouteConfig) => {
            let routeElement;
            if (route.lazy) {
                const LazyComponent = route.lazy as React.ExoticComponent<unknown>;

                routeElement = (
                    <Suspense fallback={ <div className=''><Skeleton className='m-btnbase w-calc-100vw-minus-padding-r' active /></div>}>
                        {route.provider ? (
                            createElement(route.provider, {}, <LazyComponent  />)
                        ) : (
                            <LazyComponent />
                        )}
                    </Suspense>
                );
            } else {
                routeElement = route.provider ? (
                    createElement(route.provider, {}, route.component)
                ) : (
                    route.component
                );
            }

                return (
                  <Route
                    key={route.key}
                    path={route.path}
                    element={routeElement}
                  >
                    {route.children && generateRoutes(route.children as RouteConfig[])}
                  </Route>
                );
              }
        )
}

// 保护的路由组件
export function ProtectedRoute() {
    const {state} = useGlobalContext()
    return state.isAuthenticated? <BasicLayout project="core" /> : <Navigate to="/login" />;
  }

export default RenderRoutes