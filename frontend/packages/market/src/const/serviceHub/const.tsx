
import { MenuProps } from "antd";
import { getItem } from "@common/utils/navigation";
import { ServiceHubTableListItem } from "./type";

import { PageProColumns } from "@common/components/aoplatform/PageList";

export const SERVICE_HUB_TABLE_COLUMNS: PageProColumns<ServiceHubTableListItem>[] = [
    {
        title:('服务名称'),
        dataIndex: 'name',
        ellipsis:true,
        width:160,
        fixed:'left',
        sorter: (a:ServiceHubTableListItem,b:ServiceHubTableListItem)=> {
            return a.name.localeCompare(b.name)
        },
    },
    {
        title:('服务ID'),
        dataIndex: 'id',
        width: 140,
        ellipsis:true
    },
    {
        title:('服务标签'),
        dataIndex: 'tags',
        ellipsis:true,
        renderText:(_,entity:ServiceHubTableListItem)=>entity.tags?.map(x=>x.name).join(',') || '-'
    },
    {
        title:('所属系统'),
        dataIndex: ['app','name'],
        ellipsis:true
    },
    {
        title:('所属团队'),
        dataIndex: ['team','name'],
        ellipsis:true
    },
    {
        title:('服务分类'),
        dataIndex: ['catalogue','name'],
        ellipsis:true
    }
];


export const approvalTypeTranslate = {
    'auto':'无需审批',
    'manual':'需要审批'
}