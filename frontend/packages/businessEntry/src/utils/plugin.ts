import { RouteConfig } from '@businessEntry/components/aoplatform/RenderRoutes';
import { routerMap } from '@businessEntry/consts/const';
import { isFunction } from 'lodash-es'
// @ts-expect-error module cannot find
import { __federation_method_setRemote,__federation_method_getRemote,__federation_method_unwrapDefault } from 'virtual:__federation__';

interface RemoteModuleConfig{
    type:string
    remoteEntry:string
    exposedModule:string
    remoteName:string
}

export async function loadRemoteModule(remoteModuleConfig:RemoteModuleConfig){
    __federation_method_setRemote(remoteModuleConfig.remoteName, {
        url: () => Promise.resolve(remoteModuleConfig.remoteEntry),
        format: 'esm',
        from: 'vite',
      });

    return await  __federation_method_getRemote(
        remoteModuleConfig.remoteName,
        `./${remoteModuleConfig.exposedModule}`
    )
}

export function generateRemoteModuleTemplate(
  pluginName: string,
  exposedModule: string,
  pluginPath: string
):RemoteModuleConfig {
  return {
    type: 'module',
    remoteEntry: pluginPath,
    exposedModule: `./${exposedModule}`,
    remoteName: pluginName
  }
}

/** 校验子应用导出的 生命周期 对象是否正确 */
export function validateExportLifecycle(exports: unknown) {
  const { bootstrap, mount, unmount } = exports ?? {}
  return isFunction(bootstrap) && isFunction(mount) && isFunction(unmount)
}



export const DEFAULT_LOCAL_PLUGIN_PATH = '/plugin-frontend/'
interface PluginRouterConfig {
  path:string;
  type:string;
  expose?:string
}
interface PluginConfig {
  name: string;
  router: Array<PluginRouterConfig>;
  path?: string;
  driver:string
}

export interface CoreObj {
  routerConfig: RouteConfig[];
  executeList: unknown[];
  pluginLoader: PluginLoaderService;
  pluginLifecycleGuard: PluginLifecycleGuard;
  pluginProvider: PluginProviderService;
  builtInPluginLoader: (name: string) => any;
}

const defaultBuiltInPlugin:Array<{path:string, pathMatch?:'full' | 'prefix', componentName?:string, type?:string}> = [
  { path: '/', pathMatch: 'full', componentName: 'login' },
  { path: '/login', componentName: 'login' },
  { path: '/', componentName: 'basicLayout' },
  // { path: '**', componentName: 'redirectPage' }

]


