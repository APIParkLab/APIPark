import { SystemInsidePublishOnlineItems } from "@core/pages/system/publish/SystemInsidePublishOnline";
import { SystemReleaseStatus } from "@core/const/system/type";
import { EntityItem } from "@common/const/type";
import { SubscribeApprovalTableListItem, PublishApplyStatusEnum } from "./const";

export type SubscribeApprovalInfoType = {
    applyTime: string;
    id:string;
    application:string;
    applier:string;
    service:string;
    applyTeam:string;
    team:string;
    status:string;
    approver:string;
    approvalTime:string;
    reason:string
    opinion?:string
};


export type PublishApprovalTableListItem = {
    id:string;
    applyTime:string;
    service:string;
    team:string;
    status:string;
    applier:string;
    approver:string;
    approvalTime:string;
};
 export type PublishApprovalApiItem = {
    name:string
    method:string
    path:string
    upstream:string
    change:string
    status:{
        upstreamStatus: SystemReleaseStatus,
        docStatus: SystemReleaseStatus,
        proxyStatus: SystemReleaseStatus}
}

export type PublishApprovalUpstreamItem = {
    upstream:EntityItem
    cluster:EntityItem
    type:'static'|'dynamic'
    addr:string[]
    change:'add'|'update'|'delete'|'none',
    status:SystemReleaseStatus
}

// 发布详情（版本）
export type PublishApprovalInfoType = {
    id:string;
    applyTime:string;
    service:EntityItem;
    applyTeam:EntityItem;
    team:EntityItem;
    status:string;
    applier:EntityItem;
    approver:EntityItem;
    approvalTime:string;
    areas:Array<EntityItem & {checked:boolean}>
    remark:string
    opinion?:string
    diffs:{
        apis:PublishApprovalApiItem[]
        upstreams:PublishApprovalUpstreamItem[]
    }
    clusterPublishStatus?:SystemInsidePublishOnlineItems[],
    error:string
};


export type ApprovalTableListItem = SubscribeApprovalTableListItem | PublishApprovalTableListItem


export type PublishVersionTableListItem = {
    id:string,
    version:string
    service:EntityItem
    remark:string
    createTime:string
    creator:EntityItem
    status:keyof typeof PublishApplyStatusEnum
    canRollback:boolean
    canDelete:boolean
    flowId:string
}


export type PublishTableListItem = {
    id:string,
    version:string
    applyTime:string,
    approveTime: string,
    createTime:string,
    creator: EntityItem,
    service:EntityItem
    team:EntityItem
    status:keyof typeof PublishApplyStatusEnum
}