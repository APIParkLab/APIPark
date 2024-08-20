
import { FormInstance, UploadFile } from "antd";
import { HeaderParamsType, BodyParamsType, QueryParamsType, RestParamsType, ResultListType, ApiBodyType } from "@common/const/api-detail";
import { EntityItem, MatchItem } from "@common/const/type";
import { SubscribeEnum, SubscribeFromEnum } from "./const";
import { HTTPMethod, Protocol } from "@common/components/postcat/api/RequestMethod";

export type SystemTableListItem = {
    id:string;
    name: string;
    team: EntityItem;
    apiNum: number;
    serviceNum: number,
    description:string;
    master:EntityItem;
    createTime:string;
};

export type SystemConfigFieldType = {
    name?: string;
    id?: string;
    prefix?:string;
    logo?:string;
    logoFile?:UploadFile;
    tags?:Array<string>;
    description?: string;
    team?:string;
    master?:string;
    serviceType?:'public'|'inner';
    catalogue?:string | string[];
};

export type SystemSubServiceTableListItem = {
    id:string;
    applyStatus:typeof SubscribeEnum;
    project:EntityItem;
    team:EntityItem
    service:EntityItem
    applier:EntityItem
    from:SubscribeFromEnum
    createTime:string
};



export type SystemSubscriberTableListItem = {
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

export type SystemSubscriberConfigFieldType = {
    application:string
    applier:string
};

export type SystemSubscriberConfigProps = {
    serviceId:string
    teamId:string
}

export type SystemSubscriberConfigHandle = {
    save:()=>Promise<boolean|string>
}

export type SystemMemberTableListItem = {
    user: EntityItem;
    email:string;
    roles:Array<EntityItem>;
    canDelete:boolean
};

export type SystemApiDetail = {
    id:string
    name:string
    description:string
    protocol:Protocol
    method:HTTPMethod
    path:string
    creator:EntityItem
    createTime:string
    updater:EntityItem
    updateTime:string
    match?:MatchItem[]
    proxy?:SystemApiProxyType
    doc?:{
        encoding: string,
        tag: string,
        requestParams: {
            headerParams: HeaderParamsType[],
            bodyParams: BodyParamsType[],
            queryParams: QueryParamsType[],
            restParams: RestParamsType[]
        },
        resultList: ResultListType[],
        responseList: [{
            id: number,
            responseUuid: string,
            apiUuid: string,
            oldId: number,
            name: string,
            httpCode: string,
            contentType: ApiBodyType,
            isDefault: number,
            updateUserId: number,
            createUserId: number,
            createTime: number,
            updateTime: number,
            responseParams: {
                headerParams: HeaderParamsType[],
                bodyParams: BodyParamsType[]
                queryParams: QueryParamsType[],
                restParams: RestParamsType[]
            }
        }]
    }
}


export type SystemApiProxyType = {
    path:string
    timeout:number
    retry:number
    headers:Array<ProxyHeaderItem>

}
export type SystemApiProxyFieldType = {
    name: string;
    id:string;
    description?:string;
    path:string;
    method:string;
    match:MatchItem[]
    isDisable?: boolean;
    service?:string;
    proxy:SystemApiProxyType
};

export type SystemApiSimpleFieldType = {
        id: string
        name: string
        description: string
        method: string
        path: string
        match: MatchItem[]
        creator: string
        updater: string
        create_time: string
        update_time: string
}

export type SystemInsideApiCreateProps = {
    type?:'copy'
    entity?:SystemApiProxyFieldType &{systemId:string}
    modalApiPrefix?:string
    modalPrefixForce?:boolean
    serviceId:string
    teamId:string
}

export type SystemInsideApiCreateHandle = {
    copy:()=>Promise<boolean|string>;
    save:()=>Promise<boolean|string>;
}


export type SystemApiTableListItem = {
    id:string;
    name: string;
    method:string;
    requestPath:string;
    creator:EntityItem;
    createTime:string;
    updater:EntityItem
    updateTime:string
    canDelete:boolean
};


export type EditAuthFieldType  = {
    id?:string
    name: string
    driver: string
    hideCredential: boolean
    expireTime: number
    position: string
    tokenName: string
    config: {
        userName?: string
        password?: string
        apikey?: string
        ak?: string
        sk?: string
        iss?: string
        algorithm?: string
        secret?: string
        publicKey?: string
        user?: string
        userPath?: string
        claimsToVerify?: string[]
        signatureIsBase64?: boolean
    }
}


export type SystemUpstreamTableListItem = {
    name: string;
    id:string;
    driver:string;
    creator:EntityItem;
    updater:EntityItem;
    createTime:string;
    updateTime:string;
    canDelete:boolean
};

export type ProxyHeaderItem = {
    key:string
    value:string
    optType:string
    id?:string
}

export type GlobalNodeItem = {
    address:string
    weight:number
}

export type NodeItem = Partial<GlobalNodeItem> & {
    cluster:string
    clusterName?:string
    _id?:string }

export type DiscoverItem = {
    cluster:string
    service:string
    discover:string
}

export type ServiceUpstreamFieldType = {
    driver:string
    nodes:GlobalNodeItem[],
    discover?:DiscoverItem
    timeout:number;
    retry?:number;
    limitPeerSecond?:number;
    scheme:string,
    passHost:string,
    upstreamHost:string,
    balance:string;
    proxyHeaders:ProxyHeaderItem[]
};


export type MyServiceFieldType = {
    name?: string;
    id?: string;
    description?: string;
    team?:string;
    project?:string;
    status?:'off'|'on'
};

export type SimpleSystemItem = {
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

export type SystemAuthorityTableListItem = {
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


export type SystemInsideApiDetailProps = {
    serviceId:string;
    teamId:string;
    apiId:string;
}


export type SystemInsideApiDocumentHandle  = {
    save:()=>Promise<boolean|string>|undefined
}

export type SystemInsideApiDocumentProps = {
    serviceId:string
    teamId:string
    apiId:string
}


export type SystemInsideApiProxyProps = {
    className?:string
    service:string
    teamId:string
    initProxyValue?:SystemApiProxyType
    value?:SystemApiProxyType
    onChange?: (newConfigItems: SystemApiProxyType) => void; // 当配置项变化时，外部传入的回调函数
}

export type SystemInsideApiProxyHandle = {
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
    data?:SystemSubServiceTableListItem
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

export type SystemInsideUpstreamConfigProps = {
    upstreamNameForm:FormInstance
    setLoading:(loading:boolean) => void
}

export type SystemInsideUpstreamConfigHandle = {
    save:()=>Promise<boolean|string>|undefined
}

export type SystemInsideUpstreamContentHandle = {
    save:()=>Promise<boolean|string>|undefined
}


export type SystemConfigHandle = {
    save:()=>Promise<string|boolean>|undefined
}


export type SystemTopologyServiceItem = EntityItem & {
    project:string
}

export interface SystemTopologySubscriber {
    project: EntityItem;
    services: EntityItem[];
  }
  
  export interface SystemTopologyInvoke {
    project: EntityItem;
    services: EntityItem[];
  }
  
  
  // 接口返回的数据格式
  export interface SystemTopologyResponse {
    services: SystemTopologyServiceItem[];
    subscribers: SystemTopologySubscriber[];
    invoke: SystemTopologyInvoke[];
  }

export enum SystemReleaseStatus {
    '正常' = 0,
    '未设置' = 1,
    '缺失' = 2
}

  export type SystemPublishReleaseItem = {
    api: Array<{
        name: string,
        method: string,
        path: string,
        upstream: string,
        change: string,
        status: {
            upstreamStatus: SystemReleaseStatus,
            docStatus: SystemReleaseStatus,
            proxyStatus: SystemReleaseStatus
        }
    }>
    upstream: Array<{
        name: "",
        type: "",
        addr: [],
        status: ""
    }>
  }