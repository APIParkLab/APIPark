import { GlobalNodeItem, MyServiceTableListItem, NodeItem, ProxyHeaderItem, ServiceApiTableListItem, SimpleApiItem, SystemApiTableListItem, SystemAuthorityTableListItem, SystemMemberTableListItem, SystemSubServiceTableListItem, SystemSubscriberTableListItem, SystemTableListItem, SystemUpstreamTableListItem } from "./type";
import { Input, InputNumber, MenuProps, Select, TabsProps, Tooltip } from "antd";
import { ColumnsType } from "antd/es/table";
import { getItem } from "@common/utils/navigation";
import { MatchItem, MemberItem } from "@common/const/type";
import { ConfigField } from "@common/components/aoplatform/EditableTableWithModal";
import { frontendTimeSorter } from "@common/utils/dataTransfer";
import { COLUMNS_TITLE, STATUS_COLOR, VALIDATE_MESSAGE } from "@common/const/const";
import { LoadingOutlined } from "@ant-design/icons";
import { SystemInsidePublishOnlineItems } from "../../pages/system/publish/SystemInsidePublishOnline";
import dayjs from 'dayjs';
import { Link } from "react-router-dom";

import { PageProColumns } from "@common/components/aoplatform/PageList";
import { $t } from "@common/locales";

export enum SubscribeEnum{
    Rejected = 0,
    Reviewing = 1,
    Subscribed = 2,
    Unsubscribed = 3,
    CancelRequest = 4
}




export const SubscribeStatusColor= {
    2: 'text-[#138913]', // 使用 Tailwind 的 Arbitrary Properties
    1: 'text-[#03a9f4]',
    0: 'text-[#ff3b30]',
    3: 'text-[#ff3b30]',
    4: 'text-[#ff3b30]',
  };

export enum SubscribeFromEnum {
    manual = 0,
    subscribe= 1
}


export const MatchPositionEnum = {
    'header' : ('HTTP 请求头'),
    'query': ('请求参数'),
    'cookie' : ('Cookie')
}

export const  MatchTypeEnum = {
    'EQUAL' : ('全等匹配'),
    'PREFIX' : ('前缀匹配'),
    'SUFFIX' :('后缀匹配'),
    'SUBSTR' : ('子串匹配'),
    'UNEQUAL' : ('非等匹配'),
    'NULL' : ('空值匹配'),
    'EXIST' : ('存在匹配'),
    'UNEXIST':('不存在匹配'),
    'REGEXP':('区分大小写的正则匹配'),
    'REGEXPG':('不区分大小写的正则匹配'),
    'unknown': ('任意匹配')
}


export const SYSTEM_I18NEXT_FOR_ENUM = {
    [SubscribeEnum.Rejected]:('驳回'),
    [SubscribeEnum.Reviewing]:('审核中'),
    [SubscribeEnum.Subscribed]:('已订阅'),
    [SubscribeEnum.Unsubscribed]:('取消订阅'),
    [SubscribeEnum.CancelRequest]:('取消申请'),
    [SubscribeFromEnum.manual]:('手动添加'),
    [SubscribeFromEnum.subscribe]:('订阅申请'),
}

export const HTTP_METHOD = ['GET','POST','PUT','DELETE','PATCH','HEAD']
export const API_PROTOCOL = [
    {label:'HTTP',value:'HTTP'},
    {label:'HTTPS',value:'HTTPS'}
]


export const ALGORITHM_ITEM = [
    {label:'HS256',value:'HS256'},
    {label:'HS384',value:'HS384'},
    {label:'HS512',value:'HS512'},
    {label:'RS256',value:'RS256'},
    {label:'RS384',value:'RS384'},
    {label:'RS512',value:'RS512'},
    {label:'ES256',value:'ES256'},
    {label:'ES384',value:'ES384'},
    {label:'ES512',value:'ES512'},
]

