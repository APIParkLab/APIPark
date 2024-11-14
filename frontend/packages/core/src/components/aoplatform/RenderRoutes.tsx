
import { Navigate, RouterProvider, createBrowserRouter, RouteObject } from 'react-router-dom';
import BasicLayout from '@common/components/aoplatform/BasicLayout';
import {createElement,Suspense, useEffect, useState} from 'react';
import {Skeleton, Spin} from "antd";
import {useGlobalContext} from "@common/contexts/GlobalStateContext.tsx";
import usePluginLoader from '@common/hooks/pluginLoader.ts';
import { RouteConfig } from '@common/const/type.ts';
import { ApiparkPluginDriver } from '@common/utils/plugin.tsx';
import { routerMap } from '@core/const/const';
import withRouteGuard from "@common/components/aoplatform/WithRouteGuard.tsx";
import  ErrorBoundary from "@common/components/aoplatform/ErrorBoundary";
import React from 'react';
import { LoadingOutlined } from '@ant-design/icons';

const RenderRoutes = ()=> {
    const { loadPlugins,loadExecutedPlugin } = usePluginLoader(ApiparkPluginDriver(routerMap), routerMap)
    const { routeConfig } = useGlobalContext();
    const [router, setRouter] = useState<unknown>(null);
    
    useEffect(()=>{
        loadPlugins().then(()=>{
            loadExecutedPlugin()
        })
    },[])

    useEffect(() => {
        if (routeConfig && routeConfig.length > 0) {
            const routerInstance = createBrowserRouter(generateRoutes(routeConfig));
            setRouter(routerInstance);
        }
    }, [routeConfig]);

    if (!router) {
        return <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} spinning={true} className='w-full h-full flex items-center justify-center'></Spin>;
    }

    return (
        <RouterProvider router={router} />
    );
}

const generateRoutes = (routerConfig: RouteConfig[]):RouteObject[] => {
    return routerConfig?.map((route: RouteConfig) => {
            let routeElement;
            if (route.lazy) {
                let LazyComponent;
                if (typeof route.lazy === 'function') {
                    const result = route.lazy();
                    if (result instanceof Promise) {
                        LazyComponent = React.lazy(() => result.then(module => ({ default: module.default || module })));
                    } else {
                        LazyComponent = result;
                    }
                } else {
                    LazyComponent = route.lazy;
                }
                const GuardedComponent = withRouteGuard(LazyComponent, {pathPrefix:`/${route.pathPrefix ?? route.path}`, ...route.lifecycle});
                routeElement = (
                    <Suspense fallback={ <div className=''><Skeleton className='m-btnbase w-calc-100vw-minus-padding-r' active /></div>}>
                        {route.provider ? (
                            createElement(route.provider, {}, <GuardedComponent  />)
                        ) : (
                            <GuardedComponent />
                        )}
                    </Suspense>
                );
            } else {
                routeElement = route.provider ? (
                    createElement(route.provider, {},  route.component)
                ) : (
                    route.component
                );
            }

                return (
                  {
                    path: route.path,
                    element: <ErrorBoundary>{routeElement}</ErrorBoundary> ,
                    children: route.children ? generateRoutes(route.children as RouteConfig[]) : undefined,}
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
