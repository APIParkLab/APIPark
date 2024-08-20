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
import { $t } from "@common/locales";
import { PageProColumns } from "@common/components/aoplatform/PageList";

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
    'header' : $t('HTTP 请求头'),
    'query': $t('请求参数'),
    'cookie' : $t('Cookie')
}

export const  MatchTypeEnum = {
    'EQUAL' : $t('全等匹配'),
    'PREFIX' : $t('前缀匹配'),
    'SUFFIX' :$t('后缀匹配'),
    'SUBSTR' : $t('子串匹配'),
    'UNEQUAL' : $t('非等匹配'),
    'NULL' : $t('空值匹配'),
    'EXIST' : $t('存在匹配'),
    'UNEXIST':$t('不存在匹配'),
    'REGEXP':$t('区分大小写的正则匹配'),
    'REGEXPG':$t('不区分大小写的正则匹配'),
    'unknown': $t('任意匹配')
}


export const SYSTEM_I18NEXT_FOR_ENUM = {
    [SubscribeEnum.Rejected]:$t('驳回'),
    [SubscribeEnum.Reviewing]:$t('审核中'),
    [SubscribeEnum.Subscribed]:$t('已订阅'),
    [SubscribeEnum.Unsubscribed]:$t('取消订阅'),
    [SubscribeEnum.CancelRequest]:$t('取消申请'),
    [SubscribeFromEnum.manual]:$t('手动添加'),
    [SubscribeFromEnum.subscribe]:$t('订阅申请'),
}

export const HTTP_METHOD = ['GET','POST','PUT','DELETE','PATCH','HEAD']


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
        title:$t('服务名称'),
        dataIndex: 'name',
        ellipsis:true,
        width:160,
        fixed:'left',
        sorter: (a,b)=> {
            return a.name.localeCompare(b.name)
        },
    },
    {
        title:$t('服务 ID'),
        dataIndex: 'id',
        width: 140,
        ellipsis:true,
    },
    {
        title:$t('所属团队'),
        dataIndex: ['team','name'],
        ellipsis:true,
        // filters: true,
        // onFilter: true,
        // filterSearch: true,
    },
    {
        title:$t('API 数量'),
        dataIndex: 'apiNum',
        ellipsis:true,
        sorter: (a,b)=> {
            return a.apiNum - b.apiNum
        },
    },
    {
        title: $t('描述'),
        dataIndex: 'description',
        ellipsis:true,
    },
    {
        title:$t('负责人'),
        dataIndex: ['master','name'],
        ellipsis: true,
        width:108,
        filters: true,
        onFilter: true,
        valueType: 'select',
        filterSearch: true,
    },
    {
        title:$t('创建时间'),
        dataIndex: 'createTime',
        width:182,
        ellipsis:true,
        sorter: (a,b)=>frontendTimeSorter(a,b,'createTime')
    }
];

export const SYSTEM_SUBSERVICE_TABLE_COLUMNS: PageProColumns<SystemSubServiceTableListItem>[] = [
    {
        title:$t('服务名称'),
        dataIndex: ['service','name'],
        ellipsis:true,
        width:160,
        fixed:'left',
        sorter: (a,b)=> {
            return a.service.name.localeCompare(b.service.name)
        },
    },
    {
        title:$t('服务 ID'),
        dataIndex: ['service','name'],
        width: 140,
        ellipsis:true
    },
    {
        title:$t('申请状态'),
        dataIndex: 'applyStatus',
        ellipsis:{
            showTitle:true
        },
        width:80,
        filters: true,
        onFilter: true,
        valueType: 'select',
        valueEnum:new Map([
            [0,<span className={SubscribeStatusColor[0]}>{$t('驳回')}</span>],
            [1,<span className={SubscribeStatusColor[1]}>{$t('审核中')}</span>],
            [2,<span className={SubscribeStatusColor[2]}>{$t('已订阅')}</span>],
            [3,<span className={SubscribeStatusColor[3]}>{$t('取消订阅')}</span>],
            [4,<span className={SubscribeStatusColor[4]}>{$t('取消申请')}</span>],
        ])
    },
    {
        title:$t('所属服务'),
        dataIndex: ['project','name'],
        ellipsis:true
    },
    {
        title:$t('所属团队'),
        dataIndex: ['team','name'],
        ellipsis:true
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
        title:$t('来源'),
        dataIndex: 'from',
        ellipsis: true,
        filters: true,
        onFilter: true,
        valueType: 'select',
        valueEnum:new Map([
            [0,<span>{$t('手动添加')}</span>],
            [1,<span>{$t('订阅申请')}</span>],
        ])
    },
    {
        title:$t('添加时间'),
        dataIndex: 'createTime',
        ellipsis:true,
        width:182,
        sorter: (a,b)=> {
            return a.createTime.localeCompare(b.createTime)
        },
    },
];