export const SYSTEM_TABLE_COLUMNS: PageProColumns<SystemTableListItem>[] = [
    {
        title:('服务名称'),
        dataIndex: 'name',
        ellipsis:true,
        width:160,
        fixed:'left',
        sorter: (a,b)=> {
            return a.name.localeCompare(b.name)
        },
    },
    {
        title:('服务 ID'),
        dataIndex: 'id',
        width: 140,
        ellipsis:true,
    },
    {
        title:('所属团队'),
        dataIndex: ['team','name'],
        ellipsis:true,
        // filters: true,
        // onFilter: true,
        // filterSearch: true,
    },
    {
        title:('API 数量'),
        dataIndex: 'apiNum',
        ellipsis:true,
        sorter: (a,b)=> {
            return a.apiNum - b.apiNum
        },
    },
    {
        title: ('描述'),
        dataIndex: 'description',
        ellipsis:true,
    },
    {
        title:('负责人'),
        dataIndex: ['master','name'],
        ellipsis: true,
        width:108,
        filters: true,
        onFilter: true,
        valueType: 'select',
        filterSearch: true,
    },
    {
        title:('创建时间'),
        dataIndex: 'createTime',
        width:182,
        ellipsis:true,
        sorter: (a,b)=>frontendTimeSorter(a,b,'createTime')
    }
];



export const SYSTEM_SUBSCRIBER_TABLE_COLUMNS: PageProColumns<SystemSubscriberTableListItem>[] = [
    {
        title:('服务名称'),
        dataIndex: ['service','name'],
        ellipsis:true,
        width:160,
        fixed:'left',
        sorter: (a,b)=> {
            return a.service.name.localeCompare(b.service.name)
        },
    },
    {
        title:('服务 ID'),
        dataIndex: 'id',
        width: 140,
        ellipsis:true
    },
    {
        title:('订阅方'),
        dataIndex: ['subscriber','name'],
        ellipsis:true
    },
    {
        title:('所属团队'),
        dataIndex: ['team','name'],
        ellipsis:true
    },
    {
        title:('来源'),
        dataIndex: 'from',
        ellipsis:true,
        filters: true,
        onFilter: true,
        valueType: 'select',
    },
    {
        title:('订阅时间'),
        dataIndex: 'applyTime',
        ellipsis:true,
        width:182,
        sorter: (a,b)=> {
            return a.applyTime.localeCompare(b.applyTime)
        },
    },
];


export const memberModalColumn:ColumnsType<MemberItem> = [
    {title:('成员'),
        render:(_,entity)=>{
            return <>
                <div>
                    <p>
                        <span>{entity.name}</span>
                        {entity.email !== undefined && <span className="text-status_offline">{entity.email}</span>}
                    </p>
                    <p>{entity.department}</p>
                </div>
            </>
        }}
]

export const SYSTEM_MEMBER_TABLE_COLUMN: PageProColumns<SystemMemberTableListItem>[] = [
    {
        title:('用户名'),
        dataIndex: ['user','name'],
        ellipsis:true,
        width:160,
        fixed:'left',
        sorter: (a,b)=> {
            return a.user.name.localeCompare(b.user.name)
        },
    },
    {
        title:('邮箱'),
        dataIndex: 'email',
        ellipsis:true
    },
    {
        title:('角色'),
        dataIndex: ['roles','name'],
        ellipsis:true

    }
];

export const MATCH_CONFIG:ConfigField<MatchItem>[] = [
    {
        title:('参数位置'),
        key: 'position',
        renderText: (value:keyof typeof MatchPositionEnum) => {
            return MatchPositionEnum[value]
        },
        required: true,
        ellipsis:true
    }, {
        title:('参数名'),
        key: 'key',
        component: <Input className="w-INPUT_NORMAL" />,
        renderText: (value: unknown) => value,
        required: true
    }, {
        title:('匹配类型'),
        key: 'matchType',
        renderText: (value:keyof typeof MatchTypeEnum) => {
            return MatchTypeEnum[value]
        },
        required: true
    }, {
        title:('参数值'),
        key: 'pattern',
        unRender:(formValue)=>{return formValue?.matchType === 'NULL' || formValue?.matchType==='EXIST' || formValue?.matchType === 'UNEXIST'},
        component: <Input className="w-INPUT_NORMAL"/>,
        renderText: (value: string) => {
            return value
        },
        required: true
    }
]


