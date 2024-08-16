
import { DefaultOptionType } from "antd/es/select"
import { ApiDetail } from "@common/const/api-detail"
import { EntityItem } from "@common/const/type"
import { SubscribeEnum, SubscribeFromEnum } from "@core/const/system/const"
import WithPermission from "@common/components/aoplatform/WithPermission"

export type ServiceBasicInfoType = {
    app:EntityItem
    team:EntityItem
    master:EntityItem
    apiNum:number
    appNum:number
    catalogue:EntityItem
    tags:EntityItem[]
    updateTime:string
    version:string
    logo?:string
}

export type ServiceDetailType = {
    name:string
    description:string
    basic:ServiceBasicInfoType
    apis:ApiDetail[]
    applied:boolean
}

export type ServiceHubCategoryConfigFieldType = {
    id?:string
    name:string
    parent?:string
};

export type ServiceHubCategoryConfigProps = {
    type:'addCate'|'addChildCate'|'renameCate'
    entity?:{[k:string]:unknown}
    WithPermission: typeof WithPermission
}

export type ServiceHubCategoryConfigHandle = {
    save:()=>Promise<boolean|string>
}


export type CategorizesType = {
    id:string
    name:string
    children:CategorizesType[]
}



export type ServiceHubTableListItem = {
    id:string;
    name: string;
    tags?:EntityItem[];
    catalogue:EntityItem
    apiNum:number
    subscribeNum:number
    description:string
    logo:string
};


export type ApplyServiceProps = {
    entity:ServiceHubTableListItem & {app:EntityItem}
    mySystemOptionList:DefaultOptionType[]
    reApply?:boolean
}

export type ApplyServiceHandle = {
    apply:()=>Promise<boolean|string>
}


export type ServiceHubApplyModalFieldType = {
    projects?:string;
    reason?:string;
};

export type ServiceHubAppListItem = {
    id:string,
    name:string,
    team:EntityItem,
    subscribeNum:number,
    subscribeVerifyNum:number,
    description:string,
    master:EntityItem,
    createTime:string,
}

export type TenantManagementServiceListItem = {
    id:string
    service:EntityItem
    applyStatus:SubscribeEnum
    app:EntityItem
    team:EntityItem
    from:SubscribeFromEnum
    createTime:string
}