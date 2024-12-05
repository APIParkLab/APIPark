import {createContext, Dispatch, FC, ReactNode, useContext, useEffect, useReducer, useState} from "react";
import { useFetch } from "@common/hooks/http";
import { App } from "antd";
import { BasicResponse, RESPONSE_TIPS, STATUS_CODE } from "@common/const/const";
import { checkAccess } from "@common/utils/permission";
import { PERMISSION_DEFINITION } from "@common/const/permissions";
import { $t } from "@common/locales";
import { MenuItem } from "@common/utils/navigation";
import { ErrorBoundary } from "@ant-design/pro-components";
import NotFound from "@common/components/aoplatform/NotFound";
import { RouteConfig } from "@common/const/type";
import { ProtectedRoute } from "@core/components/aoplatform/RenderRoutes";
import Login from "@core/pages/Login";
import { useLocaleContext } from "./LocaleContext";
import Root from "@core/pages/Root"
import DataMaskingCompare from "@core/pages/policy/dataMasking/DataMaskingCompare";
interface GlobalState {
    isAuthenticated: boolean;
    userData: UserData | null;
    version: string;
    updateDate: string;
    powered:string;
    mainPage:string;
    language:string;
    pluginsLoaded:boolean
}

interface UserData {
    username: string;
}

export type GlobalAction =
    | { type: 'LOGIN'}
    | { type: 'LOGOUT' }
    | { type: 'UPDATE_USERDATA'; userData: UserData }
    | { type: 'UPDATE_VERSION'; version: string }
    | { type: 'UPDATE_DATE'; updateDate: string }
    | { type: 'UPDATE_POWER'; powered: string }
    | { type: 'UPDATE_MAIN_PAGE'; mainPage: string }
    | { type: 'UPDATE_LANGUAGE'; language: string }
    | { type: 'SET_PLUGINS_LOADED'; pluginsLoaded: boolean }


    const mockData = [
        {
          "name": "工作空间",
          "key": "workspace",
          "path": "/guide",
          "icon": "ic:baseline-space-dashboard",
          "children": [
            {
              "name": "首页",
              "key": "guide",
              "path": "/guide",
              "icon": "ic:baseline-home",
              "access": "all"
            },
            {
              "name": "服务",
              "key": "service",
              "path": "/service",
              "icon": "ic:baseline-blinds-closed",
              "access": "all"
            },
            {
              "name": "消费者",
              "key": "consumer",
              "path": "/consumer",
              "icon": "ic:baseline-apps",
              "access": "all"
            },
            {
              "name": "团队",
              "key": "team",
              "path": "/team",
              "icon": "ic:baseline-people-alt",
              "access": "all"
            },
            // {
            //   "name": "路由组件",
            //   "key": "router",
            //   "path": "/router1",
            //   "icon": "ic:baseline-people-alt",
            //   "access": "all"
            // }
          ]
        },
        {
          "name": "API 市场",
          "key": "serviceHub",
          "path": "/serviceHub",
          "icon": "ic:baseline-hub",
          "access": "system.api_portal.api_portal.view"
        },
        {
          "name": "仪表盘",
          "key": "analytics",
          "path": "/analytics",
          "icon": "ic:baseline-bar-chart",
          "children": [
            {
              "name": "运行视图",
              "key": "analytics",
              "path": "/analytics",
              "icon": "ic:baseline-bar-chart",
              "access": "system.analysis.run_view.view"
            }
          ],
          "access": "system.analysis.run_view.view"
        },
        {
          "name": "系统设置",
          "key": "operationCenter",
          "path": "/commonsetting",
          "icon": "ic:baseline-settings",
          "children": [
            {
              "name": "系统",
              "key": "serviceHubSetting",
              "path": "/commonsetting",
              "children": [
                {
                  "name": "常规",
                  "key": "commonsetting",
                  "path": "/commonsetting",
                  "icon": "ic:baseline-hub",
                  "access": "system.api_market.service_classification.view"
                },
                {
                  "name": "API 网关",
                  "key": "cluster",
                  "path": "/cluster",
                  "icon": "ic:baseline-device-hub",
                  "access": "system.settings.api_gateway.view"
                },
                {
                  "name": "AI 模型",
                  "key": "aisetting",
                  "path": "/aisetting",
                  "icon": "hugeicons:ai-network",
                  "access": "system.settings.ai_provider.view"
                }
              ],
            },
            {
              "name": "用户",
              "key": "organization",
              "path": "/member",
              "children": [
                {
                  "name": "账号",
                  "key": "member",
                  "path": "/member",
                  "icon": "ic:baseline-people-alt",
                  "access": "system.settings.account.view"
                },
                {
                  "name": "角色",
                  "key": "role",
                  "path": "/role",
                  "icon": "ic:baseline-verified-user",
                  "access": "system.organization.role.view"
                }
              ]
            },
            {
              "name": "集成",
              "key": "maintenanceCenter",
              "path": "/datasourcing",
              "children": [
                {
                  "name": "数据源",
                  "key": "datasourcing",
                  "path": "/datasourcing",
                  "icon": "ic:baseline-monitor-heart",
                  "access": "system.settings.data_source.view"
                },
                {
                  "name": "全局策略",
                  "key": "globalpolicy",
                  "path": "/globalpolicy",
                  "icon": "icon-park-solid:exchange-three",
                  "access": "system.settings.data_source.view"
                },
                {
                  "name": "证书",
                  "key": "cert",
                  "path": "/cert",
                  "icon": "ic:baseline-security",
                  "access": "system.settings.ssl_certificate.view"
                },
                {
                  "name": "日志",
                  "key": "logsettings",
                  "path": "/logsettings",
                  "icon": "ic:baseline-sticky-note-2",
                  "access": "system.settings.log_configuration.view"
                },
              ]
            }
          ]
        }
      ]
  
      
