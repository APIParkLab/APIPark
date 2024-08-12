import {ProColumns} from "@ant-design/pro-components";
import { ApprovalTableListItem, PublishTableListItem } from "./type";
import { Tooltip } from "antd";


export const TODO_LIST_COLUMN_NOT_INCLUDE_KEY:string[] = ['status','approver','approvalTime']

export const SUBSCRIBE_APPROVAL_TABLE_COLUMN : ProColumns<ApprovalTableListItem>[] = [
    {
        title: '申请时间',
        dataIndex: 'applyTime',
        ellipsis:true,
        width:182,
        fixed:'left',
        sorter: (a,b)=> {
            return a.applyTime.localeCompare(b.applyTime)
        },
    },
    {
        title: '申请方-应用',
        dataIndex: ['application','name'],
        copyable: true,
        ellipsis:true
    },
    {
        title: '申请服务',
        dataIndex: ['service','name'],
        copyable: true,
        ellipsis:true
    },
    {
        title: '服务所属系统',
        dataIndex: ['service','name'],
        copyable: true,
        ellipsis:true
    },
    {
        title: '服务所属团队',
        dataIndex: ['team','name'],
        copyable: true,
        ellipsis:true
    },
    {
        title: '审批状态',
        dataIndex: 'status',
        valueType: 'text',
    },
    {
        title: '申请人',
        dataIndex: ['applier','name'],
        ellipsis: true,
        width:88,
    },
    {
        title: '审批人',
        dataIndex: ['approver','name'],
        ellipsis: true,
        width:88
    },
    {
        title: '审批时间',
        dataIndex: 'approvalTime',
        ellipsis: true,
        // sorter: true,,
        width:182,
        sorter: (a,b)=> {
            return a.approvalTime.localeCompare(b.approvalTime)
        },
    },
];

export const SUBSCRIBE_APPROVAL_INNER_TODO_TABLE_COLUMN : ProColumns<SubscribeApprovalTableListItem>[] = [
    {
        title: '申请时间',
        dataIndex: 'applyTime',
        // sorter: true,
        copyable: true,
        ellipsis:true,
        width:182,
        fixed:'left',
        sorter: (a,b)=> {
            return a.applyTime.localeCompare(b.applyTime)
        },
    },
    {
        title: '申请方-应用',
        dataIndex: ['application','name'],
        copyable: true,
        ellipsis:true
    },
    {
        // title: '申请人',
        title: <Tooltip title="申请人" >申请人</Tooltip>,
        dataIndex: ['applier','name'],
        ellipsis: true,
        filters: true,
        onFilter: true,
        valueType: 'select',
        filterSearch: true
    },
    {
        title: '申请服务',
        dataIndex: ['service','name'],
        copyable: true,
        ellipsis:true
    },
];


export const SUBSCRIBE_APPROVAL_INNER_DONE_TABLE_COLUMN : ProColumns<SubscribeApprovalTableListItem>[] = [
    {
        title: '申请时间',
        dataIndex: 'applyTime',
        // sorter: true,
        copyable: true,
        ellipsis:true,
        width:182,
        fixed:'left',
        sorter: (a,b)=> {
            return a.applyTime.localeCompare(b.applyTime)
        },
    },
    {
        title: '申请方-应用',
        dataIndex: ['application','name'],
        copyable: true,
        ellipsis:true
    },
    {
        // title: '申请人',
        title: <Tooltip title="申请人" >申请人</Tooltip>,
        dataIndex: ['applier','name'],
        ellipsis: true,
        filters: true,
        onFilter: true,
        valueType: 'select',
        filterSearch: true,
    },
    {
        title: '申请服务',
        dataIndex: ['service','name'],
        copyable: true,
        ellipsis:true
    },
    {
        title: '审批状态',
        dataIndex: 'status',
        valueType: 'select',
        ellipsis: true,
        filters: true,
        onFilter: true,
        valueEnum: new Map([
            [0, <span className="text-status_fail">拒绝</span>],
            [2,<span className="text-status_success">通过</span>],
          ]),
    },
    {
        title: '审批人',
        dataIndex: ['approver','name'],
        ellipsis: true,
        width:88,
        filters: true,
        onFilter: true,
        valueType: 'select',
        filterSearch: true,
    },
    {
        title: '审批时间',
        dataIndex: 'approvalTime',
        ellipsis: true,
        // sorter: true,,
        width:182,
        sorter: (a,b)=> {
            return a.approvalTime.localeCompare(b.approvalTime)
        },
    },
];

