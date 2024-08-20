
import { TeamMemberTableListItem, TeamTableListItem } from "./type";
import { ColumnsType } from "antd/es/table";
import { MemberItem } from "@common/const/type";
import { getItem } from "@common/utils/navigation";
import { SystemTableListItem } from "../system/type";
import { MenuProps } from "antd/lib";
import { Link } from "react-router-dom";
import { $t } from "@common/locales";
import { PageProColumns } from "@common/components/aoplatform/PageList";

export const TEAM_TABLE_COLUMNS: PageProColumns<TeamTableListItem>[] = [
    {
        title:$t('名称'),
        dataIndex: 'name',
        ellipsis:true,
        width:160,
        fixed:'left',
        sorter: (a,b)=> {
            return a.name.localeCompare(b.name)
        },
    },
    {
        title:$t('ID'),
        dataIndex: 'id',
        width: 140,
        ellipsis:true
    },
    {
        title: $t('描述'),
        dataIndex: 'description',
        ellipsis:true
    },
    {
        title:$t('服务数量'),
        dataIndex: 'serviceNum',
        ellipsis:true,
        sorter: (a,b)=> {
            return a.serviceNum - b.serviceNum
        },
    },
    {
        title:$t('负责人'),
        dataIndex: ['master','name'],
        ellipsis: true,
        width:108,
        filters: true,
        onFilter: true,
        valueType: 'select',
        filterSearch: true,
    },
    {
        title:$t('创建时间'),
        dataIndex: 'createTime',
        ellipsis:true,
        width:182,
        sorter: (a,b)=> {
            return a.createTime.localeCompare(b.createTime)
        },
    },
];


export const TEAM_SYSTEM_TABLE_COLUMNS: PageProColumns<SystemTableListItem>[] = [
    {
        title:$t('服务名称'),
        dataIndex: 'name',
        ellipsis:true,
        width:160,
        fixed:'left',
        sorter: (a,b)=> {
            return a.name.localeCompare(b.name)
        },
    },
    {
        title:$t('服务 ID'),
        dataIndex: 'id',
        width: 140,
        ellipsis:true
    },
    {
        title:$t('所属团队'),
        dataIndex: ['team','name'],
        ellipsis:true
    },
    {
        title:$t('API数量'),
        dataIndex: 'apiNum',
        ellipsis:true,
        sorter: (a,b)=> {
            return a.apiNum - b.apiNum
        },
    },
    {
        title:$t('服务数量'),
        dataIndex: 'serviceNum',
        ellipsis:true,
        sorter: (a,b)=> {
            return a.serviceNum - b.serviceNum
        },
    },
    {
        title:$t('负责人'),
        dataIndex: ['master','name'],
        ellipsis: true,
        width:108,
        filters: true,
        onFilter: true,
        valueType: 'select',
        filterSearch: true
    },
    {
        title:$t('添加日期'),
        dataIndex: 'createTime',
        ellipsis: true,
        sorter: (a,b)=> {
            return a.createTime.localeCompare(b.createTime)
        },
    },
];

export const TEAM_MEMBER_TABLE_COLUMNS: PageProColumns<TeamMemberTableListItem>[] = [
    {
        title:$t('姓名'),
        dataIndex: ['user','name'],
        ellipsis:true,
        width:160,
        fixed:'left',
        sorter: (a,b)=> {
            return a.user.name.localeCompare(b.user.name)
        },
    },
    {
        title:$t('团队角色'),
        dataIndex: 'roles',
        ellipsis:true,
    },
    {
        title:$t('添加日期'),
        dataIndex: 'attachTime',
        ellipsis:true,
        sorter: (a,b)=> {
            return a.attachTime.localeCompare(b.attachTime)
        },
    },
];


export const TEAM_MEMBER_MODAL_TABLE_COLUMNS:ColumnsType<MemberItem> = [
    {title:$t('成员'),
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
        getItem($t('管理'), 'grp', null,
            [
                getItem(<Link to="member">{$t('成员')}</Link>, 'member',undefined, undefined, undefined,'team.team.member.view'),
                getItem(<Link to="setting">{$t('设置')}</Link>, 'setting',undefined,undefined,undefined,'team.team.team.edit')],
            'group'),
    ];
    