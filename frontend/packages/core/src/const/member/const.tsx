
import { PageProColumns } from "@common/components/aoplatform/PageList";
import { MemberTableListItem } from "./type";



export const MEMBER_TABLE_COLUMNS: PageProColumns<MemberTableListItem>[] = [
    {
        title:('用户名'),
        dataIndex: 'name',
        ellipsis:true,
        width:160,
        fixed:'left',
        sorter: (a,b)=> {
            return a.name.localeCompare(b.name)
        },
    },
    {
        title:('邮箱'),
        dataIndex: 'email',
        ellipsis:true,
    },
    {
        title:('部门'),
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
        title:('角色'),
        dataIndex: 'roles',
        ellipsis:true,
        width:200
    },
    {
        title:('状态'),
        dataIndex:'enable',
        valueType: 'select',
        filters: true,
        onFilter: true,
    }
];
