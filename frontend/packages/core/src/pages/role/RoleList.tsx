import { App} from "antd";
import PageList from "@common/components/aoplatform/PageList.tsx";
import  { useEffect, useRef,} from "react";
import {ActionType, ProColumns} from "@ant-design/pro-components";
import {useBreadcrumb} from "@common/contexts/BreadcrumbContext.tsx";
import {BasicResponse, STATUS_CODE} from "@common/const/const.ts";
import {useFetch} from "@common/hooks/http.ts";
import { ROLE_TABLE_COLUMNS } from "../../const/role/const.tsx";
import TableBtnWithPermission from "@common/components/aoplatform/TableBtnWithPermission.tsx";
import { PERMISSION_DEFINITION } from "@common/const/permissions.ts";
import { useGlobalContext } from "@common/contexts/GlobalStateContext.tsx";
import { checkAccess } from "@common/utils/permission.ts";
import { useNavigate } from "react-router-dom";
import { RoleTableListItem } from "@core/const/role/type.ts";
import InsidePage from "@common/components/aoplatform/InsidePage.tsx";


const RoleList = ()=>{
    const { modal,message } = App.useApp()
    const { setBreadcrumb } = useBreadcrumb()
    const {fetchData} = useFetch()
    const pageListRef = useRef<ActionType>(null);
    const {accessData} = useGlobalContext()
    const navigateTo = useNavigate()

    const operation:(type:string)=>ProColumns<RoleTableListItem>[] =(type:string)=>[
        // TODO 开源版隐藏操作
        {
            title: '操作',
            key: 'option',
            width: 93,
            fixed:'right',
            valueType: 'option',
            render: (_: React.ReactNode, entity: RoleTableListItem) => [
                <TableBtnWithPermission  access={`system.organization.role.${type}.view`} key="view" onClick={()=>{navigateTo(`/role/${type}/config/${entity.id}`)}} btnTitle="查看"/>,
                // <TableBtnWithPermission  access={`system.organization.role.${type}.edit`} key="edit" onClick={()=>{navigateTo(`/role/${type}/config/${entity.id}`)}} btnTitle="编辑"/>,
                // <Divider type="vertical" className="mx-0"  key="div1" />,
                // <TableBtnWithPermission  access={`system.organization.role.${type}.delete`} key="delete" onClick={()=>{openModal(type as 'system'|'team','delete',entity)}} btnTitle="删除"/>,
            ],
        }
    ]

    const getRoleList = (group:'team'|'system')=>{
        return fetchData<BasicResponse<{roles:RoleTableListItem[]}>>(`${group}/roles`,{method:'GET'}).then(response=>{
            const {code,data,msg} = response
                if(code === STATUS_CODE.SUCCESS){
                return  {data:data.roles, success: true}
            }else{
                message.error(msg || '操作失败')
                return {data:[], success:false}
            }
        }).catch(() => {
            return {data:[], success:false}
        })
    }

    const deleteRole = (entity:RoleTableListItem)=>{
        return new Promise((resolve, reject)=>{
            fetchData<BasicResponse<null>>(`manage/role`,{method:'DELETE',eoParams:{id:entity.id}}).then(response=>{
                const {code,msg} = response
                if(code === STATUS_CODE.SUCCESS){
                    message.success(msg || '操作成功！')
                    resolve(true)
                }else{
                    message.error(msg || '操作失败')
                    reject(msg || '操作失败')
                }
            }).catch((errorInfo)=> reject(errorInfo))
        })
    }

    const manualReloadTable = () => {
        pageListRef.current?.reload()
    };

    const isActionAllowed = (accessType:'system'|'team', type:'add'|'edit'|'delete') => {
        
        const permission = `system.organization.role.${accessType}.${type}` as keyof typeof PERMISSION_DEFINITION[0] ;
        
        return !checkAccess(permission, accessData);
        };

    const openModal = (accessType:'system'|'team', type:'delete',entity?:RoleTableListItem)=>{
        let title:string = ''
        let content:string|React.ReactNode = ''
        switch (type){
            case 'delete':
                title='删除'
                content='该数据删除后将无法找回，请确认是否删除？'
                break;
        }

        modal.confirm({
            title,
            content,
            onOk:()=>{
                switch (type){
                    case 'delete':
                        return deleteRole(entity!).then((res)=>{if(res === true) manualReloadTable()})
                }
            },
            width:600,
            okText:'确认',
            okButtonProps:{
                disabled:isActionAllowed(accessType, type)
            },
            cancelText:'取消',
            closable:true,
            icon:<></>,
        })
    }

    useEffect(() => {
        setBreadcrumb([
            {
                title: '角色'}])
    }, []);

    return (<>
        <InsidePage 
            className="pb-PAGE_INSIDE_B overflow-y-auto"
            pageTitle='角色' 
            description="设置角色的权限范围。"
            showBorder={false}
            scrollPage={false}
            >
            <div className="pr-PAGE_INSIDE_X">
                <h3 className="mt-0">系统级别角色</h3>
                    <PageList
                        id="global_role"
                        tableClass="role_table  mb-btnrbase"
                        ref={pageListRef}
                        columns={[...ROLE_TABLE_COLUMNS as ProColumns<RoleTableListItem, "text">[], ...operation('system')]}
                        request={()=>getRoleList('system')}
                        addNewBtnTitle="添加角色"
                        showPagination={false}
                        onAddNewBtnClick={() => {
                            navigateTo(`/role/system/config`)
                        }}
                        noScroll={true}
                        addNewBtnAccess="system.organization.role.system.add"
                        onRowClick={(row:RoleTableListItem)=>  navigateTo(`/role/system/config/${row.id}`)}
                        tableClickAccess="system.organization.role.system.edit"
                    />
                <h3 className=" pt-btnbase ">团队级别角色</h3>
                <PageList
                    id="global_role"
                    ref={pageListRef}
                    tableClass="role_table "
                    columns={[...ROLE_TABLE_COLUMNS as ProColumns<RoleTableListItem, "text">[], ...operation('team')]}
                    request={()=>getRoleList('team')}
                    showPagination={false}
                    addNewBtnTitle="添加角色"
                    onAddNewBtnClick={() => {
                        navigateTo(`/role/team/config`)
                    }}
                    noScroll={true}
                    addNewBtnAccess="system.organization.role.team.add"
                    onRowClick={(row:RoleTableListItem)=>  navigateTo(`/role/team/config/${row.id}`)}
                    tableClickAccess="system.organization.role.team.edit"
                />
                </div>
        </InsidePage>
    </>)
}
export default RoleList;