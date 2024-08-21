
import { MenuProps } from "antd";
import { getItem } from "@common/utils/navigation";
import { ServiceHubTableListItem } from "./type";
import { $t } from "@common/locales";
import { PageProColumns } from "@common/components/aoplatform/PageList";

export const SERVICE_HUB_TABLE_COLUMNS: PageProColumns<ServiceHubTableListItem>[] = [
    {
        title:$t('服务名称'),
        dataIndex: 'name',
        ellipsis:true,
        width:160,
        fixed:'left',
        sorter: (a:ServiceHubTableListItem,b:ServiceHubTableListItem)=> {
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
        title:$t('服务标签'),
        dataIndex: 'tags',
        ellipsis:true,
        renderText:(_,entity:ServiceHubTableListItem)=>entity.tags?.map(x=>x.name).join(',') || '-'
    },
    {
        title:$t('所属系统'),
        dataIndex: ['app','name'],
        ellipsis:true
    },
    {
        title:$t('所属团队'),
        dataIndex: ['team','name'],
        ellipsis:true
    },
    {
        title:$t('服务分类'),
        dataIndex: ['catalogue','name'],
        ellipsis:true
    }
];


export const TENANT_MANAGEMENT_APP_MENU: MenuProps['items'] = [
   
    getItem($t('订阅的服务'), 'service'),
    getItem($t('访问授权'), 'authorization'),
    getItem($t('应用管理'), 'setting'),
];
