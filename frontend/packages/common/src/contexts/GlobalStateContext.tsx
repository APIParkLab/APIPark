import {createContext, Dispatch, FC, ReactNode, useContext, useReducer, useState} from "react";
import { useFetch } from "@common/hooks/http";
import { App } from "antd";
import { BasicResponse, RESPONSE_TIPS, STATUS_CODE } from "@common/const/const";
import { checkAccess } from "@common/utils/permission";
import { PERMISSION_DEFINITION } from "@common/const/permissions";
import { $t } from "@common/locales";

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


/*
    存储用户登录、信息、权限等数据
*/
export const GlobalContext = createContext<{
    state: GlobalState;
    dispatch: Dispatch<GlobalAction>;
    accessData:Map<string,string[]>;
    pluginAccessDictionary:{[k:string]:string};
    getGlobalAccessData:()=>Promise<{ access:string[]}>;
    getTeamAccessData:(teamId:string)=>void;
    getPluginAccessDictionary:(pluginData:{[k:string]:string})=>void
    resetAccess:()=>void
    cleanTeamAccessData:()=>void
    checkPermission:(access:keyof typeof PERMISSION_DEFINITION[0] | Array<keyof typeof PERMISSION_DEFINITION[0]>)=>boolean
    teamDataFlushed:boolean
    accessInit:boolean
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
        language:'en'
    });
    const [accessData,setAccessData] = useState<Map<string,string[]>>(new Map())
    const [pluginAccessDictionary, setPluginAccessDictionary] = useState<{[k:string]:string}>({})
    const [teamDataFlushed, setTeamDataFlushed] = useState<boolean>(false)
    const [accessInit, setAccessInit] = useState<boolean>(false)
    const [aiConfigFlushed, setAiConfigFlushed] = useState<boolean>(false)
    let getGlobalAccessPromise: Promise<BasicResponse<{ access:string[] }>> | null = null

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
            { state, dispatch,accessData,pluginAccessDictionary,
            getGlobalAccessData,
            getPluginAccessDictionary,
            getTeamAccessData,teamDataFlushed,
            cleanTeamAccessData,
            resetAccess ,checkPermission,accessInit,
            aiConfigFlushed, setAiConfigFlushed}}>
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