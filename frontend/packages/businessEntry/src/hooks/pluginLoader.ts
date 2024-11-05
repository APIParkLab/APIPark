import { useState } from "react";
import { useGlobalContext } from "@common/contexts/GlobalStateContext";
import { App } from "antd";
import { ApiparkPluginDriver as apipark, CoreObj, generateRemoteModuleTemplate, loadRemoteModule, validateExportLifecycle } from "@businessEntry/utils/plugin";
import { useFetch } from "@common/hooks/http";
import { RouteConfig } from "@businessEntry/components/aoplatform/RenderRoutes";
import { routerMap } from "@businessEntry/consts/const";

const mockData = {
  buildAt:'2024-09-13T03:51:25Z',
  build_user:'gitlab-runner',
  git_commint:'6438d5aaff146dc560ed0d8563788e64a49640a5',
  goversion:'go version go1.21.4 linux/amd64',
  guide:true,
  plugins:[
    {
      driver:'apipark.builtIn.component',
      name:'guide',
      router:[
        {
          path:'guide/*',
          type:'normal'
        }
      ]
    },
    {
      driver:'apipark.builtIn.component',
      name:'team',
      router:[
        {
          path:'team',
          type:'normal'
        }
      ]
    },
    {
      driver:'apipark.builtIn.component',
      name:'service',
      router:[
        {
          path:'service',
          type:'normal'
        }
      ]
    },
    {
      driver:'apipark.builtIn.component',
      name:'datasourcing',
      router:[
        {
          path:'datasourcing',
          type:'normal'
        }
      ]
    },
    {
      driver:'apipark.builtIn.component',
      name:'cluster',
      router:[
        {
          path:'cluster',
          type:'normal'
        }
      ]
    },
    {
      driver:'apipark.builtIn.component',
      name:'aisetting',
      router:[
        {
          path:'aisetting',
          type:'normal'
        }
      ]
    },
    {
      driver:'apipark.builtIn.component',
      name:'cert',
      router:[
        {
          path:'cert',
          type:'normal'
        }
      ]
    },
    {
      driver:'apipark.builtIn.component',
      name:'serviceHub',
      router:[
        {
          path:'serviceHub',
          type:'normal'
        }
      ]
    },
    {
      driver:'apipark.builtIn.component',
      name:'commonsetting',
      router:[
        {
          path:'commonsetting',
          type:'normal'
        }
      ]
    },
    {
      driver:'apipark.builtIn.component',
      name:'consumer',
      router:[
        {
          path:'consumer',
          type:'normal'
        }
      ]
    },
    {
      driver:'apipark.builtIn.component',
      name:'member',
      router:[
        {
          path:'member',
          type:'normal'
        }
      ]
    },
    {
      driver:'apipark.builtIn.component',
      name:'role',
      router:[
        {
          path:'role',
          type:'normal'
        }
      ]
    },
    {
      driver:'apipark.builtIn.component',
      name:'analytics',
      router:[
        {
          path:'analytics',
          type:'normal'
        }
      ]
    },
    {
      driver:'apipark.builtIn.component',
      name:'template',
      router:[
        {
          path:'template/:moduleId',
          type:'normal'
        }
      ]
    },
    {
      driver:'apipark.builtIn.component',
      name:'logsettings',
      router:[
        {
          path:'logsettings/*',
          type:'normal'
        }
      ]
    },
    {
      driver:'apipark.builtIn.component',
      name:'resourcesettings',
      router:[
        {
          path:'resourcesettings/*',
          type:'normal'
        }
      ]
    },
    {
      driver:'apipark.builtIn.component',
      name:'userProfile',
      router:[
        {
          path:'userProfile',
          type:'normal'
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
    //   "driver": "apipark.local.router",
    //   "name": "monitor",
    //   "router": [
    //     {
    //       "expose": "AppModule",
    //       "path": "monitor",
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
  powered:'Powered by https://eolink.com',
  product:'apipark',
  version:'6438d5aa'
}

const usePluginLoader = () => {
    const [modules, setModules] = useState(new Map());
    const [executeList, setExecuteList] = useState([]);
    const [baseHref, setBaseHref] = useState('');
    const [redirectUrl, setRedirectUrl] = useState('');
    const {fetchData}  = useFetch();
    const pluginProvider = useGlobalContext();
    const {state, dispatch,getMenuList,pluginEventHub,pluginSlotHubService:pluginSlotHub} = pluginProvider
    const { finalRouterConfig, setFinalRouterConfig} = useState<RouteConfig[]>([])
    const {message:messageService, modal:modalService} = App.useApp();
  
    const getModule = (routerPrefix:string, specific = false) => {
      if (routerPrefix.startsWith('/')) {
        routerPrefix = routerPrefix.substring(1);
      }
      if (specific) {
        return modules.get(routerPrefix);
      }
      let matchedModule = null;
      let matchedLength = 0;
  
      modules.forEach((value, key) => {
        if (routerPrefix.startsWith(key) && key.length > matchedLength) {
          matchedModule = value;
          matchedLength = key.length;
        }
      });
      return matchedModule;
    };
  
    const loadModule = async (routerPrefix: string, pluginName: any, exposedModule: string , pluginPath: any) => {
      if (!modules.get(routerPrefix)) {
        try {
          const Module = await loadRemoteModule(generateRemoteModuleTemplate(pluginName, exposedModule, pluginPath));
          setModules(prevModules => new Map(prevModules).set(routerPrefix, Module));
          if (!validateExportLifecycle(Module)) {
            console.error('需要导出插件生命周期函数');
            return;
          }
          await Module.bootstrap?.({
            pluginProvider,
            pluginEventHub: pluginEventHub,
            pluginSlotHub
          });
          return Module[exposedModule];
        } catch (error) {
          console.error('导入插件失败：', error);
        }
      }
      return getModule(routerPrefix, true)[exposedModule];
    };
  
    const loadExecutedPlugin = async () => {
      for (const plugin of executeList) {
        try {
          const Module = await loadRemoteModule(generateRemoteModuleTemplate(plugin.name, plugin?.expose || 'Bootstrap', plugin.path || `${DEFAULT_LOCAL_PLUGIN_PATH}${plugin.name}/apipark.js`));
          const bootstrap = Module.bootstrap;
          if (!bootstrap) {
            console.warn('立即执行插件未导出Bootstrap模块或bootstrap函数');
          } else {
            await bootstrap({
              pluginEventHub,
              pluginSlotHub,
              pluginProvider,
              platformProvider:null,
              closeModal,
              messageService,
              modalService,
              apiService:fetchData
            });
          }
        } catch (error) {
          console.error('执行插件失败：', error);
        }
      }
    };
  
    // TODO 暂未找到关闭弹窗的全局方法
    const closeModal = () => {
    };
  
    const loadPlugins = () => {
      return new Promise((resolve) => {
        const routerConfig:  RouteConfig[] = [];
        apipark['builtIn'].default({ routerConfig } as CoreObj);
         installPlugin(routerConfig).then(async (res)=>{
          // reset route after loading executed plugins
          // TODO 需要测试次式executeList是否已经更新，如果没有更新的话要修改executeList 更新的写法
          await loadExecutedPlugin();
          resolve(res)
         })
      });
    };
  
    const installPlugin = (routerConfig: any[]) => {
      return new Promise((resolve, reject) => {
        // fetchData('system/plugins',{method:'GET'}).then((resp) => {
          // if (resp.code === 0){
          const resp = {data:mockData}
            dispatch({type:'UPDATE_VERSION',version:resp.data.version})
            dispatch({type:'UPDATE_DATE',updateDate:resp.data.buildAt})
            dispatch({type:'UPDATE_POWER',powered:resp.data.powered})
            const driverMethod = { apipark: apipark };
            const pluginConfigList = resp.data.plugins;
            const pluginLoader = { loadModule };
            const pluginLifecycleGuard ={};
            const builtInPluginLoader = loadBuiltInModule;
            pluginSlotHub.addSlot('renewMenu', () => {
              getMenuList()
            });
            for (const plugin of pluginConfigList) {
              try {
                const driverName = plugin.driver;
                if (!driverName) {
                  console.error('no driver name');
                  continue;
                }
                const driver = driverName.split('.').reduce((driverMethod: { [x: string]: any; }, driverName: string | number) => driverMethod[driverName], driverMethod);
                driver({ routerConfig, setExecuteList, pluginLoader, pluginProvider, pluginLifecycleGuard, builtInPluginLoader }, plugin);
              } catch (err) {
                console.warn('安装插件出错：', err);
              }
            }
            resolve(routerConfig);
          // } else {
          //   messageService.error(resp.msg || '获取插件配置列表失败，请重试!');
          //   reject(new Error(resp.msg || '获取插件配置列表失败'));
          // }
        // });
      }
    );
    };
  
    const loadBuiltInModule = (pluginName: any) => {
      try {
        const { module } = routerMap.get(pluginName);
        return module;
      } catch (err) {
        console.warn(`安装内置插件[${pluginName}]出错：`, err);
      }
    };
  
    return {
      loadPlugins,
      loadModule,
      loadExecutedPlugin,
      closeModal,
      setBaseHref,
      getModule
    };
  };
  
  export default usePluginLoader;