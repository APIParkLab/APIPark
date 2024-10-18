import PageList, { PageProColumns } from "@common/components/aoplatform/PageList.tsx";
import  {forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState} from "react";
import {  useOutletContext, useParams} from "react-router-dom";
import {RouterParams} from "@core/components/aoplatform/RenderRoutes.tsx";
import {ActionType } from "@ant-design/pro-components";
import {useBreadcrumb} from "@common/contexts/BreadcrumbContext.tsx";
import {Alert, App, Button, Select, Tree, TreeProps} from "antd";
import {DataNode} from "antd/es/tree";
import {FolderOpenOutlined, FolderOutlined} from "@ant-design/icons";
import {MemberDropdownModal} from "./MemberDropdownModal.tsx";
import {BasicResponse,COLUMNS_TITLE, RESPONSE_TIPS, STATUS_CODE} from "@common/const/const.tsx";
import {useFetch} from "@common/hooks/http.ts";
import { AddToDepartmentHandle, AddToDepartmentProps, DepartmentListItem, MemberDropdownModalHandle, MemberTableListItem } from "../../const/member/type.ts";
import { MEMBER_TABLE_COLUMNS } from "../../const/member/const.tsx";
import WithPermission from "@common/components/aoplatform/WithPermission.tsx";
import {v4 as uuidv4} from 'uuid'
import { ColumnFilterItem } from "antd/es/table/interface";
import { handleDepartmentListToFilter } from "@common/utils/dataTransfer.ts";
import TableBtnWithPermission from "@common/components/aoplatform/TableBtnWithPermission.tsx";
import { useGlobalContext } from "@common/contexts/GlobalStateContext.tsx";
import { checkAccess } from "@common/utils/permission.ts";
import { PERMISSION_DEFINITION } from "@common/const/permissions.ts";
import { EntityItem } from "@common/const/type.ts";
import { $t } from "@common/locales/index.ts";
import { DefaultOptionType } from "antd/es/cascader/index";