/*
    存储用户登录、信息、权限等数据
*/
export const GlobalContext = createContext<{
    state: GlobalState;
    dispatch: Dispatch<GlobalAction>;
    accessData:Map<string,string[]>;
    pluginAccessDictionary:{[k:string]:string};
    menuList:MenuItem[];
    getGlobalAccessData:()=>Promise<{ access:string[]}>;
    getTeamAccessData:(teamId:string)=>void;
    getPluginAccessDictionary:(pluginData:{[k:string]:string})=>void
    getMenuList:()=>void
    resetAccess:()=>void
    cleanTeamAccessData:()=>void
    checkPermission:(access:keyof typeof PERMISSION_DEFINITION[0] | Array<keyof typeof PERMISSION_DEFINITION[0]>)=>boolean
    teamDataFlushed:boolean
    accessInit:boolean
    aiConfigFlushed:boolean
    setAiConfigFlushed:(flush:boolean)=>void
    routeConfig: RouteConfig[];
    setRouterConfig: (isRoot: boolean, config: RouteConfig) => void;
    addRouteConfig: (parentRoute: RouteConfig, config: RouteConfig) => void;
    fetchData: ReturnType<typeof useFetch>['fetchData'];
    $t: typeof $t;
} | undefined>(undefined);

const globalReducer = (state: GlobalState, action: GlobalAction): GlobalState => {
    switch (action.type) {
        case 'LOGIN':
            return {
                ...state,
                isAuthenticated: true,
            };
        case 'LOGOUT':
            return {
                ...state,
                isAuthenticated: false,
                userData: null,
            }
        case 'UPDATE_USERDATA':
            return {
                ...state,
                userData: action.userData,
            };
        case 'UPDATE_VERSION':
            return {
                ...state,
                version: action.version,
            };
        case 'UPDATE_DATE':
            return {
                ...state,
                updateDate: action.updateDate,
            };
        case 'UPDATE_POWER':
            return {
                ...state,
                powered: action.powered,
            };
        case 'UPDATE_MAIN_PAGE':
            return {
                ...state,
                mainPage: action.mainPage,
            };
        case 'UPDATE_LANGUAGE':
            return {
                ...state,
                language: action.language,
            };
        case 'SET_PLUGINS_LOADED':
            return {
                ...state,
                pluginsLoaded: action.pluginsLoaded,
            };
        default:
            return state;
    }
};


