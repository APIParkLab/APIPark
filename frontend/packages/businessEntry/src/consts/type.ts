import { ReactElement,ReactNode,FC } from 'react';

export type RouteConfig = {
    path:string
    component?:ReactElement
    children?:(RouteConfig|false)[]
    key:string
    provider?:FC<{ children: ReactNode; }>
    lazy?:unknown
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