const AddToDepartment = forwardRef<AddToDepartmentHandle,AddToDepartmentProps>((props,ref)=>{
    const {selectedUserIds} = props
    const [selectedKeys, setSelectedKeys] = useState<string[]>([])
    const [treeData,setTreeData] = useState<DataNode[]>()
    const { message } = App.useApp()
    const [expandedKeys, setExpandedKeys] = useState<string[]>([])
    const {fetchData} = useFetch()
    const { state} = useGlobalContext()
    const save:()=>Promise<boolean | string> =  ()=>{
        return new Promise((resolve, reject)=>{
                fetchData<BasicResponse<null>>('user/department/member',{method:'POST',eoBody:({userIds:selectedUserIds,departmentIds:selectedKeys}),eoTransformKeys:['departmentIds','userIds']}).then(response=>{
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

    useImperativeHandle(ref, ()=>({
            save
        })
    )

    const getDepartmentList = ()=>{
        fetchData<BasicResponse<{departments:DepartmentListItem[]}>>('user/departments',{method:'GET'}).then(response=>{
            const {code,data,msg} = response
            if(code === STATUS_CODE.SUCCESS){
                data.departments.checkable = false
                data.departments.id = uuidv4()
                const newId = uuidv4()
                setTreeData([{
                    ...data.departments,
                     checkable:false,
                      id:newId,
                    children:data.departments.children.filter((x)=>x.id !== 'unknown' && x.id !== 'disable')}])
                setExpandedKeys([newId])
            }else{
                message.error(msg || $t(RESPONSE_TIPS.error))
                return {data:[], success:false}
            }
        })
    }

    const translatedTreeData = useMemo(()=>
        treeData?.map((x:DataNode)=>({...x,
            name:$t((x as unknown as {name:string}).name),
            checkable:false,
            children:x.children?.map((y)=>({...y,checkable:false}))
        })),[state.language,treeData])


    const onCheck: TreeProps['onCheck'] = (checkedKeys:string[]) => {
        setSelectedKeys(checkedKeys.checked)
    };

    useEffect(()=>{
        getDepartmentList()

    },[])

    return (
        <div>
            <Alert className="my-btnybase" message={$t("未激活、已禁用的成员无法加入到部门")} type="info" />
            <p className="font-bold leading-[24px]">{$t('请选择成员需要新加入的部门')}<span className="text-status_fail">*</span></p>
            <div className="border-[1px] border-solid border-BORDER min-h-[200px]">
                <Tree
                    checkable
                    icon={(e:{expanded:boolean})=>(e.expanded? <FolderOpenOutlined /> : <FolderOutlined />)}
                    showIcon={true}
                    checkStrictly={true}
                    selectable={false}
                    onCheck={onCheck}
                    onExpand={(expandedKeys:string[])=>{setExpandedKeys(expandedKeys)}}
                    treeData={translatedTreeData}
                    selectedKeys={[selectedKeys]}
                    expandedKeys={expandedKeys}
                    fieldNames={{title:'name',key:'id',children:'children'}}
                />
            </div>
        </div>)
})

const MemberList = ()=>{
    const { memberGroupId }  = useParams<RouterParams>();
    const [searchWord, setSearchWord] = useState<string>('')
    const { modal,message } = App.useApp()
    // const [confirmLoading, setConfirmLoading] = useState(false);
    const [init, setInit] = useState<boolean>(true)
    const {fetchData} = useFetch()
    const [tableHttpReload, setTableHttpReload] = useState(true);
    const [tableListDataSource, setTableListDataSource] = useState<MemberTableListItem[]>([]);
    const pageListRef = useRef<ActionType>(null);
    const {topGroupId,selectedDepartmentIds, refreshGroup} = useOutletContext<{topGroupId:string, departmentList:DepartmentListItem[],selectedDepartmentIds:string[],refreshGroup:()=>void}>()
    const AddMemberRef = useRef<MemberDropdownModalHandle>(null)
    const EditMemberRef = useRef<MemberDropdownModalHandle>(null)
    const AddToDepRef = useRef<AddToDepartmentHandle>(null)
    const { setBreadcrumb } = useBreadcrumb()
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [departmentValueEnum,setDepartmentValueEnum] = useState<ColumnFilterItem[] >([])
    const {accessData,state} = useGlobalContext()
    const [roleSelectableList, setRoleSelectableList] = useState<DefaultOptionType[]>([])

    const operation:PageProColumns<MemberTableListItem>[] =[
        {
            title: COLUMNS_TITLE.operate,
            key: 'option',
            btnNums:1,
            fixed:'right',
            valueType: 'option',
            render: (_: React.ReactNode, entity: MemberTableListItem) => [
                <TableBtnWithPermission  access="system.organization.member.edit" key="edit" btnType="edit" onClick={()=>{openModal('editMember',entity)}} btnTitle="编辑"/>,
            ],
        }
    ]


    const getMemberList = ()=>{
        if(!tableHttpReload){
            setTableHttpReload(true)
            return Promise.resolve({
                data: tableListDataSource,
                success: true,
            });
        }
        return fetchData<BasicResponse<{members:MemberTableListItem}>>('user/accounts',{method:'GET',eoParams:{keyword:searchWord,department:topGroupId === memberGroupId? null : memberGroupId},eoTransformKeys:['user_group']}).then(response=>{
            const {code,data,msg} = response
            if(code === STATUS_CODE.SUCCESS){
                setTableListDataSource(data.members)
                setInit((prev)=>prev ? false : prev)
                return  {data:data.members, success: true}
            }else{
                message.error(msg || $t(RESPONSE_TIPS.error))
                return {data:[], success:false}
            }
        }).catch(() => {
            return {data:[], success:false}
        })
    }

    const handleSelectChange = (newSelectedRowKeys: React.Key[]) => {
        setSelectedRowKeys(newSelectedRowKeys);
    };

    const handleRowClick = (entity:MemberTableListItem)=>{
        if(entity.id === 'admin') return
        setSelectedRowKeys(prevData=>prevData?.indexOf(entity.id) === -1 ? [...prevData,entity.id] : prevData.filter((x)=>x !== entity.id))
    }

    const manualReloadTable = () => {
        setTableHttpReload(true); // 表格数据需要从后端接口获取
        pageListRef.current?.reload()
    };

    const handleMemberAction = (type:'removeFromDep'|'blocked'|'activate'|'delete')=>{
        let url:string
        let method:string
        let params:{[k:string]:unknown} = {}
        let body:{[k:string]:unknown} = {}
        switch(type){
            case 'removeFromDep':
                url ='user/department/member/remove'
                method = 'POST'
                params = {department:memberGroupId}
                body = {userIds:selectedRowKeys}
                break;
            case 'blocked':
                url = 'user/account/disable'
                method = 'POST'
                body = {userIds:selectedRowKeys}
                break;
            case 'activate':
                url = 'user/account/enable'
                method = 'POST'
                body = {userIds:selectedRowKeys}
                break;
            case 'delete':
                url = 'user/account'
                method = 'DELETE'
                params = {ids:JSON.stringify(selectedRowKeys)}
                body = {userIds:selectedRowKeys}
                break;
        }

        return new Promise((resolve, reject)=>{
            fetchData<BasicResponse<null>>(url,{method,eoTransformKeys:['user_ids','userIds'],eoParams:params,eoBody:(body)}).then(response=>{
                const {code,msg} = response
                if(code === STATUS_CODE.SUCCESS){
                    message.success(msg || $t(RESPONSE_TIPS.success))
                    resolve(true)
                }else{
                    message.error(msg || $t(RESPONSE_TIPS.error))
                    reject(msg || $t(RESPONSE_TIPS.error))
                }
            }).catch((errorInfo)=> reject(errorInfo))
        })}

    const isActionAllowed = (type:'addMember'|'editMember'|'removeFromDep'|'addToDep'|'blocked'|'activate'|'delete') => {
        const actionToPermissionMap = {
            'addMember': 'add',
            'editMember': 'edit',
            'removeFromDep': 'remove',
            'addToDep': 'add',
            'activate': 'block',
            'blocked': 'block',
            'delete': 'delete'
        };
        
        const action = actionToPermissionMap[type];
        const permission :keyof typeof PERMISSION_DEFINITION[0]= `system.organization.member.${action}`;
        
        return !checkAccess(permission, accessData);
    };

    const openModal = (type:'addMember'|'editMember'|'addToDep'|'delete',entity?:MemberTableListItem)=>{
        let title:string = ''
        let content:string|React.ReactNode = ''
        switch (type){
            case 'addMember':
                title=$t('添加账号')
                content=<MemberDropdownModal  topGroupId={topGroupId} ref={AddMemberRef} type={type} entity={{id:memberGroupId,departmentIds:selectedDepartmentIds||[]}}  selectedMemberGroupId={memberGroupId} />
                break;
            case 'editMember':
                title=$t('编辑成员信息')
                content=<MemberDropdownModal topGroupId={topGroupId} ref={EditMemberRef} type={type} entity={entity} />
                break;
            case 'addToDep':
                title=$t('加入部门')
                content=<AddToDepartment ref={AddToDepRef}  selectedUserIds={selectedRowKeys as string[]} />
                break;
            case 'delete':
                title=$t('删除')
                content=<span>{$t('确定删除成员？此操作无法恢复，确认操作？')}</span>
                break;
        }

        modal.confirm({
            title,
            content,
            onOk:()=>{
                switch (type){
                    case 'addMember':
                        return AddMemberRef.current?.save().then((res)=>{if(res === true) {refreshGroup && refreshGroup();manualReloadTable()}})
                    case 'editMember':
                        return EditMemberRef.current?.save().then((res)=>{if(res === true){refreshGroup && refreshGroup();manualReloadTable()}})
                    case 'addToDep':
                        return AddToDepRef.current?.save().then((res)=>{if(res === true) {refreshGroup && refreshGroup();manualReloadTable()}})
                    case 'delete':
                        return handleMemberAction('delete').then((res)=>{if(res === true){refreshGroup && refreshGroup();manualReloadTable()}})
                }
            },
            width:600,
            okText:$t('确认'),
            okButtonProps:{
                disabled : isActionAllowed(type)
            },
            cancelText:$t('取消'),
            closable:true,
            icon:<></>,
        })
    }

    useEffect(() => {
        !init && manualReloadTable()
        setSelectedRowKeys([])
    }, [memberGroupId]);

    useEffect(()=>{
        getRoleList()
        setBreadcrumb([{ title: $t('成员与部门')}])
        getDepartmentList()
    },[])

    const getDepartmentList = async ()=>{
        setDepartmentValueEnum([])
        const {code,data,msg}  = await fetchData<BasicResponse<{ department: DepartmentListItem }>>('simple/departments',{method:'GET'})
        if(code === STATUS_CODE.SUCCESS){
            const tmpValueEnum:ColumnFilterItem[]   = [{text:data.department.name, value:data.department.id,children:handleDepartmentListToFilter(data.department.children)}]
            setDepartmentValueEnum(tmpValueEnum)
        }else{
            message.error(msg || $t(RESPONSE_TIPS.error))
        }
    }
    
    const changeMemberInfo = (value:string[],entity:MemberTableListItem )=>{
        return new Promise((resolve, reject) => {
            fetchData<BasicResponse<null>>(`account/role`, {method: 'PUT',eoBody:({roles:value, users:[entity.id]})}).then(response => {
                const {code, msg} = response
                if (code === STATUS_CODE.SUCCESS) {
                    message.success(msg || $t(RESPONSE_TIPS.success))
                    resolve(true)
                } else {
                    message.error(msg || $t(RESPONSE_TIPS.error))
                    reject(msg || $t(RESPONSE_TIPS.error))
                }
            }).catch((errorInfo)=> reject(errorInfo))
        })
    }

    const getRoleList = ()=>{
        fetchData<BasicResponse<{roles:Array<{id:string,name:string}>}>>('simple/roles', {method: 'GET', eoParams: {group:'system'}}).then(response => {
            const {code, data,msg} = response
            if (code === STATUS_CODE.SUCCESS) {
                setRoleSelectableList(data.roles)
              
                return
            } else {
                message.error(msg || $t(RESPONSE_TIPS.error))
            }
        })
    }
    
    const translatedCol = useMemo(
        ()=> MEMBER_TABLE_COLUMNS.map((x)=>({...x, ...(x.dataIndex === 'roles' ? {
                    render:(_,entity)=>(
                        <WithPermission access="system.organization.member.edit">
                            <Select
                                className="w-full"
                                mode="multiple"
                                value={entity.roles?.map((x:EntityItem)=>x.id)}
                                options={roleSelectableList?.map((x:{id:string,name:string})=>({label:(x.name), value:x.id}))}
                                onChange={(value)=>{
                                    changeMemberInfo(value,entity ).then((res)=>{
                                        if(res) manualReloadTable()
                                    })
                                }}
                            />
                        </WithPermission>
                    ),
                    filters : roleSelectableList?.map((x:{id:string,name:string})=>({text:$t(x.name), value:x.id})),
                    onFilter : (value: unknown, record:MemberTableListItem) =>{
                        return record.roles ? record.roles?.map((x)=>x.id).indexOf(value as string) !== -1 : false;}
                }:{}),  ...(typeof x.title  === 'string' ? { title:$t(x.title as string) } : {}),
            ...(x.dataIndex === 'enable' ? {
                valueEnum:new Map([
                    [true,<span className="text-status_success">{$t('启用')}</span>],
                    [false,<span className="text-status_fail">{$t('禁用')}</span>],
                ])} : {})}))
        , [ state.language,roleSelectableList])

    return (
        <>
        <PageList
            id="global_member"
            ref={pageListRef}
            columns={[...translatedCol, ...operation]}
            request={()=>getMemberList()}
            addNewBtnTitle={(!memberGroupId ||['unknown','disable'].indexOf(memberGroupId?.toString()) === -1)?$t("添加账号") : ""}
            searchPlaceholder={$t("输入用户名、邮箱查找成员")}
            onAddNewBtnClick={() => {
            openModal('addMember')
            }}
            addNewBtnAccess="system.organization.member.add"
            rowSelection={{
                // selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT],
                selectedRowKeys,
                columnWidth: 40,
                onChange:handleSelectChange,
                getCheckboxProps: (record: MemberTableListItem) => ({
                disabled: record.id === 'admin', // Column configuration not to be checked
                name: record.name,
                }),
            }}
            onRowClick={handleRowClick}
            tableClickAccess="system.organization.member.edit"
            afterNewBtn={[
                selectedRowKeys.length > 0 && memberGroupId &&<WithPermission key="removeFromDepPermission" access="system.organization.member.edit"><Button className="mr-btnbase"  key="removeFromDep" onClick={()=>handleMemberAction('removeFromDep').then((res)=>{if(res === true){refreshGroup && refreshGroup();manualReloadTable()}})}>{$t('移出当前部门')}</Button></WithPermission>,
                selectedRowKeys.length > 0 &&  memberGroupId &&<WithPermission key="addToDepPermission" access="system.organization.member.edit"><Button className="mr-btnbase" key="addToDep" onClick={()=>openModal('addToDep')}>{$t('加入部门')}</Button></WithPermission>,
                selectedRowKeys.length > 0 && memberGroupId !== 'disable' &&<WithPermission key="blockedPermission" access="system.organization.member.block"><Button className="mr-btnbase"  key="blocked" onClick={()=>handleMemberAction('blocked').then((res)=>{if(res === true){refreshGroup && refreshGroup();manualReloadTable()}})}>{$t('禁用成员')}</Button></WithPermission>,
                selectedRowKeys.length > 0 && <WithPermission key="activatePermission" access="system.organization.member.block"><Button className="mr-btnbase"  key="activate" onClick={()=>handleMemberAction('activate').then((res)=>{if(res === true){refreshGroup && refreshGroup();manualReloadTable()}})}>{$t('启用成员')}</Button></WithPermission>,
                selectedRowKeys.length > 0 &&<WithPermission key="deletePermission" access="system.organization.member.delete"><Button className="mr-btnbase"  key="delete" onClick={()=>openModal('delete')}>{$t('删除成员')}</Button></WithPermission>,
            ]}
            onSearchWordChange={(e) => {
                setSearchWord(e.target.value)
            }}
            onChange={() => {
                setTableHttpReload(false)
            }}
        />
        </> )

}
export default MemberList;