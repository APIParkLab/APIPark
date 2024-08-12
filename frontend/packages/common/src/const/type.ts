import { PERMISSION_DEFINITION } from "./permissions"
import { MatchPositionEnum, MatchTypeEnum } from "@core/const/system/const"

export type UserInfoType = {
    username: string
    nickname: string
    email: string
    phone: string
    avatar: string
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
    position:MatchPositionEnum
    matchType:MatchTypeEnum
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