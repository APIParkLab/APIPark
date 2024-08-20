import { ApprovalTableListItem, PublishTableListItem } from "./type";
import { Tooltip } from "antd";
import { $t } from "@common/locales";
import { PageProColumns } from "@common/components/aoplatform/PageList";


export const TODO_LIST_COLUMN_NOT_INCLUDE_KEY:string[] = ['status','approver','approvalTime']

export const SUBSCRIBE_APPROVAL_TABLE_COLUMN : PageProColumns<ApprovalTableListItem>[] = [
    {
        title:$t('申请时间'),
        dataIndex: 'applyTime',
        ellipsis:true,
        width:182,
        fixed:'left',
        sorter: (a,b)=> {
            return a.applyTime.localeCompare(b.applyTime)
        },
    },
    {
        title:$t('申请方-应用'),
        dataIndex: ['application','name'],
        ellipsis:true
    },
    {
        title:$t('申请服务'),
        dataIndex: ['service','name'],
        ellipsis:true
    },
    {
        title:$t('服务所属系统'),
        dataIndex: ['service','name'],
        ellipsis:true
    },
    {
        title:$t('服务所属团队'),
        dataIndex: ['team','name'],
        ellipsis:true
    },
    {
        title:$t('审批状态'),
        dataIndex: 'status',
        valueType: 'text',
    },
    {
        title:$t('申请人'),
        dataIndex: ['applier','name'],
        ellipsis: true,
        width:88,
    },
    {
        title:$t('审批人'),
        dataIndex: ['approver','name'],
        ellipsis: true,
        width:88
    },
    {
        title:$t('审批时间'),
        dataIndex: 'approvalTime',
        ellipsis: true,
        // sorter: true,,
        width:182,
        sorter: (a,b)=> {
            return a.approvalTime.localeCompare(b.approvalTime)
        },
    },
];

export const SUBSCRIBE_APPROVAL_INNER_TODO_TABLE_COLUMN : PageProColumns<SubscribeApprovalTableListItem>[] = [
    {
        title:$t('申请时间'),
        dataIndex: 'applyTime',
        // sorter: true,
        ellipsis:true,
        width:182,
        fixed:'left',
        sorter: (a,b)=> {
            return a.applyTime.localeCompare(b.applyTime)
        },
    },
    {
        title:$t('申请方-应用'),
        dataIndex: ['application','name'],
        ellipsis:true
    },
    {
        // title:$t('申请人',
        title: <Tooltip title={$t("申请人")} >{$t('申请人')}</Tooltip>,
        dataIndex: ['applier','name'],
        ellipsis: true,
        filters: true,
        onFilter: true,
        valueType: 'select',
        filterSearch: true
    },
    {
        title:$t('申请服务'),
        dataIndex: ['service','name'],
        ellipsis:true
    },
];