export const SYSTEM_SUBSCRIBER_TABLE_COLUMNS: PageProColumns<SystemSubscriberTableListItem>[] = [
    {
        title:$t('服务名称'),
        dataIndex: ['service','name'],
        ellipsis:true,
        width:160,
        fixed:'left',
        sorter: (a,b)=> {
            return a.service.name.localeCompare(b.service.name)
        },
    },
    {
        title:$t('服务 ID'),
        dataIndex: 'id',
        width: 140,
        ellipsis:true
    },
    {
        title:$t('订阅方'),
        dataIndex: ['subscriber','name'],
        ellipsis:true
    },
    {
        title:$t('所属团队'),
        dataIndex: ['team','name'],
        ellipsis:true
    },
    {
        title:$t('来源'),
        dataIndex: 'from',
        ellipsis:true,
        filters: true,
        onFilter: true,
        valueType: 'select',
        valueEnum:new Map([
            [0,<span>{$t('手动添加')}</span>],
            [1,<span>{$t('订阅申请')}</span>],
        ])
    },
    {
        title:$t('订阅时间'),
        dataIndex: 'applyTime',
        ellipsis:true,
        width:182,
        sorter: (a,b)=> {
            return a.applyTime.localeCompare(b.applyTime)
        },
    },
];


export const memberModalColumn:ColumnsType<MemberItem> = [
    {title:$t('成员'),
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
        title:$t('用户名'),
        dataIndex: ['user','name'],
        ellipsis:true,
        width:160,
        fixed:'left',
        sorter: (a,b)=> {
            return a.user.name.localeCompare(b.user.name)
        },
    },
    {
        title:$t('邮箱'),
        dataIndex: 'email',
        ellipsis:true
    },
    {
        title:$t('角色'),
        dataIndex: ['roles','name'],
        ellipsis:true

    }
];

export const MATCH_CONFIG:ConfigField<MatchItem>[] = [
    {
        title:$t('参数位置'),
        key: 'position',
        component: <Select className="w-INPUT_NORMAL" options={Object.entries(MatchPositionEnum)?.map(([key,value])=>{
            return { label:value, value:key}
        })}/>,
        renderText: (value:keyof typeof MatchPositionEnum) => {
            return (<>{MatchPositionEnum[value]}</>)
        },
        required: true,
        ellipsis:true
    }, {
        title:$t('参数名'),
        key: 'key',
        component: <Input className="w-INPUT_NORMAL" />,
        renderText: (value: unknown) => <>{value}</>,
        required: true
    }, {
        title:$t('匹配类型'),
        key: 'matchType',
        component: <Select className="w-INPUT_NORMAL" options={Object.entries(MatchTypeEnum)?.map(([key,value])=>{
            return { label:value, value:key}
        })}/>,
        renderText: (value:keyof typeof MatchTypeEnum) => {
            return (<>{MatchTypeEnum[value]}</>)
        },
        required: true
    }, {
        title:$t('参数值'),
        key: 'pattern',
        component: <Input className="w-INPUT_NORMAL"/>,
        renderText: (value: string) => {
            return (<>{value}</>)
        },
        required: true
    }
]


export const SYSTEM_API_TABLE_COLUMNS: PageProColumns<SystemApiTableListItem>[] = [
    {
        title:$t('名称'),
        dataIndex: 'name',
        ellipsis:true,
        width:160,
        fixed:'left',
        valueType: 'text',
        sorter: (a,b)=> {
            return a.name.localeCompare(b.name)
        },
    },
    {
        title:$t('协议/方法'),
        dataIndex: 'method',
        ellipsis:true,
        filters: true,
        onFilter: true,
        valueType: 'select',
        valueEnum: {
            POST: { text: 'POST' },
            PUT: { text: 'PUT' },
            GET: { text: 'GET' },
            DELETE: { text: 'DELETE' },
            PATCH: { text: 'PATCH' },
        },
    },
    {
        title:$t('URL'),
        dataIndex: 'requestPath',
        ellipsis:true
    },
    {
        title:$t('创建者'),
        dataIndex: ['creator','name'],
        ellipsis: true,
        filters: true,
        onFilter: true,
        valueType: 'select',
        filterSearch: true,
    },
    {
        title:$t('更新时间'),
        dataIndex: 'updateTime',
        ellipsis:true,
        hideInSearch: true,
        width:182,
        sorter: (a,b)=>frontendTimeSorter(a,b,'updateTime')
    },
];



