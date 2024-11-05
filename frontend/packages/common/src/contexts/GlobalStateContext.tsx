import {createContext, Dispatch, FC, ReactNode, useContext, useReducer, useState} from "react";
import { useFetch } from "@common/hooks/http";
import { App } from "antd";
import { BasicResponse, RESPONSE_TIPS, STATUS_CODE } from "@common/const/const";
import { checkAccess } from "@common/utils/permission";
import { PERMISSION_DEFINITION } from "@common/const/permissions";
import { $t } from "@common/locales";
import { MenuItem } from "@common/utils/navigation";

interface GlobalState {
    isAuthenticated: boolean;
    userData: UserData | null;
    version: string;
    updateDate: string;
    powered:string;
    mainPage:string;
    language:string;
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

class EventEmitter {
    // 用来存放注册的事件与回调
    _events:any
    constructor () {
      this._events = {}
    }
  
    on (eventName:string, callback:Function) {
      // 由于一个事件可能注册多个回调函数，所以使用数组来存储事件队列
      const callbacks = this._events[eventName] || []
      callbacks.push(callback)
      this._events[eventName] = callbacks
    }
  
    // 此处需要处理，emit时需要按顺序执行监听的函数，每个函数都会返回是否中止的参数，如果中止则不执行后续的函数
    // emit传入eventName 和 event, 返回 event
    emit (eventName:string, event:any) {
      return new Promise((resolve) => {
        const callbacks = this._events[eventName] || []
        for (const cb of callbacks) {
          const cbRes = cb(event.data)
          if (cbRes.continue === false) {
            resolve(cbRes)
            break
          } else {
            event = cbRes
          }
        }
        resolve(event.data)
      })
    }
  
    // 取消订阅
    off (eventName:string, callback:Function) {
      const callbacks = this._events[eventName] || []
      const newCallbacks = callbacks.filter((fn:any) => fn !== callback && fn.initialCallback !== callback /* 用于once的取消订阅 */)
      this._events[eventName] = newCallbacks
    }
  
    // 单次订阅，后台插件可以自行决定取消对事件的订阅
    once (eventName:string, callback:Function) {
      // 由于需要在回调函数执行后，取消订阅当前事件，所以需要对传入的回调函数做一层包装,然后绑定包装后的函数
      const one = (...args:any) => {
        callback(...args)
        this.off(eventName, one)
      }
  
      // 由于：我们订阅事件的时候，修改了原回调函数的引用，所以，用户触发 off 的时候不能找到对应的回调函数
      // 所以，我们需要在当前函数与用户传入的回调函数做一个绑定，我们通过自定义属性来实现
      one.initialCallback = callback
      this.on(eventName, one)
    }
  }

    const mockData = [
        {
          "name": "工作空间",
          "key": "workspace",
          "path": "/guide/page",
          "icon": "ic:baseline-space-dashboard",
          "children": [
            {
              "name": "首页",
              "key": "guide",
              "path": "/guide/page",
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
            }
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
          "key": "mainPage",
          "path": "/analytics",
          "icon": "ic:baseline-bar-chart",
          "children": [
            {
              "name": "运行视图",
              "key": "analytics",
              "path": "/analytics/total",
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
    // 插件系统
    pluginEventHub:EventEmitter
    pluginSlotHubService:{
        addSlot:(name:string, content:unknown)=>void 
        addSlotArr:(name:string, content:unknown[])=>void
        removeSlot:(name:string)=>void
        getSlot:(name:string)=>unknown
    }
    aiConfigFlushed:boolean
    setAiConfigFlushed:(flush:boolean)=>void
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
        default:
            return state;
    }
};

// Create a context provider component
export const GlobalProvider: FC<{children:ReactNode}> = ({ children }) => {
    const {fetchData} = useFetch()
    const { message } = App.useApp()
    const [state, dispatch] = useReducer(globalReducer, {
        isAuthenticated: true, //mock用
        userData: null,
        version: '1.0.0',
        updateDate: '2024-07-01',
        powered:'Powered by https://apipark.com',
        mainPage:'/guide/page',
        language:'en-US'
    });
    const [accessData,setAccessData] = useState<Map<string,string[]>>(new Map())
    const [pluginAccessDictionary, setPluginAccessDictionary] = useState<{[k:string]:string}>({})
    const [teamDataFlushed, setTeamDataFlushed] = useState<boolean>(false)
    const [accessInit, setAccessInit] = useState<boolean>(false)
    const [aiConfigFlushed, setAiConfigFlushed] = useState<boolean>(false)
    let getGlobalAccessPromise: Promise<BasicResponse<{ access:string[] }>> | null = null
    const [pluginEventHub] = useState<EventEmitter>(new EventEmitter())
    const [pluginSlotHub] = useState<Map<string,unknown>>(new Map())
    const [menuList, setMenuList] = useState<MenuItem[]>(mockData);


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

    const pluginSlotHubService = {
          addSlot:(name:string, content:any) => {pluginSlotHub.set(name, content)},
          addSlotArr : (name:string, content:any[]) => {pluginSlotHub.get(name) ? pluginSlotHub.set(name, (pluginSlotHub.get(name) as Array<unknown>).push(content)) : pluginSlotHub.set(name, content)},
          removeSlot:(name:string) => {pluginSlotHub.delete(name)},
          getSlot:(name:string) => {pluginSlotHub.get(name)}
        }


    return (
        <GlobalContext.Provider value={
            { state, dispatch,accessData,pluginAccessDictionary,
            getGlobalAccessData,
            getPluginAccessDictionary,
            getTeamAccessData,teamDataFlushed,getMenuList,menuList,
            cleanTeamAccessData,
            resetAccess ,checkPermission,accessInit,
            aiConfigFlushed, setAiConfigFlushed,pluginEventHub,pluginSlotHubService}}>
            {children}
        </GlobalContext.Provider>
    );
};

// Create a custom hook for accessing the global context
export const useGlobalContext = () => {
    const context = useContext(GlobalContext);
    if (!context) {
        throw new Error('useGlobalContext must be used within a GlobalProvider');
    }
    return context;
};