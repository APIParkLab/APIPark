
import { ProColumns } from "@ant-design/pro-components";
import { ColumnsType } from "antd/es/table";
import { MemberItem } from "@common/const/type";
import { Tooltip } from "antd";

export const USER_LIST_COLUMNS: ProColumns<MemberItem>[]= [
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
        ellipsis:{
            showTitle:true
        },
        filterMode:'tree',
        renderText:(_,entity)=>(entity.department?.map((x)=>x.name).join(',')||'-'),
        filters: [],
        onFilter: true,
        valueType: 'select',
        filterSearch: true,
    }
];

export const MEMBER_MODAL_COLUMNS:ColumnsType<MemberItem> = [
    {title:'所有成员',
    width:215,
    
        render:(_,entity)=>{
            return <>
            <Tooltip title={`${entity.name} (${entity.email || '-'}) (${entity.department?.map(x=>x.name).join('，') || '-'})`}>
                <div className="w-[191px] truncate">
                    <span className="mr-[4px]">{entity.name}</span>
                    {entity.email && <span className="text-status_offline mr-[4px]">({entity.email})</span>}
                    <span  className="text-status_offline leading-[20px]">({entity.department?.map(x=>x.name).join('，') || '-'})</span>
                </div>
            </Tooltip>
            </>
        }}
]