export const SYSTEM_UPSTREAM_TABLE_COLUMNS: PageProColumns<SystemUpstreamTableListItem>[] = [
    {
        title:$t('名称'),
        dataIndex: 'name',
        ellipsis:true,
        width:160,
        fixed:'left',
        sorter: (a,b)=> {
            return a.name.localeCompare(b.name)
        },
    },
    {
        title:$t('上游 ID'),
        dataIndex: 'id',
        width: 140,
        ellipsis:true
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
    },
    {
        title:$t('更新人'),
        dataIndex: ['updater','name'],
        ellipsis: true,
        width:88,
        filters: true,
        onFilter: true,
        valueType: 'select',
        filterSearch: true,
    },
    {
        title:$t('创建时间'),
        dataIndex: 'createTime',
        width:182,
        ellipsis:true,
        sorter: (a,b)=> {
            return a.createTime.localeCompare(b.createTime)
        }
    },
    {
        title:$t('更新时间'),
        dataIndex: 'updateTime',
        width:182,
        ellipsis:true,
        sorter: (a,b)=> {
            return a.updateTime.localeCompare(b.updateTime)
        },
    },
];

export const UpstreamDriverEnum = {
    'static':$t('静态上游'),
    'discoveries':$t('动态服务发现'),
}

export const typeOptions = [
    { label: $t('静态上游'), value: 'static' },
    // { label: $t('动态服务发现', value: 'discoveries' },
];

export const schemeOptions = [
    { label:$t('HTTPS'), value:'HTTPS'},
    { label:$t('HTTP'), value:'HTTP'},
]
export const balanceOptions = [
    { label: $t('带权轮询'), value: 'round-robin' },
    { label: $t('IP Hash'), value: 'ip-hash' },
];

export const passHostOptions = [
    { label:$t('透传客户端请求 Host'), value:'pass'},
    { label:$t('使用上游服务 Host'), value:'node'},
    { label:$t('重写 Host'), value:'rewrite'},
]

export const proxyHeaderTypeOptions =[
    {label:$t('新增或修改'), value: 'ADD' },
    { label: $t('删除'), value: 'DELETE' }
]

export const PROXY_HEADER_CONFIG:ConfigField<ProxyHeaderItem>[] = [
    {
        title:$t('操作类型'),
        key: 'optType',
        component: <Select className="w-INPUT_NORMAL" options={proxyHeaderTypeOptions}/>,
        renderText: (value: string) => {
            return (<>{value === 'ADD' ? $t('新增或修改'):$t('删除')}</>)
        },
        required: true
    }, {
        title:$t('参数名'),
        key: 'key',
        component: <Input className="w-INPUT_NORMAL"/>,
        renderText: (value: string) => {
            return (<>{value}</>)
        },
        required: true
    }, {
        title:$t('参数值'),
        key: 'value',
        component: <Input className="w-INPUT_NORMAL" />,
        renderText: (value: string) => {
            return (<>{value}</>)
        },
        required: true
    }
]

export const NODE_CONFIG:ConfigField<NodeItem>[] = [
    {
        title:$t('集群'),
        key: 'cluster',
        component: <Select className="w-INPUT_NORMAL" options={[]}/>,
        required: true
    }, {
        title:$t('地址'),
        key: 'address',
        component: <Input className="w-INPUT_NORMAL" />,
        renderText: (value: string) => {
            return (<>{value}</>)
        },
        required: true
    }, {
        title:$t('权重'),
        key: 'weight',
        component: <InputNumber className="w-INPUT_NORMAL"/>,
        renderText: (value: string) => {
            return (<>{value}</>)
        },
        required: true
    }
]

export const visualizations = [
    {label:$t('内部服务：可通过网关访问，但不展示在服务广场'),value:'inner'},
    {label:$t('公开服务：可通过网关访问，展示在服务广场，可被其他应用订阅'),value:'public'}];

    

export const SYSTEM_MYSERVICE_API_TABLE_COLUMNS: PageProColumns<ServiceApiTableListItem>[] = [
    {
        title:$t(' '),
        dataIndex: 'id',
        width:'40px',
        fixed:'left'
    },
    {
        title:$t('名称'),
        dataIndex: 'name',
        width:160,
        fixed:'left',
        ellipsis:true
    },
    {
        title:$t('请求方式'),
        dataIndex: 'method',
        ellipsis:true
    },
    {
        title:$t('请求路径'),
        dataIndex: 'path',
        ellipsis:true
    },
    {
        title: $t('描述'),
        dataIndex: 'description',
        ellipsis:true
    }
];