export const SYSTEM_API_TABLE_COLUMNS: PageProColumns<SystemApiTableListItem>[] = [
    {
        title:('URL'),
        dataIndex: 'requestPath',
        ellipsis:true
    },
    {
        title:('协议'),
        dataIndex: 'protocols',
        ellipsis:true,
        renderText:(value)=>value?.join(', ')
    },
    {
        title:('方法'),
        dataIndex: 'methods',
        ellipsis:true,
        renderText:(value)=>value?.join(', ')
    },
    {
        title:'是否放行',
        dataIndex:'disable',
        ellipsis:true,
        filters: true,
        onFilter: true,
        valueType: 'select'
    },
    {
        title:('描述'),
        dataIndex: 'description',
        ellipsis:true
    },
    {
        title:('创建者'),
        dataIndex: ['creator','name'],
        ellipsis: true,
        filters: true,
        onFilter: true,
        valueType: 'select',
        filterSearch: true,
    },
    {
        title:('更新时间'),
        dataIndex: 'updateTime',
        ellipsis:true,
        hideInSearch: true,
        width:182,
        sorter: (a,b)=>frontendTimeSorter(a,b,'updateTime')
    },
];



export const SYSTEM_UPSTREAM_TABLE_COLUMNS: PageProColumns<SystemUpstreamTableListItem>[] = [
    {
        title:('名称'),
        dataIndex: 'name',
        ellipsis:true,
        width:160,
        fixed:'left',
        sorter: (a,b)=> {
            return a.name.localeCompare(b.name)
        },
    },
    {
        title:('上游 ID'),
        dataIndex: 'id',
        width: 140,
        ellipsis:true
    },
    {
        title:('创建人'),
        dataIndex: ['creator','name'],
        ellipsis: true,
        width:88,
        filters: true,
        onFilter: true,
        valueType: 'select',
        filterSearch: true,
    },
    {
        title:('更新人'),
        dataIndex: ['updater','name'],
        ellipsis: true,
        width:88,
        filters: true,
        onFilter: true,
        valueType: 'select',
        filterSearch: true,
    },
    {
        title:('创建时间'),
        dataIndex: 'createTime',
        width:182,
        ellipsis:true,
        sorter: (a,b)=> {
            return a.createTime.localeCompare(b.createTime)
        }
    },
    {
        title:('更新时间'),
        dataIndex: 'updateTime',
        width:182,
        ellipsis:true,
        sorter: (a,b)=> {
            return a.updateTime.localeCompare(b.updateTime)
        },
    },
];

export const UpstreamDriverEnum = {
    'static':('静态上游'),
    'discoveries':('动态服务发现'),
}

export const UPSTREAM_TYPE_OPTIONS = [
    { label: ('静态上游'), value: 'static' },
    // { label: ('动态服务发现', value: 'discoveries' },
];

export const schemeOptions = [
    { label:('HTTPS'), value:'HTTPS'},
    { label:('HTTP'), value:'HTTP'},
]
export const UPSTREAM_BALANCE_OPTIONS = [
    { label: ('带权轮询'), value: 'round-robin' },
    { label: ('IP Hash'), value: 'ip-hash' },
];

export const UPSTREAM_PASS_HOST_OPTIONS = [
    { label:('透传客户端请求 Host'), value:'pass'},
    { label:('使用上游服务 Host'), value:'node'},
    { label:('重写 Host'), value:'rewrite'},
]

export const UPSTREAM_PROXY_HEADER_TYPE_OPTIONS =[
    {label:('新增或修改'), value: 'ADD' },
    { label: ('删除'), value: 'DELETE' }
]

export const PROXY_HEADER_CONFIG:ConfigField<ProxyHeaderItem>[] = [
    {
        title:('操作类型'),
        key: 'optType',
        renderText: (value: string) => {
            return value === 'ADD' ? ('新增或修改'):('删除')
        },
        required: true
    }, {
        title:('参数名'),
        key: 'key',
        component: <Input className="w-INPUT_NORMAL"/>,
        renderText: (value: string) => {
            return value
        },
        required: true
    }, {
        title:('参数值'),
        key: 'value',
        component: <Input className="w-INPUT_NORMAL" />,
        renderText: (value: string) => {
            return value
        },
        required: true
    }
]

export const NODE_CONFIG:ConfigField<NodeItem>[] = [
    {
        title:('集群'),
        key: 'cluster',
        component: <Select className="w-INPUT_NORMAL" options={[]}/>,
        required: true
    }, {
        title:('地址'),
        key: 'address',
        component: <Input className="w-INPUT_NORMAL" />,
        renderText: (value: string) => {
            return value
        },
        required: true
    }, {
        title:('权重'),
        key: 'weight',
        component: <InputNumber className="w-INPUT_NORMAL"/>,
        renderText: (value: string) => {
            return value
        },
        required: true
    }
]

