import { PartitionCertTableListItem, PartitionClusterNodeModalTableListItem, PartitionClusterNodeTableListItem, PartitionClusterTableListItem, PartitionTableListItem } from "./types";
import { ColumnType } from "antd/es/table";
import CopyAddrList from "@common/components/aoplatform/CopyAddrList";

import { PageProColumns } from "@common/components/aoplatform/PageList";
import { $t } from "@common/locales";


export const PARTITION_CERT_TABLE_COLUMNS: PageProColumns<PartitionCertTableListItem>[] = [
    {
        title:('证书'),
        dataIndex: 'name',
        ellipsis:true,
        width:160,
        fixed:'left',
        sorter: (a,b)=> {
            return a.name.localeCompare(b.name)
        },
    },
    {
        title:('绑定域名'),
        dataIndex: 'domains',
        renderText:(_,entity) =>(
            entity.domains.join(',')
        ),
        ellipsis:true
    },
    {
        title:('过期日期'),
        ellipsis: true,
        dataIndex: 'notAfter',
        width:140,
        renderText: (value: string) => value ? value.split(' ')?.[0] : '-',
        sorter: (a,b)=> {
            return a.notAfter.localeCompare(b.notAfter)
        },
    },
    {
        title:('更新者'),
        dataIndex: ['updater','name'],
        ellipsis: true,
        filters: true,
        onFilter: true,
        valueType: 'select',
        filterSearch: true
    },
    {
        title:('更新时间'),
        key: 'updateTime',
        dataIndex: 'updateTime',
        ellipsis:true,
        width:182,
        sorter: (a,b)=> {
            return a.updateTime.localeCompare(b.updateTime)
        },
    },
];


export const NODE_MODAL_COLUMNS:ColumnType<PartitionClusterNodeModalTableListItem>[] = [
    {title:('名称'), dataIndex:'name',width:200,
    ellipsis:true,
    fixed:'left'},
    {title:('管理地址'), dataIndex:'managerAddress',width:240,ellipsis:true,render:(_,entity)=>(<CopyAddrList keyName="managerAddress" addrItem={entity} />)},
    {title:('服务地址'), dataIndex:'serviceAddress',width:240,ellipsis:true,render:(_,entity)=>(<CopyAddrList keyName="serviceAddress" addrItem={entity} />)},
    {title:('状态'), dataIndex:'status',
    render:(text)=>(
        <span className={text === 0 ? 'text-status_fail' : 'text-status_success'}>{ClusterStatusEnum[text]}</span>
    )}
]

export const PARTITION_LIST_COLUMNS: PageProColumns<PartitionTableListItem>[] = [
    {
        title:('环境名称'),
        dataIndex: 'name',
        ellipsis:true,
        fixed:'left',
        sorter: (a,b)=> {
            return a.name.localeCompare(b.name)
        },
    },
    {
        title:('ID'),
        dataIndex: 'id',
        ellipsis:true,
        width:140,
    },
    // {
    //     title:('集群数量',
    //     dataIndex: 'clusterNum',
    //     sorter: (a,b)=> {
    //         return a.clusterNum - b.clusterNum
    //     },
    // },
    {
        title:('更新者'),
        dataIndex: ['updater','name'],
        ellipsis: true,
        filters: true,
        onFilter: true,
        width:100,
        valueType: 'select',
        filterSearch: true
    },
    {
        title:('更新时间'),
        dataIndex: 'updateTime',
        ellipsis:true,
        width:182,
        sorter: (a,b)=> {
            return a.updateTime.localeCompare(b.updateTime)
        },
    },
];

export const ClusterStatusEnum ={
   0: ('异常'),
   1: ('正常')
}

export const DASHBOARD_SETTING_DRIVER_OPTION_LIST = [
    {
        label:'influxdb',
        value:'influxdb-v2'
    }
]