export const apiModalColumn:ColumnsType<SimpleApiItem> = [
    {
        title:$t('所有 API'),
        dataIndex:'method',
    },
    {
        title:'',
        dataIndex:'name',
        ellipsis:true
    }
]


export const SYSTEM_AUTHORITY_TABLE_COLUMNS: PageProColumns<SystemAuthorityTableListItem>[] = [
    {
        title:$t('名称'),
        dataIndex: 'name',
        ellipsis:true,
        width:160,
        fixed:'left',
        sorter: (a,b)=> {
            return a.name.localeCompare(b.name)
        },
    },
    {
        title:$t('类型'),
        dataIndex: 'driver',
        ellipsis:true,
        filters: true,
        onFilter: true,
        valueType: 'select',
        valueEnum:{
            basic:{
                text:'Basic'
            },
            apikey:{
                text:'Apikey'
            }
        }
    },
    {
        title:$t('隐藏鉴权信息'),
        dataIndex: 'hideCredential',
        ellipsis:{
            showTitle:true
        },
        filters: true,
        onFilter: true,
        valueType: 'select',
        valueEnum:new Map([
            [true,<span>是</span>],
            [false,<span>否</span>],
        ])
    },
    {
        title:$t('过期时间'),
        dataIndex: 'expireTime',
        ellipsis:true,
        width:182,
        render:(_: React.ReactNode, entity: SystemAuthorityTableListItem) => (
            <span className={entity.expireTime !== 0 &&  dayjs().valueOf() - (entity.expireTime * 1000) > 0 ? 'text-status_fail' : ''}>{entity.expireTime === 0 ? '永不过期'  :dayjs(entity.expireTime * 1000).format('YYYY-MM-DD hh:mm:ss')}</span>
        ),
        sorter: (a,b)=> {
            return a.expireTime - b.expireTime
        },
    },
    {
        title:$t('更新者'),
        dataIndex: ['updater','name'],
        ellipsis: true,
        width:88,
        filters: true,
        onFilter: true,
        valueType: 'select',
        filterSearch: true,
    },
    {
        title:$t('创建时间'),
        key: 'createTime',
        dataIndex: 'createTime',
        width:182,
        ellipsis:true,
        sorter: (a,b)=> {
            return a.createTime.localeCompare(b.createTime)
        },
    },
];


export const SYSTEM_MYSERVICE_TABLE_COLUMNS: PageProColumns<MyServiceTableListItem>[] = [
    {
        title:$t('服务名称'),
        dataIndex: 'name',
        ellipsis:true,
        width:160,
        fixed:'left',
        sorter: (a,b)=> {
            return a.name.localeCompare(b.name)
        },
    },
    {
        title:$t('服务ID'),
        dataIndex: 'id',
        width: 140,
        ellipsis:true
    },
    {
        title:$t('服务类型'),
        dataIndex: 'serviceType',
        ellipsis:{
            showTitle:true
        },
        filters: true,
        onFilter: true,
        valueType: 'select',
        valueEnum:{
            'public':{
                text:$t('公开服务')
            },
            'inner':{
                text:$t('内部服务')
            }
        }
    },
    {
        title:$t('API 数量'),
        dataIndex: 'apiNum',
        sorter: (a,b)=> {
            return a.apiNum - b.apiNum
        },
    },
    {
        title:$t('状态'),
        dataIndex: 'status',
        ellipsis:{
            showTitle:true
        },
        filters: true,
        onFilter: true,
        valueType: 'select',
        valueEnum:{
            'on':<span className="text-status_success">{$t('启用')}</span> ,
            'off':<span className="text-status_fail">{$t('停用')}</span>  
        }
    },
    {
        title:$t('更新时间'),
        key: 'updateTime',
        dataIndex: 'updateTime',
        ellipsis:true,
        width:182,
        sorter: (a,b)=> {
            return a.updateTime.localeCompare(b.updateTime)
        },
    },
    {
        title:$t('创建时间'),
        key: 'createTime',
        dataIndex: 'createTime',
        width:182,
        ellipsis:true,
        sorter: (a,b)=> {
            return a.createTime.localeCompare(b.createTime)
        },
    },
];