export const SERVICE_VISUALIZATION_OPTIONS = [
    {label:('内部服务：可通过网关访问，但不展示在服务广场'),value:'inner'},
    {label:('公开服务：可通过网关访问，展示在服务广场，可被其他应用订阅'),value:'public'}];

    

export const SYSTEM_MYSERVICE_API_TABLE_COLUMNS: PageProColumns<ServiceApiTableListItem>[] = [
    {
        title:(' '),
        dataIndex: 'id',
        width:'40px',
        fixed:'left'
    },
    {
        title:('名称'),
        dataIndex: 'name',
        width:160,
        fixed:'left',
        ellipsis:true
    },
    {
        title:('请求方式'),
        dataIndex: 'method',
        ellipsis:true
    },
    {
        title:('请求路径'),
        dataIndex: 'path',
        ellipsis:true
    },
    {
        title: ('描述'),
        dataIndex: 'description',
        ellipsis:true
    }
];


export const apiModalColumn:ColumnsType<SimpleApiItem> = [
    {
        title:('所有 API'),
        dataIndex:'method',
    },
    {
        title:'',
        dataIndex:'name',
        ellipsis:true
    }
]


export const SYSTEM_UPSTREAM_GLOBAL_CONFIG_TABLE_COLUMNS: PageProColumns<GlobalNodeItem & {_id:string}>[] = [
    {
      title:('地址(IP 端口或域名）'),
      dataIndex: 'address',
      width: '50%',
      formItemProps: {
        className:'p-0 bg-transparent border-none',
        rootClassName:'test',
        rules: [
          {
            required: true,
            whitespace: true
          },
        ],
      },
      ellipsis:true
    },
    {
      title:('权重（0-999）'),
      dataIndex: 'weight',
      valueType:'digit',
      formItemProps: {
        className:'p-0 bg-transparent border-none'}
    },
    {
      title: COLUMNS_TITLE.operate,
      valueType: 'option',
      btnNums:2,
      render: ()=>null
    },
  ];

  
export const SYSTEM_INSIDE_APPROVAL_TAB_ITEMS: TabsProps['items'] = [
    {
        key: '0',
        label:('待审批'),
    },
    {
        key: '1',
        label: ('已审批'),
    }
];



export const SYSTEM_PUBLISH_TAB_ITEMS: TabsProps['items'] = [
    {
        key: '0',
        label: ('发布版本'),
    },
    {
        key: '1',
        label: ('发布申请记录'),
    }
];


export const SYSTEM_SUBSCRIBE_APPROVAL_DETAIL_LIST = [
    {
        title:('服务名称'),key:'service',nested:'name'
    },
    {
        title:('服务 ID'),key:'applyTeam',nested:'id'
    },
    {
        title:('所属团队'),key:'team',nested:'name'
    },
    {
        title:('所属系统'),key:'project',nested:'name'
    },
    {
        title:('申请状态'),key:'status',renderText:()=>{}
    },
    {
        title:('申请人'),key:'applier',nested:'name'
    },
    {
        title:('申请时间'),key:'applyTime'
    },
]

export const SYSTEM_TOPOLOGY_NODE_TYPE_COLOR_MAP = {
    subscriberProject:{
      stroke:'#3291F8FF',
      fill: '#3291F8FF',
      name:('调用系统名称')
    },
    subscriberService:{
      stroke:'#3D46F2',
      fill: '#7371FC33',
      name:('调用服务名称')
    },
    curProject:{
      stroke:'#7371FCFF',
      fill: '#7371FCFF',
      name:('当前系统名称')
    },
    invokeService:{
      stroke:'#3D46F2',
      fill: '#7371FC33',
      name:('被调用服务名称')
    },
    invokeProject:{
      stroke:'#19C56BFF',
      fill: '#19C56BFF',
      name:('被调用系统名称')
    },
    application:{
        stroke:'#ffa940',
        fill: '#ffa94033',
    }
  };
  


  export const SYSTEM_PUBLISH_ONLINE_COLUMNS = [
    {
        title:('上线结果'),
        dataIndex: 'status',
        ellipsis:{
            showTitle:true
        },
    },
  ]


