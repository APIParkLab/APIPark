
import { PageProColumns } from "@common/components/aoplatform/PageList";
import { MemberTableListItem } from "./type";
import { $t } from "@common/locales";


export const MEMBER_TABLE_COLUMNS: PageProColumns<MemberTableListItem>[] = [
    {
        title:$t('用户名'),
        dataIndex: 'name',
        ellipsis:true,
        width:160,
        fixed:'left',
        sorter: (a,b)=> {
            return a.name.localeCompare(b.name)
        },
    },
    {
        title:$t('邮箱'),
        dataIndex: 'email',
        ellipsis:true,
    },
    {
        title:$t('部门'),
        dataIndex: 'department',
        ellipsis:true,
        filterMode:'tree',
        renderText:(_,entity:MemberTableListItem)=>(entity.department?.map(x=>x.name).join('，') || '-'),
        filters: [],
        onFilter: true,
        // valueType: 'select',
        filterSearch: true,
    },
    {
        title:$t('角色'),
        dataIndex: 'roles',
        ellipsis:true,
        width:200
    },
    {
        title:$t('状态'),
        dataIndex:'enable',
        valueType: 'select',
        filters: true,
        onFilter: true,
        valueEnum:new Map([
            [true,<span className="text-status_success">{$t('启用')}</span>],
            [false,<span className="text-status_fail">{$t('禁用')}</span>],
        ])
    }
];
