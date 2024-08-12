
import { ProColumns } from "@ant-design/pro-components";
import { MenuProps } from "antd";
import { getItem } from "@common/utils/navigation";
import { ServiceHubTableListItem } from "./type";

export const SERVICE_HUB_TABLE_COLUMNS: ProColumns<ServiceHubTableListItem>[] = [
    {
        title: '服务名称',
        dataIndex: 'name',
        copyable: true,
        ellipsis:true,
        width:160,
        fixed:'left',
        sorter: (a:ServiceHubTableListItem,b:ServiceHubTableListItem)=> {
            return a.name.localeCompare(b.name)
        },
    },
    {
        title: '服务ID',
        dataIndex: 'id',
        width: 140,
        copyable: true,
        ellipsis:true
    },
    {
        title: '服务标签',
        dataIndex: 'tags',
        ellipsis:true,
        renderText:(_,entity:ServiceHubTableListItem)=>entity.tags?.map(x=>x.name).join(',') || '-'
    },
    {
        title: '所属系统',
        dataIndex: ['app','name'],
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
        title: '服务分类',
        dataIndex: ['catalogue','name'],
        copyable: true,
        ellipsis:true
    }
];


export const TENANT_MANAGEMENT_APP_MENU: MenuProps['items'] = [
   
    getItem('订阅的服务', 'service'),
    getItem('访问授权', 'authorization'),
    getItem('应用管理', 'setting'),
];