export const SUBSCRIBE_APPROVAL_INNER_DONE_TABLE_COLUMN : PageProColumns<SubscribeApprovalTableListItem>[] = [
    {
        title:$t('申请时间'),
        dataIndex: 'applyTime',
        // sorter: true,
        ellipsis:true,
        width:182,
        fixed:'left',
        sorter: (a,b)=> {
            return a.applyTime.localeCompare(b.applyTime)
        },
    },
    {
        title:$t('申请方-应用'),
        dataIndex: ['application','name'],
        ellipsis:true
    },
    {
        // title:$t('申请人',
        title: <Tooltip title={$t("申请人")} >{$t('申请人')}</Tooltip>,
        dataIndex: ['applier','name'],
        ellipsis: true,
        filters: true,
        onFilter: true,
        valueType: 'select',
        filterSearch: true,
    },
    {
        title:$t('申请服务'),
        dataIndex: ['service','name'],
        ellipsis:true
    },
    {
        title:$t('审批状态'),
        dataIndex: 'status',
        valueType: 'select',
        ellipsis: true,
        filters: true,
        onFilter: true,
        valueEnum: new Map([
            [0, <span className="text-status_fail">{$t('拒绝')}</span>],
            [2,<span className="text-status_success">{$t('通过')}</span>],
          ]),
    },
    {
        title:$t('审批人'),
        dataIndex: ['approver','name'],
        ellipsis: true,
        width:88,
        filters: true,
        onFilter: true,
        valueType: 'select',
        filterSearch: true,
    },
    {
        title:$t('审批时间'),
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


export const PublishApplyStatusEnum = {
    'accept': $t("审批完成"),
    'apply': $t("发布审批中"),
    'running': $t("在线"),
    'none': $t("-"),
    'refuse': $t("已拒绝"),
    // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values
    'close' : $t('-'),
    'stop' : $t('中止'),
    'error' : $t('发布异常'),
    'publishing' : $t('发布中')
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

export const ApprovalStatusColorClass = {
    new: 'text-[#138913]', // 使用 Tailwind 的 Arbitrary Properties
    update: 'text-[#03a9f4]',
    delete: 'text-[#ff3b30]',
    none: 'text-[var(--MAIN_TEXT)]', // 假设你也有一个“none”的状态
  };

  

export const ApprovalApiColumns = [
    {
        title:$t('API 名称'),
        dataIndex:'name',
        ellipsis:true
    },
    {
        title:$t('请求方式'),
        dataIndex:'method',
        ellipsis:true
    },
    {
        title:$t('路径'),
        dataIndex:'path',
        ellipsis:true
    },
    {
        title:$t('类型'),
        dataIndex:'change',
        render:(_,entity)=>(
            <Tooltip placement="top" title={entity.change === 'error' ?$t('该 API 缺失(0)(1)(2)请先补充',[entity.proxyStatus == 1 && $t('转发信息,'),entity.docStatus == 1 && $t('文档信息,'),entity.upstreamStatus == 1 && $t('上游信息,')]):''}>
                <span className={`${ApprovalStatusColorClass[entity.change as keyof typeof ApprovalStatusColorClass]} truncate block`}>
                    {ChangeTypeEnum[entity.change as (keyof typeof ChangeTypeEnum)] || '-'}
                    {entity.change === 'error' ?$t('该 API 缺失(0)(1)(2)请先补充',[entity.proxyStatus == 1 && $t('转发信息,'),entity.docStatus == 1 && $t('文档信息,'),entity.upstreamStatus == 1 && $t('上游信息,')]):''}
                    </span>
          </Tooltip>)
          
    }
]

export const ApprovalUpstreamColumns = [
    {
        title:$t('上游类型'),
        dataIndex:'type',
        ellipsis:true,
        valueEnum:{
            'static':{
                text:$t('静态上游')
            }
        }
    },
    {
        title:$t('地址'),
        dataIndex:'addr',
        render:(text:string[])=>(<>{text.join(',')}</>),
        ellipsis:true
    },
    {
        title:$t('类型'),
        dataIndex:'change',
        render:(_,entity)=>(
            <Tooltip placement="top" title={entity.change === 'error' ? $t('该 API 缺失(0)(1)(2)请先补充',[entity.proxyStatus == 1 && $t('转发信息,'),entity.docStatus == 1 && $t('文档信息,'),entity.upstreamStatus == 1 && $t('上游信息,')]):''}>
                <span className={`${ApprovalStatusColorClass[entity.change as keyof typeof ApprovalStatusColorClass]} truncate block`}>{ChangeTypeEnum[entity.change as (keyof typeof ChangeTypeEnum)] || '-'}
                {entity.change === 'error' ?$t('该 API 缺失(0)(1)(2)请先补充',[entity.proxyStatus == 1 && $t('转发信息,'),entity.docStatus == 1 && $t('文档信息,'),entity.upstreamStatus == 1 && $t('上游信息,')]):''}</span>
          </Tooltip>)
    }
]

const PublishStatusEnum = {
    'apply': $t('待审批'),
    'accept' : $t('审批通过'),
    'done' : $t('已发布'),
    'stop': $t('发布终止'),
    'close': $t('已关闭'),
    'refuse' : $t('已拒绝'),
    'error' : $t('发布异常'),
    'publishing' : $t('发布中')
}

export const PUBLISH_APPROVAL_VERSION_INNER_TABLE_COLUMN : PageProColumns<PublishTableListItem>[] = [
    {
        title:$t('发布版本'),
        dataIndex: 'version',
        ellipsis:true,
        width:160,
        fixed:'left'
    },
    {
        title:$t('版本说明'),
        dataIndex: 'remark',
        ellipsis:true
    },
    {
        title:$t('创建版本时间'),
        dataIndex: 'createTime',
        ellipsis:true,
        sorter: (a,b)=> {
            return a.createTime.localeCompare(b.createTime)
        },
    },
    {
        title:$t('版本状态'),
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
        title:$t('创建人'),
        dataIndex: ['creator','name'],
        ellipsis: true,
        width:88,
        filters: true,
        onFilter: true,
        valueType: 'select',
        filterSearch: true,
    }
];

export const PUBLISH_APPROVAL_RECORD_INNER_TABLE_COLUMN : PageProColumns<PublishTableListItem>[] = [
    {
        title:$t('申请时间'),
        dataIndex: 'applyTime',
        ellipsis:true,
        width:182,
        fixed:'left',
    },
    {
        title:$t('审核时间'),
        dataIndex: 'approveTime',
        ellipsis:true,
        width:182,
    },
    {
        title:$t('版本号'),
        dataIndex: 'version',
        ellipsis:true
    },
    {
        title:$t('版本说明'),
        dataIndex: 'remark',
        ellipsis:true
    },
    {
        title:$t('发布状态'),
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
        title:$t('备注'),
        dataIndex: 'comments',
        ellipsis:true
    },
    {
        title:$t('申请人'),
        dataIndex: ['applicant','name'],
        ellipsis: true,
        width:88,
        filters: true,
        onFilter: true,
        valueType: 'select',
        filterSearch: true,
    },
    {
        title:$t('审批人'),
        dataIndex: ['approver','name'],
        ellipsis: true,
        width:88,
        filters: true,
        onFilter: true,
        valueType: 'select',
        filterSearch: true,
    },
];

export const PUBLISH_APPROVAL_TABLE_COLUMN : PageProColumns<ApprovalTableListItem>[] = [
    {
        title:$t('申请时间'),
        dataIndex: 'applyTime',
        ellipsis:true,
        width:182,
        fixed:'left',
        sorter: (a,b)=> {
            return a.applyTime.localeCompare(b.applyTime)
        },
    },
    {
        title:$t('申请系统'),
        dataIndex: ['service','name'],
        ellipsis:true
    },
    {
        title:$t('所属团队'),
        dataIndex: ['team','name'],
        ellipsis:true
    },
    {
        title:$t('审批状态'),
        dataIndex: 'status',
        ellipsis:{
            showTitle:true
        },
        filters: true,
        onFilter: true,
        valueType: 'select',
    },
    {
        title:$t('申请人'),
        dataIndex: ['applier','name'],
        ellipsis: true,
        width:88,
        filters: true,
        onFilter: true,
        valueType: 'select',
        filterSearch: true,
    },
    {
        title:$t('审批人'),
        dataIndex: ['approver','name'],
        ellipsis: true,
        width:88,
        filters: true,
        onFilter: true,
        valueType: 'select',
        filterSearch: true,
    },
    {
        title:$t('审批时间'),
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

export const  ChangeTypeEnum = {
    'new': $t('新增'),
    'update': $t('变更'),
    'delete' : $t('删除'),
    'none' : $t('无变更'),
    'error' : $t('缺失字段')
}
// export const APPROVAL_I18NEXT_FOR_ENUM = {
//     [SubscribeEnum.Rejected]:$t('驳回'),
//     [SubscribeEnum.Reviewing]:$t('审核中'),
//     [SubscribeEnum.Subscribed]:$t('已订阅'),
//     [SubscribeEnum.Unsubscribed]:$t('取消订阅'),
//     [SubscribeEnum.CancelRequest]:$t('取消申请'),
//     [SubscribeFromEnum.manual]:$t('手动添加'),
//     [SubscribeFromEnum.subscribe]:$t('订阅申请'),
// }


export const SubscribeApprovalList = [
    {
        title:$t('申请方应用'),key:'application'
    },
    {
        title:$t('申请方所属团队'),key:'applyTeam'
    },
    {
        title:$t('申请人'),key:'applier'
    },
    {
        title:$t('申请时间'),key:'applyTime'
    },
    {
        title:$t('申请服务'),key:'service'
    },
    {
        title:$t('服务所属团队'),key:'team'
    }
]