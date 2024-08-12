import PageList from "@common/components/aoplatform/PageList.tsx";
import  {forwardRef, useEffect, useImperativeHandle, useRef, useState} from "react";
import {  useOutletContext, useParams} from "react-router-dom";
import {RouterParams} from "@core/components/aoplatform/RenderRoutes.tsx";
import {ActionType, ProColumns } from "@ant-design/pro-components";
import {useBreadcrumb} from "@common/contexts/BreadcrumbContext.tsx";
import {Alert, App, Button, Select, Tree, TreeProps} from "antd";
import {DataNode} from "antd/es/tree";
import {FolderOpenOutlined, FolderOutlined} from "@ant-design/icons";
import {MemberDropdownModal} from "./MemberDropdownModal.tsx";
import {BasicResponse, STATUS_CODE} from "@common/const/const.ts";
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

const AddToDepartment = forwardRef<AddToDepartmentHandle,AddToDepartmentProps>((props,ref)=>{
    const {selectedUserIds} = props
    const [selectedKeys, setSelectedKeys] = useState<string[]>([])
    const [treeData,setTreeData] = useState<DataNode[]>()
    const { message } = App.useApp()
    const [expandedKeys, setExpandedKeys] = useState<string[]>([])
    const {fetchData} = useFetch()
    const save:()=>Promise<boolean | string> =  ()=>{
        return new Promise((resolve, reject)=>{
                fetchData<BasicResponse<null>>('user/department/member',{method:'POST',eoBody:({userIds:selectedUserIds,departmentIds:selectedKeys}),eoTransformKeys:['departmentIds','userIds']}).then(response=>{
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
                message.error(msg || '操作失败')
                return {data:[], success:false}
            }
        })
    }


    const onCheck: TreeProps['onCheck'] = (checkedKeys:string[]) => {
        setSelectedKeys(checkedKeys.checked)
    };

    useEffect(()=>{
        getDepartmentList()

    },[])

    return (
        <div>
            <Alert className="my-btnybase" message="未激活、已禁用的成员无法加入到部门" type="info" />
            <p className="font-bold leading-[24px]">请选择成员需要新加入的部门<span className="text-status_fail">*</span></p>
            <div className="border-[1px] border-solid border-BORDER min-h-[200px]">
                <Tree
                    checkable
                    icon={(e:{expanded:boolean})=>(e.expanded? <FolderOpenOutlined /> : <FolderOutlined />)}
                    showIcon={true}
                    checkStrictly={true}
                    selectable={false}
                    onCheck={onCheck}
                    onExpand={(expandedKeys:string[])=>{setExpandedKeys(expandedKeys)}}
                    treeData={treeData}
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
    const {accessData} = useGlobalContext()
    const [columns,setColumns] = useState<ProColumns<MemberTableListItem>[]>([])

    const operation:ProColumns<MemberTableListItem>[] =[
        {
            title: '操作',
            key: 'option',
            width: 62,
            fixed:'right',
            valueType: 'option',
            render: (_: React.ReactNode, entity: MemberTableListItem) => [
                <TableBtnWithPermission  access="system.organization.role.system.edit" key="editMember" onClick={()=>{openModal('editMember',entity)}} btnTitle="编辑"/>,
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
                message.error(msg || '操作失败')
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
                    message.success(msg || '操作成功！')
                    resolve(true)
                }else{
                    message.error(msg || '操作失败')
                    reject(msg || '操作失败')
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

    const openModal = (type:'addMember'|'editMember'|'removeFromDep'|'addToDep'|'blocked'|'activate'|'delete',entity?:MemberTableListItem)=>{
        let title:string = ''
        let content:string|React.ReactNode = ''
        switch (type){
            case 'addMember':
                title='添加账号'
                content=<MemberDropdownModal  topGroupId={topGroupId} ref={AddMemberRef} type={type} entity={{id:memberGroupId,departmentIds:selectedDepartmentIds||[]}}  selectedMemberGroupId={memberGroupId} />
                break;
            case 'editMember':
                title='编辑成员信息'
                content=<MemberDropdownModal topGroupId={topGroupId} ref={EditMemberRef} type={type} entity={entity} />
                break;
            case 'removeFromDep':
                title='移出当前部门'
                content=<span>确定将成员<span className="text-status_fail"></span>从当前部门中移除？此操作无法恢复，确认操作？</span>
                break;
            case 'addToDep':
                title='加入部门'
                content=<AddToDepartment ref={AddToDepRef}  selectedUserIds={selectedRowKeys as string[]} />
                break;
            case 'delete':
                title='删除'
                content=<span>确定删除成员<span className="text-status_fail"></span>？此操作无法恢复，确认操作？</span>
                break;
            case 'blocked':
                title='禁用成员'
                content=<span>确定禁用成员<span className="text-status_fail"></span>？此操作无法恢复，确认操作？</span>
                break;
            case 'activate':
                title='启用成员'
                content=<span>确定启用成员<span className="text-status_fail"></span>？此操作无法恢复，确认操作？</span>
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
                        //console.log('addChild')
                        return EditMemberRef.current?.save().then((res)=>{if(res === true){refreshGroup && refreshGroup();manualReloadTable()}})
                    case 'removeFromDep':
                        //console.log('addChild')
                        return handleMemberAction('removeFromDep').then((res)=>{if(res === true){refreshGroup && refreshGroup();manualReloadTable()}})
                    case 'addToDep':
                        //console.log('addToDep')
                        return AddToDepRef.current?.save().then((res)=>{if(res === true) {refreshGroup && refreshGroup();manualReloadTable()}})
                    case 'activate':
                        return handleMemberAction('activate').then((res)=>{if(res === true){refreshGroup && refreshGroup();manualReloadTable()}})
                    case 'blocked':
                        return handleMemberAction('blocked').then((res)=>{if(res === true){refreshGroup && refreshGroup();manualReloadTable()}})
                    case 'delete':
                        return handleMemberAction('delete').then((res)=>{if(res === true){refreshGroup && refreshGroup();manualReloadTable()}})
                }
            },
            width:600,
            okText:'确认',
            okButtonProps:{
                disabled : isActionAllowed(type)
            },
            cancelText:'取消',
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
        setBreadcrumb([{ title: '成员与部门'}])
        getDepartmentList()
    },[])

    const getDepartmentList = async ()=>{
        setDepartmentValueEnum([])
        const {code,data,msg}  = await fetchData<BasicResponse<{ department: DepartmentListItem }>>('simple/departments',{method:'GET'})
        if(code === STATUS_CODE.SUCCESS){
            const tmpValueEnum:ColumnFilterItem[]   = [{text:data.department.name, value:data.department.id,children:handleDepartmentListToFilter(data.department.children)}]
            setDepartmentValueEnum(tmpValueEnum)
        }else{
            message.error(msg || '操作失败')
        }
    }
    
    const changeMemberInfo = (value:string[],entity:MemberTableListItem )=>{
        //console.log(value)
        return new Promise((resolve, reject) => {
            fetchData<BasicResponse<null>>(`account/role`, {method: 'PUT',eoBody:({roles:value, users:[entity.id]})}).then(response => {
                const {code, msg} = response
                if (code === STATUS_CODE.SUCCESS) {
                    message.success(msg || '操作成功！')
                    resolve(true)
                } else {
                    message.error(msg || '操作失败')
                    reject(msg || '操作失败')
                }
            }).catch((errorInfo)=> reject(errorInfo))
        })
    }

    const getRoleList = ()=>{
        fetchData<BasicResponse<{roles:Array<{id:string,name:string}>}>>('simple/roles', {method: 'GET', eoParams: {group:'system'}}).then(response => {
            const {code, data,msg} = response
            if (code === STATUS_CODE.SUCCESS) {
                const newCol = [...MEMBER_TABLE_COLUMNS]
                for(const col of newCol){
                    if(col.dataIndex === 'roles'){
                        col.render = (_,entity)=>(
                            <WithPermission access="system.organization.member.edit">
                                <Select
                                    className="w-full"
                                    mode="multiple"
                                    value={entity.roles?.map((x:EntityItem)=>x.id)}
                                    options={data.roles?.map((x:{id:string,name:string})=>({label:x.name, value:x.id}))}
                                    onChange={(value)=>{
                                        changeMemberInfo(value,entity ).then((res)=>{
                                            if(res) manualReloadTable()
                                        })
                                    }}
                                />
                            </WithPermission>
                        )
                        col.filters = data.roles?.map((x:{id:string,name:string})=>({text:x.name, value:x.id}))
                        col.onFilter = (value: unknown, record:MemberTableListItem) =>{
                            return record.roles ? record.roles?.map((x)=>x.id).indexOf(value as string) !== -1 : false;}
                    }
                }
                setColumns(newCol)
                return
            } else {
                message.error(msg || '操作失败')
            }
        })
    }

    return (
        <>
            <PageList
            id="global_member"
            ref={pageListRef}
            columns={[...columns, ...operation]}
            request={()=>getMemberList()}
            addNewBtnTitle={(!memberGroupId ||['unknown','disable'].indexOf(memberGroupId?.toString()) === -1)?"添加账号" : ""}
            searchPlaceholder="输入用户名、邮箱查找成员"
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
                memberGroupId &&<WithPermission key="removeFromDepPermission" access="system.organization.member.edit"><Button className="mr-btnbase" disabled={selectedRowKeys.length === 0} key="removeFromDep" onClick={()=>openModal('removeFromDep')}>移出当前部门</Button></WithPermission>,
                memberGroupId &&<WithPermission key="addToDepPermission" access="system.organization.member.edit"><Button className="mr-btnbase" disabled={selectedRowKeys.length === 0} key="addToDep" onClick={()=>openModal('addToDep')}>加入部门</Button></WithPermission>,
                memberGroupId !== 'disable' &&<WithPermission key="blockedPermission" access="system.organization.member.block"><Button className="mr-btnbase" disabled={selectedRowKeys.length === 0 || memberGroupId === 'unknown'} key="blocked" onClick={()=>openModal('blocked')}>禁用成员</Button></WithPermission>,
                <WithPermission key="activatePermission" access="system.organization.member.block"><Button className="mr-btnbase" disabled={selectedRowKeys.length === 0} key="activate" onClick={()=>openModal('activate')}>启用成员</Button></WithPermission>,
            <WithPermission key="deletePermission" access="system.organization.member.delete"><Button className="mr-btnbase" disabled={selectedRowKeys.length === 0} key="delete" onClick={()=>openModal('delete')}>删除成员</Button></WithPermission>,
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