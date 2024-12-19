import { useEffect, useState } from 'react'
import { useGlobalContext } from '@common/contexts/GlobalStateContext'
import {
  DEFAULT_LOCAL_PLUGIN_PATH,
  generateRemoteModuleTemplate,
  loadRemoteModule,
  validateExportLifecycle
} from '@common/utils/plugin.tsx'
import { useFetch } from '@common/hooks/http'
import { PluginConfigType } from '@common/const/type.ts'
import { ApiparkPluginDriverType, RouterMapConfig } from '@common/const/type'
import { usePluginEventHub } from '@common/contexts/PluginEventHubContext'
import { usePluginSlotHub } from '@common/contexts/PluginSlotHubContext'
import { App } from 'antd'

const mockData = {
  buildAt: '2024-09-13T03:51:25Z',
  build_user: 'gitlab-runner',
  git_commint: '6438d5aaff146dc560ed0d8563788e64a49640a5',
  goversion: 'go version go1.21.4 linux/amd64',
  guide: true,
  plugins: [
    {
      driver: 'apipark.builtIn.component',
      name: 'guide',
      router: [
        {
          path: 'guide/*',
          type: 'normal'
        }
      ]
    },
    {
      driver: 'apipark.builtIn.component',
      name: 'team',
      router: [
        {
          path: 'team',
          type: 'normal'
        }
      ]
    },
    {
      driver: 'apipark.builtIn.component',
      name: 'service',
      router: [
        {
          path: 'service',
          type: 'normal'
        }
      ]
    },
    {
      driver: 'apipark.builtIn.component',
      name: 'datasourcing',
      router: [
        {
          path: 'datasourcing',
          type: 'normal'
        }
      ]
    },
    {
      driver: 'apipark.builtIn.component',
      name: 'cluster',
      router: [
        {
          path: 'cluster',
          type: 'normal'
        }
      ]
    },
    {
      driver: 'apipark.builtIn.component',
      name: 'aisetting',
      router: [
        {
          path: 'aisetting',
          type: 'normal'
        }
      ]
    },
    {
      driver: 'apipark.builtIn.component',
      name: 'cert',
      router: [
        {
          path: 'cert',
          type: 'normal'
        }
      ]
    },
    {
      driver: 'apipark.builtIn.component',
      name: 'serviceHub',
      router: [
        {
          path: 'serviceHub',
          type: 'normal'
        }
      ]
    },
    {
      driver: 'apipark.builtIn.component',
      name: 'commonsetting',
      router: [
        {
          path: 'commonsetting',
          type: 'normal'
        }
      ]
    },
    {
      driver: 'apipark.builtIn.component',
      name: 'consumer',
      router: [
        {
          path: 'consumer',
          type: 'normal'
        }
      ]
    },
    {
      driver: 'apipark.builtIn.component',
      name: 'member',
      router: [
        {
          path: 'member',
          type: 'normal'
        }
      ]
    },
    {
      driver: 'apipark.builtIn.component',
      name: 'role',
      router: [
        {
          path: 'role',
          type: 'normal'
        }
      ]
    },
    {
      driver: 'apipark.builtIn.component',
      name: 'analytics',
      router: [
        {
          path: 'analytics',
          type: 'normal'
        }
      ]
    },
    {
      driver: 'apipark.builtIn.component',
      name: 'template',
      router: [
        {
          path: 'template/:moduleId',
          type: 'normal'
        }
      ]
    },
    {
      driver: 'apipark.builtIn.component',
      name: 'logsettings',
      router: [
        {
          path: 'logsettings/*',
          type: 'normal'
        }
      ]
    },
    {
      driver: 'apipark.builtIn.component',
      name: 'resourcesettings',
      router: [
        {
          path: 'resourcesettings/*',
          type: 'normal'
        }
      ]
    },
    {
      driver: 'apipark.builtIn.component',
      name: 'userProfile',
      router: [
        {
          path: 'userProfile',
          type: 'normal'
        }
      ]
    },
    {
      driver: 'apipark.builtIn.component',
      name: 'globalPolicy',
      router: [
        {
          path: 'globalPolicy',
          type: 'normal'
        }
      ]
    }
    // {
    //   "driver": "apipark.remote.normal",
    //   "name": "remote",
    //   "router": [
    //     {
    //       "path": "remote",
    //       "type": "normal"
    //     }
    //   ]
    // },
    // {
    //   "driver": "apipark.local.preload",
    //   "name": "auth",
    //   "router": [
    //     {
    //       "expose": "AppModule",
    //       "path": "auth",
    //       "type": "root"
    //     },
    //     {
    //       "expose": "AuthInfoModule",
    //       "path": "auth-info",
    //       "type": "normal"
    //     }
    //   ]
    // },
    // {
    //   "driver": "apipark.builtIn.component",
    //   "name": "email",
    //   "router": [
    //     {
    //       "path": "system/email",
    //       "type": "normal"
    //     }
    //   ]
    // },
    // {
    //   "driver": "apipark.builtIn.module",
    //   "name": "open-api",
    //   "router": [
    //     {
    //       "path": "system/ext-app",
    //       "type": "normal"
    //     }
    //   ]
    // },
    // {
    //   "driver": "apipark.local.preload",
    //   "name": "remote",
    //   "router": [
    //     {
    //       "expose": "App",
    //       "path": "router1/*",
    //       "type": "normal"
    //     }
    //   ]
    // },
    // {
    //   "driver": "apipark.remote.normal",
    //   "name": "apispace",
    //   "router": [
    //     {
    //       "path": "remote/apispace",
    //       "type": "normal"
    //     }
    //   ]
    // }
  ],
  powered: 'Powered by https://eolink.com',
  product: 'apipark',
  version: '6438d5aa'
}

