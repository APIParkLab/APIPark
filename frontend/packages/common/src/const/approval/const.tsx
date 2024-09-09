import { ApprovalTableListItem, PublishTableListItem } from "./type";
import { PageProColumns } from "@common/components/aoplatform/PageList";

export const TODO_LIST_COLUMN_NOT_INCLUDE_KEY:string[] = ['status','approver','approvalTime']

export const SUBSCRIBE_APPROVAL_TABLE_COLUMN : PageProColumns<ApprovalTableListItem>[] = [
    {
        title:('申请时间'),
        dataIndex: 'applyTime',
        ellipsis:true,
        width:182,
        fixed:'left',
        sorter: (a,b)=> {
            return a.applyTime.localeCompare(b.applyTime)
        },
    },
    {
        title:('申请方-应用'),
        dataIndex: ['application','name'],
        ellipsis:true
    },
    {
        title:('申请服务'),
        dataIndex: ['service','name'],
        ellipsis:true
    },
    {
        title:('服务所属系统'),
        dataIndex: ['service','name'],
        ellipsis:true
    },
    {
        title:('服务所属团队'),
        dataIndex: ['team','name'],
        ellipsis:true
    },
    {
        title:('审批状态'),
        dataIndex: 'status',
        valueType: 'text',
    },
    {
        title:('申请人'),
        dataIndex: ['applier','name'],
        ellipsis: true,
        width:88,
    },
    {
        title:('审批人'),
        dataIndex: ['approver','name'],
        ellipsis: true,
        width:88
    },
    {
        title:('审批时间'),
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
        title:('申请时间'),
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
        title:('申请方-应用'),
        dataIndex: ['application','name'],
        ellipsis:true
    },
    {
        // title:('申请人',
        title: ('申请人'),
        dataIndex: ['applier','name'],
        ellipsis: true,
        filters: true,
        onFilter: true,
        valueType: 'select',
        filterSearch: true
    },
    {
        title:('申请服务'),
        dataIndex: ['service','name'],
        ellipsis:true
    },
];