export const DefaultRouteConfig = [
  { path: '/', pathMatch: 'full', component: <Root /> ,key:'root',},
  { path: '/login', component: <Login /> ,key:'login'},
  { path: '/dataMaskCompare/:logId/:serviceId?/:teamId?', component: <DataMaskingCompare /> ,key:'dataMaskCompare'},
  { path: '/', pathMatch:'prefix',component:<ProtectedRoute /> ,key:'basciLayout',children:[
    { path: '*', component: <ErrorBoundary><NotFound/></ErrorBoundary>, key: 'errorBoundary' }
  ]}
]
// Create a context provider component
export const GlobalProvider: FC<{children:ReactNode}> = ({ children }) => {
    const { message } = App.useApp()
    const { setLocale } = useLocaleContext();
    const [state, dispatch] = useReducer(globalReducer, {
        isAuthenticated: false, //mock用
        userData: null,
        version: '1.0.0',
        updateDate: '2024-07-01',
        powered:'Powered by https://apipark.com',
        mainPage:'/guide/page',
        language:'en-US',
        pluginsLoaded:false
    });
    const [accessData,setAccessData] = useState<Map<string,string[]>>(new Map())
    const [pluginAccessDictionary, setPluginAccessDictionary] = useState<{[k:string]:string}>({})
    const [teamDataFlushed, setTeamDataFlushed] = useState<boolean>(false)
    const [accessInit, setAccessInit] = useState<boolean>(false)
    const [aiConfigFlushed, setAiConfigFlushed] = useState<boolean>(false)
    let getGlobalAccessPromise: Promise<BasicResponse<{ access:string[] }>> | null = null
    const [menuList, setMenuList] = useState<MenuItem[]>(mockData);
    const [routeConfig, setRouteConfigState] = useState<RouteConfig[]>(DefaultRouteConfig)

    useEffect(() => {
      setLocale(state.language);
    }, [state.language, setLocale]);
    
    const { fetchData } = useFetch();
  
    const setRouterConfig = (isRoot: boolean, config: RouteConfig) => {
      setRouteConfigState(prevConfig => {
        if (isRoot) {
          return [config,...prevConfig];
        } else {
          const rootRoute = prevConfig.find(route => route.path === '/' && route?.pathMatch === 'prefix') ;
          if (rootRoute ) {
            rootRoute.children = rootRoute.children ? [config, ...rootRoute.children] : [config];
          }
          return [...prevConfig];
        }
      });
    };
  
    const addRouteConfig = (parentRoute: RouteConfig, config: RouteConfig) => {
      const addConfigToParent = (routes: RouteConfig[]): RouteConfig[] => {
        return routes.map(route => {
          if (route.key === parentRoute.key) {
            route.children = route.children ? [...route.children, config] : [config];
          } else if (route.children) {
            route.children = addConfigToParent(route.children);
          }
          return route;
        });
      };
  
      setRouteConfigState(prevConfig => addConfigToParent(prevConfig));
    };

    const getGlobalAccessData = ()=>{
        if(getGlobalAccessPromise){
            return getGlobalAccessPromise
        }
        getGlobalAccessPromise = new Promise((resolve, reject) => fetchData<BasicResponse<{ access:string[]}>>('profile/permission/system',{method:'GET'},).then(response=>{
            const {code,data,msg} = response
            if(code === STATUS_CODE.SUCCESS){
                setAccessInit(true)
                setAccessData(prevData => new Map(prevData).set('system', data.access))
                resolve(data.response)
                getGlobalAccessPromise = null
            }else{
                message.error(msg || $t(RESPONSE_TIPS.error))
                reject(data.msg || $t(RESPONSE_TIPS.error))
            }
        })
        )
        return getGlobalAccessData
    }

    const getTeamAccessData = (teamId:string)=>{
        fetchData<BasicResponse<{ access:string[]}>>('profile/permission/team',{method:'GET',eoParams:{team:teamId}},).then(response=>{
            const {code,data,msg} = response
            if(code === STATUS_CODE.SUCCESS){
                setAccessData(prevData => new Map(prevData).set('team', data.access))
                setTeamDataFlushed(true)
            }else{
                message.error(msg || $t(RESPONSE_TIPS.error))
            }
            })
        }

    const getMenuList = ()=>{
        // TODO 等待对接后端接口
        // fetchData<BasicResponse<{ access:string[]}>>('profile/permission/team',{method:'GET',eoParams:{team:teamId}},).then(response=>{
        //     const {code,data,msg} = response
        //     if(code === STATUS_CODE.SUCCESS){
        //         setMenuList(data.menus)
        //     }else{
        //         message.error(msg || $t(RESPONSE_TIPS.error))
        //     }
        //     })
        }

    const cleanTeamAccessData = ()=>{
        setTeamDataFlushed(false)
        setAccessData(prevData => prevData.set('team',[]))
    }

    const getPluginAccessDictionary = (pluginData:{[k:string]:string})=>{
        setPluginAccessDictionary(pluginData)
    }

    const resetAccess = ()=>{
        setAccessData(new Map())
        setAccessInit(false)
        setPluginAccessDictionary({})
    }

    const checkPermission =  (access:keyof typeof PERMISSION_DEFINITION[0] | Array<keyof typeof PERMISSION_DEFINITION[0]>)=>{
        let revs = false;
        if (Array.isArray(access)) {
            revs = access.some(item => checkAccess(item, accessData));
        } else {
            revs = checkAccess(access, accessData);
        }
        return revs
    }



    return (
        <GlobalContext.Provider value={
            { state, dispatch,
              accessData,
              pluginAccessDictionary,
            getGlobalAccessData,
            getPluginAccessDictionary,
            getTeamAccessData,teamDataFlushed,getMenuList,menuList,
            cleanTeamAccessData,
            resetAccess ,checkPermission,
            accessInit,
            aiConfigFlushed,
            setAiConfigFlushed,
            routeConfig,
            setRouterConfig,
            addRouteConfig,
            fetchData,
            $t:$t,}}>
            {children}
        </GlobalContext.Provider>
    );
};

// Create a custom hook for accessing the global context
export const useGlobalContext = () => {
    const context = useContext(GlobalContext);
    if (!context) {
       
      console.warn('useGlobalContext must be used within a GlobalProvider. Returning default context.');
      return {
          state: {
              isAuthenticated: false,
              userData: null,
              version: '1.0.0',
              updateDate: '',
              powered: '',
              mainPage: '',
              language: 'en-US',
              pluginsLoaded: false,
          },
          dispatch: () => {},
          accessData: new Map(),
          pluginAccessDictionary: {},
          menuList: [],
          getGlobalAccessData: async () => ({ access: [] }),
          getTeamAccessData: () => {},
          getPluginAccessDictionary: () => {},
          getMenuList: () => {},
          resetAccess: () => {},
          cleanTeamAccessData: () => {},
          checkPermission: () => false,
          teamDataFlushed: false,
          accessInit: false,
          aiConfigFlushed: false,
          setAiConfigFlushed: () => {},
          routeConfig: [],
          setRouterConfig: () => {},
          addRouteConfig: () => {},
          fetchData: async () => ({}),
          $t: (key: string) => key,
      };
    }
    return context;
};