export type SubscribeApprovalTableListItem = {
    applyTime: string;
    id:string;
    application:string;
    service:string;
    applier:string;
    team?:string;
    status:0|1;
    approver:string;
    approvalTime:string;
};


export enum PublishApplyStatusEnum{
    'accept'="审批完成",
    'apply'="发布审批中",
    'running'="在线",
    'none'="-",
    'refuse'="已拒绝",
    // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values
    'close' = '-',
    'stop' = '中止',
    'error' = '发布异常',
    'publishing' = '发布中'
}


export const PublishTableStatusColorClass = {
    'success' : 'text-[#03a9f4]',
    'fail' : 'text-[#ff3b30]',
    'apply' : 'text-[#46BE11]',
    'refuse' : 'text-[#EF0020]',
    'running' : 'text-[#3D46F2]',
    'accept' : 'text-[#147AFE]',
    'none' : 'text-[var(--MAIN_TEXT)]',
    'approval' :  'text-[#03a9f4]',
    'done' :  'text-[#138913]',
    'stop' :  'text-[#ff3b30]',
    'close' :  'text-[var(--MAIN_TEXT)]',
    'error':'text-[#ff3b30]',
    'publishing':'text-[#46BE11]',
}


enum PublishStatusEnum{
    'apply' = '待审批',
    'accept' = '审批通过',
    'done' = '已发布',
    'stop' = '发布终止',
    'close' = '已关闭',
    'refuse' = '已拒绝',
    'error' = '发布异常',
    'publishing' = '发布中'
}

export const PUBLISH_APPROVAL_VERSION_INNER_TABLE_COLUMN : ProColumns<PublishTableListItem>[] = [
    {
        title: '发布版本',
        dataIndex: 'version',
        copyable: true,
        ellipsis:true,
        width:160,
        fixed:'left'
    },
    {
        title: '版本说明',
        dataIndex: 'remark',
        copyable: true,
        ellipsis:true
    },
    {
        title: '创建版本时间',
        dataIndex: 'createTime',
        ellipsis:true,
        sorter: (a,b)=> {
            return a.createTime.localeCompare(b.createTime)
        },
    },
    {
        title: '版本状态',
        dataIndex: 'status',
        ellipsis:true,
        filters: true,
        onFilter: true,
        valueType: 'select',
        valueEnum:new Map([
            ['accept',<span className={PublishTableStatusColorClass.accept}>{PublishApplyStatusEnum.accept || '-'}</span>],
            ['apply',<span className={PublishTableStatusColorClass.apply}>{PublishApplyStatusEnum.apply || '-'}</span>],
            ['running',<span className={PublishTableStatusColorClass.running}>{PublishApplyStatusEnum.running || '-'}</span>],
            ['none',<span className={PublishTableStatusColorClass.none}>{PublishApplyStatusEnum.none || '-'}</span>],
            ['refuse',<span className={PublishTableStatusColorClass.refuse}>{PublishApplyStatusEnum.refuse || '-'}</span>],
            ['publishing',<span className={PublishTableStatusColorClass.publishing}>{PublishApplyStatusEnum.publishing || '-'}</span>],
            ['error',<span className={PublishTableStatusColorClass.error}>{PublishApplyStatusEnum.error || '-'}</span>],
        ])
    },
    {
        title: '创建人',
        dataIndex: ['creator','name'],
        ellipsis: true,
        width:88,
        filters: true,
        onFilter: true,
        valueType: 'select',
        filterSearch: true,
    }
];

