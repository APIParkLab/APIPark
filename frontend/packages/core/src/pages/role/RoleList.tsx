import { App} from "antd";
import PageList, { PageProColumns } from "@common/components/aoplatform/PageList.tsx";
import  { useEffect, useMemo, useRef,} from "react";
import {ActionType} from "@ant-design/pro-components";
import {useBreadcrumb} from "@common/contexts/BreadcrumbContext.tsx";
import {BasicResponse, COLUMNS_TITLE, DELETE_TIPS, RESPONSE_TIPS, STATUS_CODE} from "@common/const/const.tsx";
import {useFetch} from "@common/hooks/http.ts";
import { ROLE_TABLE_COLUMNS } from "../../const/role/const.tsx";
import TableBtnWithPermission from "@common/components/aoplatform/TableBtnWithPermission.tsx";
import { PERMISSION_DEFINITION } from "@common/const/permissions.ts";
import { useGlobalContext } from "@common/contexts/GlobalStateContext.tsx";
import { checkAccess } from "@common/utils/permission.ts";
import { useNavigate } from "react-router-dom";
import { RoleTableListItem } from "@core/const/role/type.ts";
import InsidePage from "@common/components/aoplatform/InsidePage.tsx";
import { $t } from "@common/locales/index.ts";


const RoleList = ()=>{
    const { modal,message } = App.useApp()
    const { setBreadcrumb } = useBreadcrumb()
    const {fetchData} = useFetch()
    const pageListRef = useRef<ActionType>(null);
    const {accessData,state} = useGlobalContext()
    const navigateTo = useNavigate()

    const operation:(type:string)=>PageProColumns<RoleTableListItem>[] =(type:string)=>[
        // TODO 开源版隐藏操作
        {
            title: COLUMNS_TITLE.operate,
            key: 'option',
            btnNums:1,
            fixed:'right',
            valueType: 'option',
            render: (_: React.ReactNode, entity: RoleTableListItem) => [
                <TableBtnWithPermission  access={`system.organization.role.${type}.view`} key="view" btnType="view" onClick={()=>{navigateTo(`/role/${type}/config/${entity.id}`)}} btnTitle="查看"/>,
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
                return  {data:data.roles?.map((x:RoleTableListItem)=>({...x,name:(x.name)})), success: true}
            }else{
                message.error(msg || $t(RESPONSE_TIPS.error))
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
                    message.success(msg || $t(RESPONSE_TIPS.success))
                    resolve(true)
                }else{
                    message.error(msg || $t(RESPONSE_TIPS.error))
                    reject(msg || $t(RESPONSE_TIPS.error))
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
                title=$t('删除')
                content=$t(DELETE_TIPS.default)
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
            okText:$t('确认'),
            okButtonProps:{
                disabled:isActionAllowed(accessType, type)
            },
            cancelText:$t('取消'),
            closable:true,
            icon:<></>,
        })
    }

    useEffect(() => {
        setBreadcrumb([
            {
                title: $t('角色')}])
    }, []);

    const columns = useMemo(()=>ROLE_TABLE_COLUMNS.map((x)=>({...x, title:typeof x.title  === 'string' ? $t(x.title as string) : x.title})),[state.language])

    return (<>
        <InsidePage 
            className="pb-PAGE_INSIDE_B overflow-y-auto"
            pageTitle={$t('角色')} 
            description={$t("设置角色的权限范围。")}
            showBorder={false}
            scrollPage={true}
            >
            <div className="pr-PAGE_INSIDE_X overflow-y-scroll h-full">
                <div>
                <h3 className="mt-0">{$t('系统级别角色')}</h3>
                    <PageList
                        id="global_role"
                        tableClass="role_table  mb-btnrbase"
                        ref={pageListRef}
                        columns={[...columns as PageProColumns<RoleTableListItem, "text">[], ...operation('system')]}
                        request={()=>getRoleList('system')}
                        addNewBtnTitle={$t("添加角色")}
                        showPagination={false}
                        onAddNewBtnClick={() => {
                            navigateTo(`/role/system/config`)
                        }}
                        noScroll={true}
                        addNewBtnAccess="system.organization.role.system.add"
                        onRowClick={(row:RoleTableListItem)=>  navigateTo(`/role/system/config/${row.id}`)}
                        tableClickAccess="system.organization.role.system.edit"
                    />
                    </div>
                    <div>
                <h3 className=" pt-btnbase ">{$t('团队级别角色')}</h3>
                <PageList
                    id="global_role"
                    ref={pageListRef}
                    tableClass="role_table "
                    columns={[...columns as PageProColumns<RoleTableListItem, "text">[], ...operation('team')]}
                    request={()=>getRoleList('team')}
                    showPagination={false}
                    addNewBtnTitle={$t("添加角色")}
                    onAddNewBtnClick={() => {
                        navigateTo(`/role/team/config`)
                    }}
                    noScroll={true}
                    addNewBtnAccess="system.organization.role.team.add"
                    onRowClick={(row:RoleTableListItem)=>  navigateTo(`/role/team/config/${row.id}`)}
                    tableClickAccess="system.organization.role.team.edit"
                />
                </div>
                </div>
        </InsidePage>
    </>)
}
export default RoleList;