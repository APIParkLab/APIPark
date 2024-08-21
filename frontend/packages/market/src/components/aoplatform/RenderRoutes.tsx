
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Login from "@core/pages/Login.tsx"
import BasicLayout from '@common/components/aoplatform/BasicLayout';
import {createElement, ReactElement,ReactNode,Suspense} from 'react';
import { v4 as uuidv4 } from 'uuid'
import {App, Skeleton} from "antd";
import {useGlobalContext} from "@common/contexts/GlobalStateContext.tsx";
import {FC,lazy} from 'react';
import { TenantManagementProvider } from '@market/contexts/TenantManagementContext.tsx';

type RouteConfig = {
    path:string
    component?:ReactElement
    children?:RouteConfig[]
    key:string
    provider?:FC<{ children: ReactNode; }>
    lazy?:unknown
}

export type RouterParams  = {
    teamId:string
    systemId:string
    apiId:string
    serviceId:string
    clusterId:string;
    memberGroupId:string
    userGroupId:string
    pluginName:string
    moduleId:string
    accessType:'project'|'team'|'system'
    categoryId:string
    tagId:string
    dashboardType:string
    dashboardDetailId:string
    topologyId:string
    appId:string
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
            {
                path:'serviceHub',
                component:<Outlet />,
                key:uuidv4(),
                children:[
                    {
                        path:'list',
                        // component:<ServiceHubList/>,
                        key:uuidv4(),
                        lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@market/pages/serviceHub/ServiceHubList.tsx')),
                    },
                    {
                        path:'detail/:serviceId',
                        // component:<ServiceHubDetail/>,
                        key:uuidv4(),
                        lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@market/pages/serviceHub/ServiceHubDetail.tsx')),
                    }
                ]
            },
            {
                path:'tenantManagement',
                component:<Outlet />,
                provider:TenantManagementProvider,
                key:uuidv4(),
                children:[
                    {
                        path:':teamId/inside/:appId',
                        // component:<ServiceHubList/>,
                        key:uuidv4(),
                        lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@market/pages/serviceHub/management/ManagementInsidePage.tsx')),
                        children:[
                            {
                                path:'service',
                                // component:<ServiceHubList/>,
                                key:uuidv4(),
                                lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@market/pages/serviceHub/management/ManagementInsideService.tsx')),
                            },
                            {
                                path:'authorization',
                                // component:<ServiceHubList/>,
                                key:uuidv4(),
                                lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@market/pages/serviceHub/management/ManagementInsideAuth.tsx')),
                            },
                            {
                                path:'setting',
                                // component:<ServiceHubList/>,
                                key:uuidv4(),
                                lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@market/pages/serviceHub/management/ManagementAppSetting.tsx')),
                            },
                        ]
                    },
                    {
                        path:'list',
                        // component:<ServiceHubList/>,
                        key:uuidv4(),
                        lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@market/pages/serviceHub/management/ServiceHubManagement.tsx')),
                    },
                    {
                        path:'list/:teamId',
                        // component:<ServiceHubList/>,
                        key:uuidv4(),
                        lazy:lazy(() => import(/* webpackChunkName: "[request]" */ '@market/pages/serviceHub/management/ServiceHubManagement.tsx')),
                    },
                ]
            },
            {
                path:'*',
                component:<Navigate to={'/serviceHub/list'}  replace />,
                key:uuidv4(),
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
                    {route.children && generateRoutes(route.children)}
                  </Route>
                );
              }
        )
}

// 保护的路由组件
function ProtectedRoute() {
    const {state} = useGlobalContext()
    return state.isAuthenticated? <BasicLayout project="market"/> : <Navigate to="/login" />;
  }

export default RenderRoutes