import {
  ApiparkPluginDriverType,
  CoreObj,
  PluginConfigType,
  PluginRouterConfig,
  RouteConfig,
  RouterMapConfig
} from '@common/const/type'
import { isFunction } from 'lodash-es'
import React from 'react'
import { __federation_method_getRemote, __federation_method_setRemote } from 'virtual:__federation__'

interface RemoteModuleConfig {
  type: string
  remoteEntry: string
  exposedModule: string
  remoteName: string
}

export async function loadRemoteModule(remoteModuleConfig: RemoteModuleConfig) {
  __federation_method_setRemote(remoteModuleConfig.remoteName, {
    url: () => Promise.resolve(remoteModuleConfig.remoteEntry),
    format: 'esm',
    from: 'vite'
  })
  return await __federation_method_getRemote(remoteModuleConfig.remoteName, `./${remoteModuleConfig.exposedModule}`)
}

export function generateRemoteModuleTemplate(
  pluginName: string,
  exposedModule: string,
  pluginPath: string
): RemoteModuleConfig {
  return {
    type: 'module',
    remoteEntry: pluginPath,
    exposedModule,
    remoteName: pluginName
  }
}

/** check the lifecycle method of plugin */
export function validateExportLifecycle(exports: unknown) {
  const { bootstrap, mount, unmount } = exports ?? {}
  return isFunction(bootstrap) && isFunction(mount) && isFunction(unmount)
}

export const DEFAULT_LOCAL_PLUGIN_PATH = '/plugin-frontend/'

export const ApiparkPluginDriver = (routerMap: Map<string, RouterMapConfig>): ApiparkPluginDriverType => {
  return {
    builtIn: {
      component: (coreObj?: CoreObj, pluginConfig?: PluginConfigType) => {
        if (!coreObj || !pluginConfig) return coreObj
        for (const pluginRouter of pluginConfig.router) {
          routerMap.get(pluginConfig.name) &&
            coreObj.pluginProvider.setRouterConfig(pluginRouter.type === 'root', {
              ...routerMap.get(pluginConfig.name)!,
              key: pluginConfig.name,
              path: pluginRouter.path
            })
        }
        return coreObj
      }
    },
    remote: {
      normal: (coreObj?: CoreObj, pluginConfig?: PluginConfigType) => {
        if (!coreObj || !pluginConfig) return coreObj
        const routerToChanged: RouteConfig[] = coreObj.routerConfig.find(
          (router: RouteConfig) => router.path === '/' && router?.pathMatch !== 'full'
        )!.children as RouteConfig[]
        const remoteRouter: RouteConfig[] = routerToChanged.find(
          (item: RouteConfig) => item?.data?.['type'] === 'remotePlugin'
        ) as RouteConfig[]
        if (!remoteRouter) {
          routerMap.get('remote') &&
            coreObj.pluginProvider.setRouterConfig(false, {
              ...routerMap.get('remote')!,
              key: 'remote',
              path: 'remote',
              type: 'remotePlugin',
              children: [
                {
                  path: ':moduleName',
                  component: routerMap.get('remote')!.component
                }
              ]
            })
        }
        return coreObj
      }
    },
    intelligent: {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      normal: (coreObj?: CoreObj, pluginConfig?: PluginConfigType) => {
        if (!coreObj || !pluginConfig) return coreObj
        if (['logsettings', 'resourcesettings'].indexOf(pluginConfig.name) !== -1) {
          const routerToChanged: RouteConfig[] = coreObj.routerConfig.find(
            (router: RouteConfig) => router.path === '/' && router?.pathMatch !== 'full'
          )!.children as RouteConfig[]
          const remoteRouter: RouteConfig[] = routerToChanged.find(
            (item: RouteConfig) => item?.data?.['key'] === pluginConfig.name
          ) as RouteConfig[]
          if (!remoteRouter) {
            routerMap.get(pluginConfig.name) &&
              routerToChanged.unshift({
                ...routerMap.get(pluginConfig.name)!,
                key: pluginConfig.name,
                path: pluginConfig.path
              })
          }
          return
        }
        const remoteRouter = coreObj.routerConfig.find(
          (item: RouteConfig) => item?.data?.['type'] === 'intelligentPlugin'
        )
        if (!remoteRouter) {
          // coreObj.pluginProvider.setRouterConfig(false, {
          //   path: 'template',
          //   loadChildren: coreObj.builtInPluginLoader('intelligent'),
          //   data: {
          //     type: 'intelligentPlugin'
          //   }
          // }, coreObj.routerConfig)
        }
        return coreObj
      }
    },
    local: {
      router: (coreObj?: CoreObj, pluginConfig?: PluginConfigType) => {
        if (!coreObj || !pluginConfig) return coreObj
        for (const pluginRouter of pluginConfig.router) {
          if (pluginRouter.type === 'sub') {
            continue
          }
          updateRouterConfigWithPlugin(coreObj, pluginRouter, pluginConfig)
        }
        return coreObj
      },
      preload: (coreObj?: CoreObj, pluginConfig?: PluginConfigType) => {
        if (!coreObj || !pluginConfig) return coreObj
        coreObj.setExecuteList((prev) => [
          ...prev,
          { ...pluginConfig, expose: 'Bootstrap', bootstrap: 'BootstrapModule.bootstrap' }
        ])
        for (const pluginRouter of pluginConfig.router) {
          updateRouterConfigWithPlugin(coreObj, pluginRouter, pluginConfig)
        }
        return coreObj
      }
      // extender: (coreObj?:CoreObj, pluginConfig?:PluginConfigType) => {}
    }
  }
}
async function updateRouterConfigWithPlugin(
  coreObj: CoreObj,
  pluginRouter: PluginRouterConfig,
  pluginConfig: PluginConfigType
) {
  if (!pluginRouter.expose) {
    throw new Error('pluginRouter.expose is required')
  } else {
    for (const pluginRouter of pluginConfig.router) {
      const loadedModule = await coreObj.pluginLoader.loadModule(
        pluginRouter.path,
        pluginConfig.name,
        pluginRouter.expose!,
        pluginConfig.path || `${DEFAULT_LOCAL_PLUGIN_PATH}${pluginConfig.name}/apipark.js`
      )
      const loadedModulePage = loadedModule[pluginRouter.expose!]
      const LazyComponent = React.lazy(() =>
        Promise.resolve({ default: loadedModulePage?.default || loadedModulePage })
      )

      const newRouter: RouteConfig = {
        path: pluginRouter.path,
        key: pluginConfig.name,
        lazy: () => Promise.resolve({ default: (props: any) => <LazyComponent {...props} /> }),
        pathPrefix: pluginRouter.path.endsWith('/*') ? pluginRouter.path.slice(0, -2) : pluginRouter.path,
        lifecycle: {
          canActivate: loadedModule?.beforeMount,
          canLoad: loadedModule?.mount,
          canDeactivate: loadedModule?.beforeUnmount,
          deactivated: loadedModule?.unmount
        }
      }
      coreObj.pluginProvider.setRouterConfig(pluginRouter.type === 'root', newRouter)
    }
  }
}
