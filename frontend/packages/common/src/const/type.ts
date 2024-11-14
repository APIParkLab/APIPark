import { FC, ReactElement, ReactNode } from "react"
import { PERMISSION_DEFINITION } from "./permissions"
import { MatchPositionEnum, MatchTypeEnum } from "@core/const/system/const"
import usePluginLoader from "@common/hooks/pluginLoader"
import { useGlobalContext } from "@common/contexts/GlobalStateContext"

export type UserInfoType = {
    username: string
    nickname: string
    email: string
    phone: string
    avatar: string
    type:string
}

export type UserProfileProps = {
    entity?:UserInfoType
}

export type UserProfileHandle = {
    save:()=>Promise<boolean|string>
}

export type ClusterSimpleOption = {
    id:string
    name:string
    description:string
}


export type ClusterEnumData = {
    name:string,
    uuid:string,
    title:string
}

export interface ClusterEnum{
    clusters:Array<ClusterEnumData>
    name:string
}

export type TeamSimpleMemberItem = {
    user:EntityItem
    mail:string
    department:EntityItem
}

export type MemberItem = {
    id:string;
    name:string;
    email:string;
    department:Array<{id:string,name:string}>
}

export type DashboardPartitionItem = {
    id:string;
    name:string
    enableMonitor:boolean
}


export type SimpleTeamItem = {
    id:string
    name:string
    description:string
    appNum:number
}

export type MatchItem = {
    position:typeof MatchPositionEnum
    matchType:typeof MatchTypeEnum
    key:string
    pattern:string
    id?:string
}

export type EntityItem = {
    id:string
    name:string
}

export type DynamicMenuItem = {
    name:string
    title:string
    path:string
}

export type AccessDataType = keyof typeof PERMISSION_DEFINITION[0]



export type NewSimpleMemberItem = {
    user:EntityItem
    email:string
    department:string
    avatar:string
}

export type SimpleMemberItem = {
    id:string
    name:string
    email:string
    department:string
    avatar:string
}


export type RouteConfig = {
    path:string
    pathPrefix?:string
    component?:ReactElement
    children?:(RouteConfig|false)[]
    key:string
    provider?:FC<{ children: ReactNode; }>
    lazy?:unknown
    data?:Record<string, string>
    lifecycle?:{
        canActivate?:()=>Promise<boolean>
        canLoad?:()=>Promise<boolean>
        canDeactivate?:()=>Promise<boolean>
        deactivated?:()=>Promise<boolean>
    }
}

export type RouterParams  = {
    teamId:string
    apiId:string
    serviceId:string
    clusterId:string;
    memberGroupId:string
    userGroupId:string
    pluginName:string
    moduleId:string
    accessType:'project'|'team'|'service'
    categoryId:string
    tagId:string
    dashboardType:string
    dashboardDetailId:string
    topologyId:string
    appId:string
    roleType:string 
    roleId:string
    routeId:string
}


export type PluginRouterConfig = {
    name:string
    path:string;
    type:string;
    expose?:string
  }

export type CoreObj = {
routerConfig: RouteConfig[];
setExecuteList: (param:unknown[])=>void;
pluginLoader: {
    loadModule: (path: string, name: string, expose: string, pluginPath: string) => Promise<any>;
};
pluginProvider: ReturnType<typeof useGlobalContext>
// pluginLifecycleGuard: PluginLifecycleGuard;
builtInPluginLoader: (name: string) => any;
}

export type PluginConfigType = {
    name: string;
    router: Array<PluginRouterConfig>;
    path?: string;
    driver:string
  }


export type  ApiparkPluginDriverType = {
    [key:string]:{[key:string]:(coreObj?:CoreObj, pluginConfig?:PluginConfigType)=>(CoreObj|undefined)}
  }

  
export type RouterMapConfig = {
    type: 'component' | 'module',
    component: ReactElement,
    provider?: FC,
    lazy?: FC
    key?: string
    children?: RouteConfig[]
    data?:Record<string, string>
    pathMatch?:string
}
  