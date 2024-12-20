import { LoadingOutlined } from '@ant-design/icons'
import BasicLayout from '@common/components/aoplatform/BasicLayout'
import ErrorBoundary from '@common/components/aoplatform/ErrorBoundary'
import withRouteGuard from '@common/components/aoplatform/WithRouteGuard.tsx'
import { RouteConfig } from '@common/const/type.ts'
import { useGlobalContext } from '@common/contexts/GlobalStateContext.tsx'
import usePluginLoader from '@common/hooks/pluginLoader.ts'
import { ApiparkPluginDriver } from '@common/utils/plugin.tsx'
import { routerMap } from '@core/const/const'
import { Skeleton, Spin } from 'antd'
import React, { createElement, Suspense, useEffect, useState } from 'react'
import { createBrowserRouter, RouteObject, RouterProvider } from 'react-router-dom'

const RenderRoutes = () => {
  const { loadPlugins, loadExecutedPlugin } = usePluginLoader(
    ApiparkPluginDriver(routerMap),
    routerMap
  )
  const { routeConfig, dispatch, state } = useGlobalContext()
  const [router, setRouter] = useState<unknown>(null)

  useEffect(() => {
    loadPlugins().then(() => {
      loadExecutedPlugin()
    })
  }, [])

  useEffect(() => {
    if (routeConfig && routeConfig.length > 0) {
      const routerInstance = createBrowserRouter(generateRoutes(routeConfig))
      setRouter(routerInstance)
      dispatch({ type: 'SET_PLUGINS_LOADED', pluginsLoaded: true })
    }
  }, [routeConfig])

  if (!router || !state?.pluginsLoaded) {
    return (
      <Spin
        indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}
        spinning={true}
        className="flex justify-center items-center w-full h-full"
      ></Spin>
    )
  }

  return <RouterProvider router={router} />
}

const generateRoutes = (routerConfig: RouteConfig[]): RouteObject[] => {
  return routerConfig?.map((route: RouteConfig) => {
    let routeElement
    if (route.lazy) {
      let LazyComponent
      if (typeof route.lazy === 'function') {
        const result = route.lazy()
        if (result instanceof Promise) {
          LazyComponent = React.lazy(() =>
            result.then(module => ({ default: module.default || module }))
          )
        } else {
          LazyComponent = result
        }
      } else {
        LazyComponent = route.lazy
      }
      const GuardedComponent = route.lifecycle
        ? withRouteGuard(LazyComponent, {
            pathPrefix: `/${route.pathPrefix ?? route.path}`,
            ...route.lifecycle
          })
        : LazyComponent
      routeElement = (
        <Suspense
          fallback={
            <div className="">
              <Skeleton className="m-btnbase w-calc-100vw-minus-padding-r" active />
            </div>
          }
        >
          {route.provider ? (
            createElement(route.provider, {}, <GuardedComponent />)
          ) : (
            <GuardedComponent />
          )}
        </Suspense>
      )
    } else {
      routeElement = route.provider
        ? createElement(route.provider, {}, route.component)
        : route.component
    }

    return {
      path: route.path,
      element: <ErrorBoundary>{routeElement}</ErrorBoundary>,
      children: route.children ? generateRoutes(route.children as RouteConfig[]) : undefined,
      exact: route?.pathMatch === 'full'
    }
  })
}

// 保护的路由组件
export function ProtectedRoute() {
  // return state.isAuthenticated? <BasicLayout project="core" /> : <Navigate to="/login" />;
  return <BasicLayout project="core" />
}

export default RenderRoutes