export const SYSTEM_UPSTREAM_GLOBAL_CONFIG_TABLE_COLUMNS: PageProColumns<GlobalNodeItem & {_id:string}>[] = [
    {
      title:$t('地址(IP 端口或域名）'),
      dataIndex: 'address',
      width: '50%',
      formItemProps: {
        className:'p-0 bg-transparent border-none',
        rootClassName:'test',
        rules: [
          {
            required: true,
            whitespace: true,
            message: VALIDATE_MESSAGE.required,
          },
        ],
      },
      ellipsis:true
    },
    {
      title:$t('权重（0-999）'),
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
        label:$t('待审批'),
    },
    {
        key: '1',
        label: $t('已审批'),
    }
];



export const SYSTEM_PUBLISH_TAB_ITEMS: TabsProps['items'] = [
    {
        key: '0',
        label: $t('发布版本'),
    },
    {
        key: '1',
        label: $t('发布申请记录'),
    }
];


export const SYSTEM_SUBSCRIBE_APPROVAL_DETAIL_LIST = [
    {
        title:$t('服务名称'),key:'service',nested:'name'
    },
    {
        title:$t('服务 ID'),key:'applyTeam',nested:'id'
    },
    {
        title:$t('所属团队'),key:'team',nested:'name'
    },
    {
        title:$t('所属系统'),key:'project',nested:'name'
    },
    {
        title:$t('申请状态'),key:'status',renderText:()=>{}
    },
    {
        title:$t('申请人'),key:'applier',nested:'name'
    },
    {
        title:$t('申请时间'),key:'applyTime'
    },
]

export const SYSTEM_TOPOLOGY_NODE_TYPE_COLOR_MAP = {
    subscriberProject:{
      stroke:'#3291F8FF',
      fill: '#3291F8FF',
      name:$t('调用系统名称')
    },
    subscriberService:{
      stroke:'#3D46F2',
      fill: '#7371FC33',
      name:$t('调用服务名称')
    },
    curProject:{
      stroke:'#7371FCFF',
      fill: '#7371FCFF',
      name:$t('当前系统名称')
    },
    invokeService:{
      stroke:'#3D46F2',
      fill: '#7371FC33',
      name:$t('被调用服务名称')
    },
    invokeProject:{
      stroke:'#19C56BFF',
      fill: '#19C56BFF',
      name:$t('被调用系统名称')
    },
    application:{
        stroke:'#ffa940',
        fill: '#ffa94033',
    }
  };
  


  export const SYSTEM_PUBLISH_ONLINE_COLUMNS = [
    {
        title:$t('上线结果'),
        dataIndex: 'status',
        ellipsis:{
            showTitle:true
        },
        render:(_:unknown,entity:SystemInsidePublishOnlineItems)=>{
            switch(entity.status){
                case 'done':
                    return <span className={STATUS_COLOR[entity.status as keyof typeof STATUS_COLOR]}>{$t('成功')}</span>
                case 'error':
                    return  <Tooltip title={entity.error || $t('上线失败')}><span className={`${STATUS_COLOR[entity.status  as keyof typeof STATUS_COLOR]} truncate block`}>{$t('失败')} {entity.error}</span></Tooltip>
                default:
                    return <LoadingOutlined className="text-theme" spin />
            }
        }
    },
  ]

const APP_MODE = import.meta.env.VITE_APP_MODE;


  export const SYSTEM_PAGE_MENU_ITEMS: MenuProps['items'] = [
    getItem($t('服务'), 'assets', null,
        [
            getItem(<Link to="./api">{$t('API')}</Link>, 'api',undefined,undefined,undefined,'team.service.api.view'),
            getItem(<Link to="./upstream">{$t('上游')}</Link>, 'upstream',undefined,undefined,undefined,'team.service.upstream.view'),
            getItem(<Link to="./document">{$t('使用说明')}</Link>, 'document',undefined,undefined,undefined,''),
            getItem(<Link to="./publish">{$t('发布')}</Link>, 'publish',undefined,undefined,undefined,'team.service.release.view'),
            ],
        'group'),
    getItem($t('订阅管理'), 'provideSer', null,
        [
            getItem(<Link to="./approval">{$t('订阅审批')}</Link>, 'approval',undefined,undefined,undefined,'team.service.subscription.view'),
            getItem(<Link to="./subscriber">{$t('订阅方管理')}</Link>, 'subscriber',undefined,undefined,undefined,'team.service.subscription.view'),
        ],
        'group'),
    getItem($t('管理'), 'mng', null,
        [
            APP_MODE === 'pro' ? getItem(<Link to="./topology">{$t('调用拓扑图')}</Link>, 'topology',undefined,undefined,undefined,'project.mySystem.topology.view'):null,
            getItem(<Link to="./setting">{$t('设置')}</Link>, 'setting',undefined,undefined,undefined,'')],
        'group'),
];
