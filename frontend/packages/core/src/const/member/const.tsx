
import { ProColumns } from "@ant-design/pro-components";
import { MemberTableListItem } from "./type";


export const MEMBER_TABLE_COLUMNS: ProColumns<MemberTableListItem>[] = [
    {
        title: '用户名',
        dataIndex: 'name',
        ellipsis:true,
        width:160,
        fixed:'left',
        sorter: (a,b)=> {
            return a.name.localeCompare(b.name)
        },
    },
    {
        title: '邮箱',
        dataIndex: 'email',
        ellipsis:true,
    },
    {
        title: '部门',
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
        title: '角色',
        dataIndex: 'roles',
        ellipsis:true,
        width:200
    },
    {
        title:'状态',
        dataIndex:'enable',
        valueType: 'select',
        filters: true,
        onFilter: true,
        valueEnum:new Map([
            [true,<span className="text-status_success">启用</span>],
            [false,<span className="text-status_fail">禁用</span>],
        ])
    }
];
