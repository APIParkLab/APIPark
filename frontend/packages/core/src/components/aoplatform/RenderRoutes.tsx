
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Login from "@core/pages/Login.tsx"
import BasicLayout from '@common/components/aoplatform/BasicLayout';
import {createElement, ReactElement,ReactNode,Suspense} from 'react';
import { v4 as uuidv4 } from 'uuid'
import {App, Skeleton} from "antd";
import {useGlobalContext} from "@common/contexts/GlobalStateContext.tsx";
import {FC,lazy} from 'react';
import { TeamProvider } from '@core/contexts/TeamContext.tsx';
import { TenantManagementProvider } from '@market/contexts/TenantManagementContext.tsx';
import  Guide  from '@core/pages/guide/Guide';
import { AiServiceProvider } from '@core/contexts/AiServiceContext';
import AiServiceOutlet from '@core/pages/aiService/AiServiceOutlet';
import SystemOutlet from '@core/pages/system/SystemOutlet';
import { SystemProvider } from '@core/contexts/SystemContext';

type RouteConfig = {
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
    routeId:string
}

const PUBLIC_ROUTES:RouteConfig[] = [
    {
        path:'/',
        component:<Login/>,
        key: uuidv4(),
    },
    {
        path:'/login',
        component:<Login/>,
        key: uuidv4()
    },
    {
        path:'/',
        component:<ProtectedRoute/>,
        key: uuidv4(),
        children:[
            // {
            //     path:'approval/*',
            //     component:<ApprovalPage />,
            //     key:uuidv4()
            // },
            {
                path:'guide/*',
                component:<Guide />,
                key:uuidv4()
            },
            {
                path:'team',
                component:<Outlet/>,
                key: uuidv4(),
                provider: TeamProvider,
                children:[
                    {
                        path:'',
                        key: uuidv4(),
                        component: <Navigate to="list" />
                    },
                    {
                        path:'list',
                        key: uuidv4(),
                        lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/team/TeamList.tsx'))
                    },
                    {
                        path:'inside/:teamId',
                        lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/team/TeamInsidePage.tsx')),
                        key: uuidv4(),
                        children:[
                            {
                                path:'member',
                                key: uuidv4(),
                                lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/team/TeamInsideMember.tsx')),
                            },
                            {
                                path:'setting',
                                key: uuidv4(),
                                lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/team/TeamConfig.tsx')),
                            },
                        ]
                    }
                ]
            },
            {
                path:'service',
                component:<SystemOutlet />,
                key: uuidv4(),
                provider: SystemProvider,
                children:[
                    {
                        path:'',
                        key:uuidv4(),
                        component:<Navigate to="list" />
                    },
                    {
                        path:'list',
                        key: uuidv4(),
                        lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/system/SystemList.tsx')),
                    },
                    {
                        path:'list/:teamId',
                        key: uuidv4(),
                        lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/system/SystemList.tsx')),
                    },
                    {
                        path:':teamId',
                        component:<Outlet/>,
                        key: uuidv4(),
                        children:[
                            {
                                path:'inside/:serviceId',
                                key: uuidv4(),
                                lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/system/SystemInsidePage.tsx')),
                                children:[
                                    {
                                        path:'api',
                                        key: uuidv4(),
                                        lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/system/api/SystemInsideApiDocument.tsx')),
                                    },
                                    {
                                        path:'route',
                                        key: uuidv4(),
                                        lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/system/api/SystemInsideRouterList')),
                                    },
                                    {
                                        path:'upstream',
                                        key: uuidv4(),
                                        lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/system/upstream/SystemInsideUpstreamContent.tsx')),
                                    },
                                    {
                                        path:'document',
                                        key: uuidv4(),
                                        lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/system/SystemInsideDocument.tsx')),
                                    },
                                    {
                                        path:'subscriber',
                                        key: uuidv4(),
                                        lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/system/SystemInsideSubscriber.tsx')),
                                        children:[

                                        ]
                                    },
                                    {
                                        path:'approval',
                                        key: uuidv4(),
                                        lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/system/approval/SystemInsideApproval.tsx')),
                                        children:[
                                            {
                                                path:'',
                                                key: uuidv4(),
                                                lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/system/approval/SystemInsideApprovalList.tsx')),
                                            },
                                            {
                                                path:'*',
                                                key: uuidv4(),
                                                lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/system/approval/SystemInsideApprovalList.tsx')),
                                            }
                                        ]
                                    },
                                    {
                                        path:'topology',
                                        lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/system/SystemTopology.tsx')),
                                        key: uuidv4(),
                                        children:[
                                        ]
                                    },
                                    {
                                        path:'publish',
                                        key: uuidv4(),
                                        lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/system/publish/SystemInsidePublish.tsx')),
                                        children:[
                                            {
                                                path:'',
                                                key: uuidv4(),
                                                lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/system/publish/SystemInsidePublishList.tsx')),
                                            },
                                            {
                                                path:'*',
                                                key: uuidv4(),
                                                lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/system/publish/SystemInsidePublishList.tsx')),
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
                path:'aiservice',
                component:<AiServiceOutlet />,
                key: uuidv4(),
                provider: AiServiceProvider,
                children:[
                    {
                        path:'',
                        key:uuidv4(),
                        component:<Navigate to="list" />
                    },
                    {
                        path:'list',
                        key: uuidv4(),
                        lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/aiService/AiServiceList.tsx')),
                    },
                    {
                        path:'list/:teamId',
                        key: uuidv4(),
                        lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/aiService/AiServiceList.tsx')),
                    },
                    {
                        path:':teamId',
                        component:<Outlet/>,
                        key: uuidv4(),
                        children:[
                            {
                                path:'inside/:serviceId',
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
                                        lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/aiService/AiServiceConfig.tsx')),
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
                key: uuidv4(),
                lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/partitions/PartitionInsideDashboardSetting.tsx')),
            },
            {
                path:'cluster',
                key: uuidv4(),
                lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/partitions/PartitionInsideCluster.tsx')),
            },
            {
                path:'aisetting',
                key: uuidv4(),
                lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/aiSetting/AiSettingList.tsx')),
            },
            {
                path:'cert',
                key: uuidv4(),
                lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/partitions/PartitionInsideCert.tsx')),
            },
            {
                path:'serviceHub',
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
            },
            {
                path:'servicecategories',
                lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/serviceCategory/ServiceCategory.tsx')),
                key:uuidv4(),
            },
            {
                path:'tenantManagement',
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
                ]
            },
            {
                path:'member',
                key:uuidv4(),
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
                ]
            },
            {
                path:'role',
                key:uuidv4(),
                component:<Outlet />,
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
                    },{
                        path:':roleType/config/:roleId',
                        key:uuidv4(),
                        lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/role/RoleConfig.tsx')),
                    },{
                        path:':roleType/config',
                        key:uuidv4(),
                        lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/role/RoleConfig.tsx')),
                    }
                ]
            },
            {
                path:'assets',
                component:<p>设计中</p>,
                key:uuidv4()
            },
            {
                path:'analytics',
                lazy:lazy(() => import(/* webpackChunkName: "[request]" */  '@dashboard/pages/Dashboard.tsx')),
                key:uuidv4(),
                children:[
                    {
                        path:'total',
                        key:uuidv4(),
                        lazy:lazy(() => import(/* webpackChunkName: "[request]" */  '@dashboard/pages/DashboardTotal.tsx')),
                    },
                ]
            },
            {
                path:'template/:moduleId',
                lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@common/components/aoplatform/intelligent-plugin/IntelligentPluginList.tsx')),
                key:uuidv4()
            },
            {
                path:'logsettings/*',
                lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/logsettings/LogSettings.tsx')),
                key: uuidv4(),
                children:[{
                    path:'template/:moduleId',
                    lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@common/components/aoplatform/intelligent-plugin/IntelligentPluginList.tsx')),
                    key:uuidv4()
                }]
                
            },
            APP_MODE ==='pro' && {
                path:'resourcesettings/*',
                lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/resourcesettings/ResourceSettings.tsx')),
                key: uuidv4(),
                children:[{
                    path:'template/:moduleId',
                    lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@common/components/aoplatform/intelligent-plugin/IntelligentPluginList.tsx')),
                    key:uuidv4()
                }]
                
            },
            {
                path:'userProfile/*',
                lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/userProfile/UserProfile.tsx')),
                key:uuidv4(),
                children:[{
                    path:'changepsw',
                    lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@core/pages/userProfile/ChangePsw.tsx')),
                    key:uuidv4()
                }]
            }
        ]
    },
]

const RenderRoutes = ()=> {
    return (
        <App className="h-full" message={{ maxCount: 1 }}>
            <Router>
                <Routes>
                    {generateRoutes(PUBLIC_ROUTES)}
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
function ProtectedRoute() {
    const {state} = useGlobalContext()
    return state.isAuthenticated? <BasicLayout project="core" /> : <Navigate to="/login" />;
  }

export default RenderRoutes