export type ExecutePluginType = PluginConfigType & {
  expose: string
  bootstrap: string
}

const usePluginLoader = (apipark: ApiparkPluginDriverType, routerMap: Map<string, RouterMapConfig>) => {
  const [modules, setModules] = useState(new Map())
  const [executeList, setExecuteList] = useState<ExecutePluginType[]>([])
  const [baseHref, setBaseHref] = useState('')
  const [pendingTasks, setPendingTasks] = useState(0)
  const { fetchData } = useFetch()
  const pluginProvider = useGlobalContext()
  const pluginEventHub = usePluginEventHub()
  const pluginSlotHub = usePluginSlotHub()
  const { getMenuList, dispatch } = pluginProvider
  const { modal, message } = App.useApp()
  const [startLoadExecutePlugin, setStartLoadExecutePlugin] = useState<boolean>(false)
  const messageService = message
  const modalService = modal
  let startInstallPlugin = false

  useEffect(() => {
    if (startLoadExecutePlugin && pendingTasks === 0 && executeList.length > 0) {
      loadExecutedPlugin()
    }
  }, [pendingTasks, executeList])

  const getModule = (routerPrefix: string, specific = false) => {
    if (routerPrefix.startsWith('/')) {
      routerPrefix = routerPrefix.substring(1)
    }
    if (specific) {
      return modules.get(routerPrefix)
    }
    let matchedModule = null
    let matchedLength = 0

    modules.forEach((value, key) => {
      if (routerPrefix.startsWith(key) && key.length > matchedLength) {
        matchedModule = value
        matchedLength = key.length
      }
    })
    return matchedModule
  }

  const loadModule = async (routerPrefix: string, pluginName: any, exposedModule: string, pluginPath: any) => {
    if (!modules.get(routerPrefix)) {
      try {
        const loadedModule = await loadRemoteModule(generateRemoteModuleTemplate(pluginName, exposedModule, pluginPath))
        const Module = loadedModule.default ?? loadedModule
        let ModuleBootstrap
        try {
          ModuleBootstrap = await loadRemoteModule(generateRemoteModuleTemplate(pluginName, 'Bootstrap', pluginPath))
        } catch (error) {
          console.warn('Bootstrap module not found:', error)
        }
        setModules((prevModules) => new Map(prevModules).set(routerPrefix, Module[exposedModule]))
        if (!validateExportLifecycle(Module)) {
          console.error('需要导出插件生命周期函数')
          return
        }
        await Module.bootstrap?.({
          pluginProvider,
          pluginEventHub,
          pluginSlotHub
        })
        return Module
      } catch (error) {
        console.error('导入插件失败：', error)
      }
    }
    return getModule(routerPrefix, true)
  }

  const loadExecutedPlugin = async () => {
    setStartLoadExecutePlugin(true)
    for (const plugin of executeList) {
      try {
        const Module = await loadRemoteModule(
          generateRemoteModuleTemplate(
            plugin.name,
            plugin?.expose || 'Bootstrap',
            plugin.path || `${DEFAULT_LOCAL_PLUGIN_PATH}${plugin.name}/apipark.js`
          )
        )
        const bootstrap = Module.bootstrap
        if (!bootstrap) {
          console.warn('立即执行插件未导出Bootstrap模块或bootstrap函数')
        } else {
          await bootstrap({
            pluginEventHub,
            pluginSlotHub,
            pluginProvider,
            platformProvider: null,
            messageService,
            modalService
          })
        }
      } catch (error) {
        console.error('执行插件失败：', error)
      }
    }
  }

  const loadPlugins = () => {
    return new Promise((resolve) => {
      if (startInstallPlugin) {
        return resolve(true)
      }
      startInstallPlugin = true
      installPlugin().then(async (res) => {
        // reset route after loading executed plugins
        await loadExecutedPlugin()
        return resolve(res)
      })
    })
  }

  const installPlugin = () => {
    return new Promise((resolve, reject) => {
      // fetchData('system/plugins',{method:'GET'}).then((resp) => {
      // if (resp.code === 0){
      const resp = { data: mockData }
      dispatch({ type: 'UPDATE_VERSION', version: resp.data.version })
      dispatch({ type: 'UPDATE_DATE', updateDate: resp.data.buildAt })
      dispatch({ type: 'UPDATE_POWER', powered: resp.data.powered })
      const driverMethod = { apipark: apipark }
      const pluginConfigList = resp.data.plugins
      const pluginLoader = { loadModule }
      const pluginLifecycleGuard = {}
      const builtInPluginLoader = loadBuiltInModule
      pluginSlotHub.addSlot('renewMenu', () => {
        getMenuList()
      })
      for (const plugin of pluginConfigList) {
        try {
          const driverName = plugin.driver
          if (!driverName) {
            console.error('no driver name')
            continue
          }
          const driver = driverName
            .split('.')
            .reduce(
              (driverMethod: { [x: string]: any }, driverName: string | number) => driverMethod[driverName],
              driverMethod
            )
          if (driverName.split('.')[2] === 'preload') {
            setPendingTasks((prev) => prev + 1)
          }
          ;(driver as Function)?.(
            {
              setExecuteList: (callback: ExecutePluginType[]) => {
                setExecuteList(callback)
                setPendingTasks((prev) => prev - 1)
              },
              pluginLoader,
              pluginProvider,
              pluginLifecycleGuard,
              builtInPluginLoader
            },
            plugin
          )
        } catch (err) {
          console.warn('安装插件出错：', err)
        }
      }
      resolve(true)
      // } else {
      //   messageService.error(resp.msg || '获取插件配置列表失败，请重试!');
      //   reject(new Error(resp.msg || '获取插件配置列表失败'));
      // }
      // });
    })
  }

  const loadBuiltInModule = (pluginName: any) => {
    try {
      const { module } = routerMap.get(pluginName)!
      return module
    } catch (err) {
      console.warn(`安装内置插件[${pluginName}]出错：`, err)
    }
  }

  return {
    loadPlugins,
    loadModule,
    loadExecutedPlugin,
    setBaseHref,
    getModule
  }
}

export default usePluginLoader