export const PUBLISH_APPROVAL_RECORD_INNER_TABLE_COLUMN : ProColumns<PublishTableListItem>[] = [
    {
        title: '申请时间',
        dataIndex: 'applyTime',
        copyable: true,
        ellipsis:true,
        width:182,
        fixed:'left',
    },
    {
        title: '审核时间',
        dataIndex: 'approveTime',
        copyable: true,
        ellipsis:true,
        width:182,
    },
    {
        title: '版本号',
        dataIndex: 'version',
        copyable: true,
        ellipsis:true
    },
    {
        title: '版本说明',
        dataIndex: 'remark',
        copyable: true,
        ellipsis:true
    },
    {
        title: '发布状态',
        dataIndex: 'status',
        ellipsis:true,
        valueEnum:new Map([
            ['apply',<span className={PublishTableStatusColorClass.apply}>{PublishStatusEnum.apply || '-'}</span>],
            ['accept',<span className={PublishTableStatusColorClass.accept}>{PublishStatusEnum.accept || '-'}</span>],
            ['done',<span className={PublishTableStatusColorClass.done}>{PublishStatusEnum.done || '-'}</span>],
            ['stop',<span className={PublishTableStatusColorClass.stop}>{PublishStatusEnum.stop || '-'}</span>],
            ['close',<span className={PublishTableStatusColorClass.close}>{PublishStatusEnum.close || '-'}</span>],
            ['refuse',<span className={PublishTableStatusColorClass.refuse}>{PublishStatusEnum.refuse || '-'}</span>],
            ['publishing',<span className={PublishTableStatusColorClass.publishing}>{PublishStatusEnum.publishing || '-'}</span>],
            ['error',<span className={PublishTableStatusColorClass.error}>{PublishStatusEnum.error || '-'}</span>],
        ])
    },
    {
        title: '备注',
        dataIndex: 'comments',
        ellipsis:true
    },
    {
        title: '申请人',
        dataIndex: ['applicant','name'],
        ellipsis: true,
        width:88,
        filters: true,
        onFilter: true,
        valueType: 'select',
        filterSearch: true,
    },
    {
        title: '审批人',
        dataIndex: ['approver','name'],
        ellipsis: true,
        width:88,
        filters: true,
        onFilter: true,
        valueType: 'select',
        filterSearch: true,
    },
];

export const PUBLISH_APPROVAL_TABLE_COLUMN : ProColumns<ApprovalTableListItem>[] = [
    {
        title: '申请时间',
        dataIndex: 'applyTime',
        copyable: true,
        ellipsis:true,
        width:182,
        fixed:'left',
        sorter: (a,b)=> {
            return a.applyTime.localeCompare(b.applyTime)
        },
    },
    {
        title: '申请系统',
        dataIndex: ['service','name'],
        copyable: true,
        ellipsis:true
    },
    {
        title: '所属团队',
        dataIndex: ['team','name'],
        copyable: true,
        ellipsis:true
    },
    {
        title: '审批状态',
        dataIndex: 'status',
        ellipsis:{
            showTitle:true
        },
        filters: true,
        onFilter: true,
        valueType: 'select',
    },
    {
        title: '申请人',
        dataIndex: ['applier','name'],
        ellipsis: true,
        width:88,
        filters: true,
        onFilter: true,
        valueType: 'select',
        filterSearch: true,
    },
    {
        title: '审批人',
        dataIndex: ['approver','name'],
        ellipsis: true,
        width:88,
        filters: true,
        onFilter: true,
        valueType: 'select',
        filterSearch: true,
    },
    {
        title: '审批时间',
        dataIndex: 'approvalTime',
        // sorter: true,
        ellipsis:true,
        hideInSearch: true,
        width:182,
        sorter: (a,b)=> {
            return a.approvalTime.localeCompare(b.approvalTime)
        },
    },
];
