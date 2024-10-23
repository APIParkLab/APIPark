
import { ServiceHubTableListItem } from "./type";

import { PageProColumns } from "@common/components/aoplatform/PageList";
import { frontendTimeSorter } from "@common/utils/dataTransfer";

export const SERVICE_HUB_TABLE_COLUMNS: PageProColumns<ServiceHubTableListItem>[] = [
    {
        title:('消费者'),
        dataIndex: 'name',
        ellipsis:true,
        width:160,
        fixed:'left',
        sorter: (a:ServiceHubTableListItem,b:ServiceHubTableListItem)=> {
            return a.name.localeCompare(b.name)
        },
    },
    {
        title:('消费者 ID'),
        dataIndex: 'id',
        width: 140,
        ellipsis:true
    },
    {
        title:('团队'),
        dataIndex: ['team','name'],
        ellipsis:true,
        renderText:(_,entity:ServiceHubTableListItem)=>entity.tags?.map(x=>x.name).join(',') || '-'
    },
    {
        title:('订阅服务数量'),
        dataIndex: 'subscribeNum',
        ellipsis:true
    },
    {
        title:('鉴权数量'),
        dataIndex: 'authNum',
        ellipsis:true
    },
    {
        title:('描述'),
        dataIndex:'description',
        ellipsis:true
    },
    {
        title:('创建时间'),
        dataIndex: 'createTime',
        width:182,
        ellipsis:true,
        sorter: (a,b)=>frontendTimeSorter(a,b,'createTime')
    },
];


export const approvalTypeTranslate = {
    'auto':'无需审核',
    'manual':'需要审核'
}