export const ApiparkPluginDriver:{[key:string]:{[key:string]:(coreObj?:CoreObj, pluginConfig?:PluginConfig)=>(CoreObj|undefined)}} = {
  builtIn: {
    // apinto主项目驱动，在core中自动调，不根据插件配置表
    default: (coreObj?:CoreObj) => {
      if(!coreObj) return coreObj
      const url = new URL(window.location.href)
      const navHidden = url.searchParams.get('nav_hidden') || sessionStorage.getItem('nav_hidden')
      if (navHidden === 'true') sessionStorage.setItem('nav_hidden', navHidden)
      const routes = defaultBuiltInPlugin.filter(plugin =>navHidden === 'true' && plugin.componentName === 'basicLayout' ? routerMap.get('navHidden')!.component : routerMap.get(plugin.componentName || plugin.path) ).map(plugin => (
        {
          path: plugin.path,
          component: navHidden === 'true' && plugin.componentName === 'basicLayout' ? routerMap.get('navHidden')!.component : routerMap.get(plugin.componentName || plugin.path)?.component,
          children: [],
          key:plugin.componentName,
          data: {
            type: plugin.type || plugin.componentName || plugin.path
          },
          pathMatch: plugin.pathMatch || 'prefix'
        })
      )
      console.log(routes)
      coreObj.routerConfig.push(...routes)
      return coreObj
    },
    component: (coreObj?:CoreObj, pluginConfig?:PluginConfig) => {
      if(!coreObj || !pluginConfig) return coreObj
      for (const pluginRouter of pluginConfig.router) {
        console.log(pluginRouter,{path: pluginRouter.path,component: routerMap.get(pluginConfig.name)?.component})
        const routerToChanged:RouteConfig[] = pluginRouter.type === 'root' ? coreObj.routerConfig : coreObj.routerConfig.find((router: RouteConfig) => router.path === '/' && router?.pathMatch !== 'full')!.children as RouteConfig[]
        // coreObj.pluginProvider.setRouterConfig(pluginRouter.type === 'root', {
        //   path: pluginRouter.path,
        //   component: routerMap.get(pluginConfig.name)!.component
        // }, coreObj.routerConfig)
        routerMap.get(pluginConfig.name) && routerToChanged.unshift({...routerMap.get(pluginConfig.name)!, key:pluginConfig.name, path:pluginRouter.path})
      }
      return coreObj
    },
    module: (coreObj?:CoreObj, pluginConfig?:PluginConfig) => {
      if(!coreObj || !pluginConfig) return coreObj
      for (const pluginRouter of pluginConfig.router) {
        const routerToChanged:RouteConfig[] = pluginRouter.type === 'root' ? coreObj.routerConfig : coreObj.routerConfig.find((router: RouteConfig) => router.path === '/' && router?.pathMatch !== 'full')!.children as RouteConfig[]
        console.log(pluginConfig,pluginRouter,routerMap.get(pluginRouter.name), {
          path: pluginRouter.path,
        })
        // coreObj.pluginProvider.setRouterConfig(pluginRouter.type === 'root', {
        //   path: pluginRouter.path,
        //   component: routerMap.get(pluginConfig.name)!.component,
        //   children: coreObj.builtInPluginLoader(pluginConfig.name)
        // }, coreObj.routerConfig)
        routerMap.get(pluginRouter.name) && routerToChanged.unshift({...routerMap.get(pluginRouter.name)!, key:pluginRouter.name, path:pluginRouter.path})
      }
      return coreObj
    },
    httpApi: () => {
      return undefined
    }
  },
  remote: {
    normal: (coreObj?:CoreObj, pluginConfig?:PluginConfig) => {
      if(!coreObj || !pluginConfig) return coreObj
      const remoteRouter = coreObj.routerConfig.find((item:RouteConfig) => item?.data?.['type'] === 'remotePlugin')
      if (!remoteRouter) {
        // coreObj.pluginProvider.setRouterConfig(false, {
        //   path: 'remote',
        //   children: [
        //     {
        //       path: ':moduleName',
        //       component: routerMap.get('remote').component
        //     }
        //   ],
        //   data: {
        //     type: 'remotePlugin'
        //   }
        // }, coreObj.routerConfig)
      }
      return coreObj
    }
  },
  intelligent: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    normal: (coreObj?:CoreObj, pluginConfig?:PluginConfig) => {
      if(!coreObj || !pluginConfig) return coreObj
      const remoteRouter = coreObj.routerConfig.find((item:RouteConfig) => item?.data?.['type'] === 'intelligentPlugin')
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
    router: (coreObj?:CoreObj, pluginConfig?:PluginConfig) => {
      if(!coreObj || !pluginConfig) return coreObj
      for (const pluginRouter of pluginConfig.router) {
        if (pluginRouter.type === 'sub') {
          continue
        }
        updateRouterConfigWithPlugin(coreObj, pluginRouter, pluginConfig)
      }
      return coreObj
    },
    preload: (coreObj?:CoreObj, pluginConfig?:PluginConfig) => {
      if(!coreObj || !pluginConfig) return coreObj
      coreObj.executeList.push({ ...pluginConfig, expose: 'Bootstrap', bootstrap: 'BootstrapModule.bootstrap' })
      for (const pluginRouter of pluginConfig.router) {
        updateRouterConfigWithPlugin(coreObj, pluginRouter, pluginConfig)
      }
      return coreObj
    }
    // extender: (coreObj?:CoreObj, pluginConfig?:PluginConfig) => {}
  }
}
function updateRouterConfigWithPlugin (coreObj: CoreObj, pluginRouter: PluginRouterConfig, pluginConfig: PluginConfig) {
  if (!pluginRouter.expose) {
    throw new Error('pluginRouter.expose is required')
  } else {
    // coreObj.pluginProvider.setRouterConfig(pluginRouter.type === 'root', {
    //   path: pluginRouter.path,
    //   loadChildren: () => coreObj.pluginLoader.loadModule(
    //     pluginRouter.path,
    //     pluginConfig.name,
    //     pluginRouter.expose!,
    //     pluginConfig.path || `${DEFAULT_LOCAL_PLUGIN_PATH}${pluginConfig.name}/ApiparkPluginDriver.js`
    //   ),
    //   canActivate: [coreObj.pluginLifecycleGuard],
    //   canActivateChild: [coreObj.pluginLifecycleGuard],
    //   canDeactivate: [coreObj.pluginLifecycleGuard],
    //   canLoad: [coreObj.pluginLifecycleGuard]
    // }, coreObj.routerConfig)
  }
}
