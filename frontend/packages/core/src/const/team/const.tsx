
import { ProColumns } from "@ant-design/pro-components";
import { TeamMemberTableListItem, TeamTableListItem } from "./type";
import { ColumnsType } from "antd/es/table";
import { MemberItem } from "@common/const/type";
import { getItem, getTabItem } from "@common/utils/navigation";
import { SystemTableListItem } from "../system/type";
import { MenuProps, TabsProps } from "antd/lib";
import { Link } from "react-router-dom";

export const TEAM_TABLE_COLUMNS: ProColumns<TeamTableListItem>[] = [
    {
        title: '名称',
        dataIndex: 'name',
        ellipsis:true,
        width:160,
        fixed:'left',
        sorter: (a,b)=> {
            return a.name.localeCompare(b.name)
        },
    },
    {
        title: 'ID',
        dataIndex: 'id',
        width: 140,
        ellipsis:true
    },
    {
        title: '描述',
        dataIndex: 'description',
        ellipsis:true
    },
    {
        title: '服务数量',
        dataIndex: 'serviceNum',
        ellipsis:true,
        sorter: (a,b)=> {
            return a.serviceNum - b.serviceNum
        },
    },
    {
        title: '负责人',
        dataIndex: ['master','name'],
        ellipsis: true,
        width:108,
        filters: true,
        onFilter: true,
        valueType: 'select',
        filterSearch: true,
    },
    {
        title: '创建时间',
        dataIndex: 'createTime',
        ellipsis:true,
        width:182,
        sorter: (a,b)=> {
            return a.createTime.localeCompare(b.createTime)
        },
    },
];


export const TEAM_SYSTEM_TABLE_COLUMNS: ProColumns<SystemTableListItem>[] = [
    {
        title: '服务名称',
        dataIndex: 'name',
        ellipsis:true,
        width:160,
        fixed:'left',
        sorter: (a,b)=> {
            return a.name.localeCompare(b.name)
        },
    },
    {
        title: '服务 ID',
        dataIndex: 'id',
        width: 140,
        ellipsis:true
    },
    {
        title: '所属团队',
        dataIndex: ['team','name'],
        ellipsis:true
    },
    {
        title: 'API数量',
        dataIndex: 'apiNum',
        ellipsis:true,
        sorter: (a,b)=> {
            return a.apiNum - b.apiNum
        },
    },
    {
        title: '服务数量',
        dataIndex: 'serviceNum',
        ellipsis:true,
        sorter: (a,b)=> {
            return a.serviceNum - b.serviceNum
        },
    },
    {
        title: '负责人',
        dataIndex: ['master','name'],
        ellipsis: true,
        width:108,
        filters: true,
        onFilter: true,
        valueType: 'select',
        filterSearch: true
    },
    {
        title: '添加日期',
        dataIndex: 'createTime',
        ellipsis: true,
        sorter: (a,b)=> {
            return a.createTime.localeCompare(b.createTime)
        },
    },
];

export const TEAM_MEMBER_TABLE_COLUMNS: ProColumns<TeamMemberTableListItem>[] = [
    {
        title: '姓名',
        dataIndex: ['user','name'],
        ellipsis:true,
        width:160,
        fixed:'left',
        sorter: (a,b)=> {
            return a.user.name.localeCompare(b.user.name)
        },
    },
    {
        title: '团队角色',
        dataIndex: 'roles',
        ellipsis:true,
    },
    {
        title: '添加日期',
        dataIndex: 'attachTime',
        ellipsis:true,
        sorter: (a,b)=> {
            return a.attachTime.localeCompare(b.attachTime)
        },
    },
];


export const TEAM_MEMBER_MODAL_TABLE_COLUMNS:ColumnsType<MemberItem> = [
    {title:'成员',
    render:(_,entity)=>{
        return <>
            <div>
                <p>
                    <span>{entity.name}</span>
                    {entity.email !== undefined && <span className="text-status_offline">{entity.email}</span>}
                </p>
                <p>{entity.department || '-'}</p>
            </div>
        </>
    }}
]

    export const TEAM_INSIDE_MENU_ITEMS: MenuProps['items'] = [
        getItem('管理', 'grp', null,
            [
                getItem(<Link to="member">成员</Link>, 'member',undefined, undefined, undefined,'team.team.member.view'),
                getItem(<Link to="setting">设置</Link>, 'setting',undefined,undefined,undefined,'team.team.team.edit')],
            'group'),
    ];
    