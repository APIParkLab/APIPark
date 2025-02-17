
import { FormInstance, UploadFile } from "antd";
import { EntityItem } from "@common/const/type";
import { SubscribeEnum, SubscribeFromEnum } from "./const";



export type AiServiceConfigFieldType = {
    name?: string;
    id?: string;
    provider?:string
    prefix?:string;
    logo?:string;
    logoFile?:UploadFile;
    tags?:Array<string>;
    description?: string;
    team?:string;
    master?:string;
    serviceType?:'public'|'inner';
    catalogue?:string | string[];
    approvalType?:string;
    providerType?:string
};

export type AiServiceSubServiceTableListItem = {
    id:string;
    applyStatus:typeof SubscribeEnum;
    project:EntityItem;
    team:EntityItem
    service:EntityItem
    applier:EntityItem
    from:SubscribeFromEnum
    createTime:string
};



export type AiServiceSubscriberTableListItem = {
    id:string
    service:EntityItem
    applyStatus:typeof SubscribeEnum
    project:EntityItem
    team:EntityItem;
    applier:EntityItem
    approver:EntityItem;
    from:SubscribeFromEnum
    applyTime:string
};

export type AiServiceSubscriberConfigFieldType = {
    application:string
    applier:string
};

export type AiServiceSubscriberConfigProps = {
    serviceId:string
    teamId:string
}

export type AiServiceSubscriberConfigHandle = {
    save:()=>Promise<boolean|string>
}

export type AiServiceMemberTableListItem = {
    user: EntityItem;
    email:string;
    roles:Array<EntityItem>;
    canDelete:boolean
};

export type AiServiceApiDetail = {
    content:string
    updateTime:string
    updater:string
}



export type AiServiceInsideRouterCreateProps = {
    type?:'add'|'edit'|'copy'
    entity?:AiServiceRouterTableListItem  
    modalApiPrefix?:string
    modalPrefixForce?:boolean
    serviceId:string
    teamId:string
}

export type AiServiceInsideRouterCreateHandle = {
    copy:()=>Promise<boolean|string>;
    save:()=>Promise<boolean|string>;
}


export type AiServiceRouterTableListItem = {
    id:string;
    name:string;
    requestPath:string;
    description:string
    creator:EntityItem;
    createTime:string;
    updater:EntityItem
    updateTime:string
    model:{
        id:string
        logo:string
    }
};

export type MyServiceFieldType = {
    name?: string;
    id?: string;
    description?: string;
    team?:string;
    project?:string;
    status?:'off'|'on'
};

export type SimpleAiServiceItem = {
    id:string
    name:string
    team:EntityItem
}

export type ServiceApiTableListItem = {
    id:string;
    name: string;
    method:string;
    path:string;
    description:string;
};

export type SimpleApiItem = {
    id:string
    name:string
    method:string
    requestPath:string
}

export type AiServiceAuthorityTableListItem = {
    id:string
    name: string;
    driver:string;
    hideCredential:boolean;
    expireTime:number;
    creator:EntityItem;
    updater:EntityItem;
    createTime:string;
    updateTime:string
};

export type MyServiceTableListItem = {
    id:string;
    name: string;
    serviceType:'public'|'inner';
    apiNum:number;
    status:string;
    createTime:string;
    updateTime:string;
};


export type AiServiceInsideApiDetailProps = {
    serviceId:string;
    teamId:string;
    apiId:string;
}


export type AiServiceInsideApiDocumentHandle  = {
    save:()=>Promise<boolean|string>|undefined
}

export type AiServiceInsideApiDocumentProps = {
    serviceId:string
    teamId:string
    apiId:string
}


export type AiServiceInsideApiProxyHandle = {
    validate:()=>Promise<void>
}


export interface MyServiceInsideConfigHandle {
    save:()=>Promise<boolean|string>
}

export interface MyServiceInsideConfigProps {

    teamId:string
    serviceId?:string
    closeDrawer?:() => void
}


export type SubSubscribeApprovalModalProps = {
    type:'reApply'|'view'
    data?:AiServiceSubServiceTableListItem
    teamId:string
    serviceId?:string
}

export type SubSubscribeApprovalModalHandle = {
    reApply:() =>Promise<boolean|string>
}

export type SubSubscribeApprovalModalFieldType = {
    reason?:string;
    opinion?:string;
};

export type AiServiceInsideUpstreamConfigProps = {
    upstreamNameForm:FormInstance
    setLoading:(loading:boolean) => void
}

export type AiServiceInsideUpstreamConfigHandle = {
    save:()=>Promise<boolean|string>|undefined
}

export type AiServiceInsideUpstreamContentHandle = {
    save:()=>Promise<boolean|string>|undefined
}


export type AiServiceConfigHandle = {
    save:()=>Promise<string|boolean>|undefined
}


export type AiServiceTopologyServiceItem = EntityItem & {
    project:string
}

export interface AiServiceTopologySubscriber {
    project: EntityItem;
    services: EntityItem[];
  }
  
  export interface AiServiceTopologyInvoke {
    project: EntityItem;
    services: EntityItem[];
  }
  
  
  // 接口返回的数据格式
  export interface AiServiceTopologyResponse {
    services: AiServiceTopologyServiceItem[];
    subscribers: AiServiceTopologySubscriber[];
    invoke: AiServiceTopologyInvoke[];
  }

export enum AiServiceReleaseStatus {
    '正常' = 0,
    '未设置' = 1,
    '缺失' = 2
}

  export type AiServicePublishReleaseItem = {
    api: Array<{
        name: string,
        method: string,
        path: string,
        upstream: string,
        change: string,
        status: {
            upstreamStatus: AiServiceReleaseStatus,
            docStatus: AiServiceReleaseStatus,
            proxyStatus: AiServiceReleaseStatus
        }
    }>
    upstream: Array<{
        name: "",
        type: "",
        addr: [],
        status: ""
    }>
  }

  export type VariableItems = {
    key:string,
    description:string,
    required:boolean
  }