export const SUBSCRIBE_APPROVAL_INNER_DONE_TABLE_COLUMN : PageProColumns<SubscribeApprovalTableListItem>[] = [
    {
        title:('申请时间'),
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
        title:('申请方-应用'),
        dataIndex: ['application','name'],
        ellipsis:true
    },
    {
        // title:('申请人',
        title: ('申请人'),
        dataIndex: ['applier','name'],
        ellipsis: true,
        filters: true,
        onFilter: true,
        valueType: 'select',
        filterSearch: true,
    },
    {
        title:('申请服务'),
        dataIndex: ['service','name'],
        ellipsis:true
    },
    {
        title:('审批状态'),
        dataIndex: 'status',
        valueType: 'select',
        ellipsis: true,
        filters: true,
        onFilter: true,
    },
    {
        title:('审批人'),
        dataIndex: ['approver','name'],
        ellipsis: true,
        width:88,
        filters: true,
        onFilter: true,
        valueType: 'select',
        filterSearch: true,
    },
    {
        title:('审批时间'),
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
    'accept': ("审批完成"),
    'apply': ("发布审批中"),
    'running': ("在线"),
    'none': ("-"),
    'refuse': ("已拒绝"),
    // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values
    'close' : ('-'),
    'stop' : ('中止'),
    'error' : ('发布异常'),
    'publishing' : ('发布中')
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

  

export const ApprovalRouteColumns = [
    {
        title:('请求方式'),
        dataIndex:'methods',
        ellipsis:true,
        render:(value)=>value?.join(', ')
    },
    {
        title:('路径'),
        dataIndex:'path',
        ellipsis:true
    },
    {
        title:('描述'),
        dataIndex:'description',
          
    },
    {
        title:('类型'),
        dataIndex:'change',
          
    }
]

export const ApprovalUpstreamColumns = [
    {
        title:('上游类型'),
        dataIndex:'type',
        ellipsis:true,
    },
    {
        title:('地址'),
        dataIndex:'addr',
        render:(text:string[])=>(<>{text.join(',')}</>),
        ellipsis:true
    },
    {
        title:('类型'),
        dataIndex:'change'
    }
]

export const PublishStatusEnum = {
    'apply': ('待审批'),
    'accept' : ('审批通过'),
    'done' : ('已发布'),
    'stop': ('发布终止'),
    'close': ('已关闭'),
    'refuse' : ('已拒绝'),
    'error' : ('发布异常'),
    'publishing' : ('发布中')
}

export const PUBLISH_APPROVAL_VERSION_INNER_TABLE_COLUMN : PageProColumns<PublishTableListItem>[] = [
    {
        title:('发布版本'),
        dataIndex: 'version',
        ellipsis:true,
        width:160,
        fixed:'left'
    },
    {
        title:('版本说明'),
        dataIndex: 'remark',
        ellipsis:true,
        width:160,
    },
    {
        title:('创建版本时间'),
        dataIndex: 'createTime',
        ellipsis:true,
        sorter: (a,b)=> {
            return a.createTime.localeCompare(b.createTime)
        },
    },
    {
        title:('版本状态'),
        dataIndex: 'status',
        ellipsis:true,
        filters: true,
        onFilter: true,
        valueType: 'select'
    },
    {
        title:('创建人'),
        dataIndex: ['creator','name'],
        ellipsis: true,
        width:120,
        filters: true,
        onFilter: true,
        valueType: 'select',
        filterSearch: true,
    }
];

export const PUBLISH_APPROVAL_RECORD_INNER_TABLE_COLUMN : PageProColumns<PublishTableListItem>[] = [
    {
        title:('申请时间'),
        dataIndex: 'applyTime',
        ellipsis:true,
        width:182,
        fixed:'left',
    },
    {
        title:('审核时间'),
        dataIndex: 'approveTime',
        ellipsis:true,
        width:182,
    },
    {
        title:('版本号'),
        dataIndex: 'version',
        ellipsis:true,
        width:130,
    },
    {
        title:('版本说明'),
        dataIndex: 'remark',
        ellipsis:true,
        width:160,
    },
    {
        title:('发布状态'),
        dataIndex: 'status',
        ellipsis:true,
    },
    {
        title:('备注'),
        dataIndex: 'comments',
        ellipsis:true
    },
    {
        title:('申请人'),
        dataIndex: ['applicant','name'],
        ellipsis: true,
        width:88,
        filters: true,
        onFilter: true,
        valueType: 'select',
        filterSearch: true,
    },
    {
        title:('审批人'),
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
        title:('申请时间'),
        dataIndex: 'applyTime',
        ellipsis:true,
        width:182,
        fixed:'left',
        sorter: (a,b)=> {
            return a.applyTime.localeCompare(b.applyTime)
        },
    },
    {
        title:('申请系统'),
        dataIndex: ['service','name'],
        ellipsis:true
    },
    {
        title:('所属团队'),
        dataIndex: ['team','name'],
        ellipsis:true
    },
    {
        title:('审批状态'),
        dataIndex: 'status',
        ellipsis:{
            showTitle:true
        },
        filters: true,
        onFilter: true,
        valueType: 'select',
    },
    {
        title:('申请人'),
        dataIndex: ['applier','name'],
        ellipsis: true,
        width:88,
        filters: true,
        onFilter: true,
        valueType: 'select',
        filterSearch: true,
    },
    {
        title:('审批人'),
        dataIndex: ['approver','name'],
        ellipsis: true,
        width:88,
        filters: true,
        onFilter: true,
        valueType: 'select',
        filterSearch: true,
    },
    {
        title:('审批时间'),
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
    'new': ('新增'),
    'update': ('变更'),
    'delete' : ('删除'),
    'none' : ('无变更'),
    'error' : ('缺失字段')
}


export const SubscribeApprovalList = [
    {
        title:('申请方应用'),key:'application'
    },
    {
        title:('申请方所属团队'),key:'applyTeam'
    },
    {
        title:('申请人'),key:'applier'
    },
    {
        title:('申请时间'),key:'applyTime'
    },
    {
        title:('申请服务'),key:'service'
    },
    {
        title:('服务所属团队'),key:'team'
    }
]