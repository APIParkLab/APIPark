import PageList, { PageProColumns } from "@common/components/aoplatform/PageList.tsx"
import {ActionType} from "@ant-design/pro-components";
import  {FC, useEffect, useMemo, useRef, useState} from "react";
import {Link, useParams} from "react-router-dom";
import {useBreadcrumb} from "@common/contexts/BreadcrumbContext.tsx";
import {App, Button, Modal, Select} from "antd";
import {BasicResponse, COLUMNS_TITLE, RESPONSE_TIPS, STATUS_CODE} from "@common/const/const.tsx";
import {useFetch} from "@common/hooks/http.ts";
import {RouterParams} from "@core/components/aoplatform/RenderRoutes.tsx";
import {EntityItem, MemberItem} from "@common/const/type.ts";
import { TeamMemberTableListItem } from "../../const/team/type.ts";
import {  TEAM_MEMBER_TABLE_COLUMNS } from "../../const/team/const.tsx";
import TableBtnWithPermission from "@common/components/aoplatform/TableBtnWithPermission.tsx";
import { checkAccess } from "@common/utils/permission.ts";
import { useGlobalContext } from "@common/contexts/GlobalStateContext.tsx";
import MemberTransfer, { TransferTableHandle } from "@common/components/aoplatform/MemberTransfer.tsx";
import { DepartmentListItem } from "../../const/member/type.ts";
import {v4 as uuidv4} from 'uuid'
import WithPermission from "@common/components/aoplatform/WithPermission.tsx";
import { $t } from "@common/locales/index.ts";

export const getDepartmentWithMember = (department:(DepartmentListItem & {type?:'department'|'member'})[],departmentMap:Map<string, (MemberItem & {type:'department'|'member'})[]>) : (DepartmentWithMemberItem | undefined)[] =>{
    return department.map((x:DepartmentListItem & {type?:'department'|'member'})=>{
        const res =  ({
            ...x,
            key:x.id,
            title:x.name,
            type: x.type || 'department',
            children:((x.type === 'member' || (!x.children||x.children.length === 0 )&& (!departmentMap.get(x.id) || departmentMap.get(x.id)!.length === 0))? undefined : [...(x.children && x.children.length > 0 ? getDepartmentWithMember(x.children,departmentMap) : []),...departmentMap.get(x.id) || []])
        });
        return res}).filter(node=>node.type === 'member' ||( node.children && node.children.length > 0))
}

export const addMemberToDepartment = (departmentMap: Map<string, (MemberItem & {type:'department'|'member'})[]>, departmentId: string, member: MemberItem) => {
    const members = departmentMap.get(departmentId) || [];
    members.push({...member, type: 'member'});
    departmentMap.set(departmentId, members);
  }

const TeamInsideMember:FC = ()=>{
    const [searchWord, setSearchWord] = useState<string>('')
    const { setBreadcrumb} = useBreadcrumb()
    const { modal,message } = App.useApp()
    const {fetchData} = useFetch()
    const {teamId} = useParams<RouterParams>();
    const addRef = useRef<TransferTableHandle<TeamMemberTableListItem>>(null)
    const pageListRef = useRef<ActionType>(null);
    const [allMemberIds, setAllMemberIds] = useState<string[]>([])
    const {accessData,state} = useGlobalContext()
    const [selectableMemberIds,setSelectableMemberIds] = useState<Set<string>>(new Set())
    const [addMemberBtnLoading, setAddMemberBtnLoading] = useState<boolean>(false)
    const [modalVisible, setModalVisible] = useState<boolean>(false)
    const [addMemberBtnDisabled, setAddMemberBtnDisabled] = useState<boolean>(true)
    const [allMemberSelectedDepartIds, setAllMemberSelectedDepartIds] = useState<string[]>([])
    const [roleList, setRoleList] = useState<EntityItem[]>([])

    const operation:PageProColumns<TeamMemberTableListItem>[] =[
        {
            title: COLUMNS_TITLE.operate,
            key: 'option',
            btnNums:1,
            fixed:'right',
            valueType: 'option',
            render: (_: React.ReactNode, entity: TeamMemberTableListItem) => [
                <TableBtnWithPermission disabled={!entity.isDelete} tooltip="暂无权限" access="team.team.member.edit" key="delete" btnType="delete" onClick={()=>{openModal('remove',entity)}} btnTitle="移出团队"/>]
        }
    ]

    const getDepartmentMemberList = () => {
        const topDepartmentId:string = uuidv4()
        return Promise.all([
          fetchData<BasicResponse<{department:DepartmentListItem}>>('simple/departments', {method:'GET'}),
          fetchData<BasicResponse<{members:MemberItem}>>('simple/member', {method:'GET', eoParams:{}, eoTransformKeys:[]})
        ]).then(([departmentResponse, memberResponse])=>{
            const departmentMap = new Map<string, (MemberItem & {type:'department'|'member'})[]>();
            memberResponse.data.members.forEach((member: MemberItem) => {
                setSelectableMemberIds((pre)=>{pre.add(member.id);return pre})
                member = {...member, title:member.name, key:member.id}
              if (member.department) {
                member.department.forEach((department: EntityItem) => {
                  addMemberToDepartment(departmentMap, department.id, member);
                });
              } else {
                addMemberToDepartment(departmentMap, '_withoutDepartment', member);
              }
            });
          
            const finalData = departmentResponse.data.department 
              ? [
                  {
                    id: topDepartmentId, 
                    key:topDepartmentId,
                    name: departmentResponse.data.department.name, 
                    title:departmentResponse.data.department.name, 
                    children: [
                      ...getDepartmentWithMember(departmentResponse.data.department.children, departmentMap),
                      ...departmentMap.get('_withoutDepartment') || []
                    ]
                  }
                ] 
              : [...departmentMap.get('_withoutDepartment') || []];
          
              
              for(const [k,v] of departmentMap){
                if(k !== '_withoutDepartment' && allMemberIds.length > 0 ){
                     // 筛选出部门内没被勾选的用户，如果不存在没勾选用户，需要将部门id放入ids中
                     if(v.filter(m => allMemberIds.indexOf(m.id) === -1).length  === 0){
                         setAllMemberSelectedDepartIds((pre)=>[...pre, k])
                     }
                }
             }
             
             if(!finalData[0].children || finalData[0].children.filter(m => allMemberIds.indexOf(m.id) === -1).length  === 0){
                 setAllMemberSelectedDepartIds((pre)=>[...pre, topDepartmentId])
             }

              return  {data:finalData, success: true}
        }).catch(()=>({data:[], success:false}))
      }
      
    const getMemberList = ()=>{
        return fetchData<BasicResponse<{members:TeamMemberTableListItem}>>('team/members',{method:'GET',eoParams:{keyword:searchWord, team:teamId},eoTransformKeys:['attach_time','is_delete']}).then(response=>{
            const {code,data,msg} = response
            if(code === STATUS_CODE.SUCCESS){
                if(!searchWord){
                    setAllMemberIds(data.members?.map((x:TeamMemberTableListItem)=>x.user.id) || [])
                }
                return  {data:data.members, success: true}
            }else{
                message.error(msg || $t(RESPONSE_TIPS.error))
                return {data:[], success:false}
            }
        }).catch(() => {
            return {data:[], success:false}
        })
    }

    const addMember = (selectableMemberIds:Set<string>)=>{
        setAddMemberBtnLoading(true)
        const keyFromModal = addRef.current?.selectedRowKeys()
        const memberKeyFromModal = keyFromModal?.filter(x => allMemberIds.indexOf(x as string) === -1 && selectableMemberIds.has(x)) || [];
        return new Promise((resolve, reject)=>{
            fetchData<BasicResponse<null>>('team/member',{method:'POST' ,eoBody:({users:memberKeyFromModal}),eoParams:{team:teamId}}).then(response=>{
            const {code,msg} = response
            if(code === STATUS_CODE.SUCCESS){
                message.success(msg || $t(RESPONSE_TIPS.success))
                manualReloadTable()
                cleanModalData()
                resolve(true)
            }else{
                message.error(msg || $t(RESPONSE_TIPS.error))
                reject(msg || $t(RESPONSE_TIPS.error))
            }
        }).catch((errorInfo)=> reject(errorInfo)).finally(()=>setAddMemberBtnLoading(false))
    })
    }


    const removeMember = (entity:TeamMemberTableListItem) =>{
        return new Promise((resolve, reject)=>{
            fetchData<BasicResponse<null>>(`team/member`,{method:'DELETE',eoParams:{team:teamId,user:entity.user.id}}).then(response=>{
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

    const cleanModalData = ()=>{
        setModalVisible(false);setAddMemberBtnDisabled(true);setAddMemberBtnLoading(false)
    }

    const openModal = async (type:'add'|'remove',entity?:TeamMemberTableListItem)=>{
        let title:string = ''
        let content:string|React.ReactNode = ''
        switch(type){
            case 'add':
                setModalVisible(true)
                setAddMemberBtnDisabled(true)
                setAddMemberBtnLoading(false)
                return
            case 'remove':
                title=$t('移除成员')
                content=<span>{$t('确定删除成员？此操作无法恢复，确认操作？')}</span>
               break
        }
        
        modal.confirm({
            title,
            content,
            onOk:()=>{
                    return  removeMember(entity!).then((res)=>{if(res === true) manualReloadTable()})
            },
            width:600,
            okText:$t('确认'),
            okButtonProps:{
                disabled: !checkAccess(`team.team.member.edit`,accessData)
            },
            cancelText:$t('取消'),
            closable:true,
            icon:<></>
        })
    }


    const manualReloadTable = () => {
        pageListRef.current?.reload()
    };

    
    const changeMemberInfo = (value:string[],entity:TeamMemberTableListItem )=>{
        //console.log(value)
        return new Promise((resolve, reject) => {
            fetchData<BasicResponse<null>>(`team/member/role`, {method: 'PUT',eoBody:({roles:value, users:[entity.user.id]}), eoParams: {team:teamId}}).then(response => {
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
        fetchData<BasicResponse<{roles:EntityItem[]}>>('simple/roles', {method: 'GET', eoParams: {group:'team'}}).then(response => {
            const {code, data,msg} = response
            if (code === STATUS_CODE.SUCCESS) {
                setRoleList(data.roles)
                return
            } else {
                message.error(msg || $t(RESPONSE_TIPS.error))
            }
        })
    }

    const translatedCol = useMemo(()=>{
        const res = TEAM_MEMBER_TABLE_COLUMNS?.map(x=>{
            if(x.dataIndex === 'roles'){
                return {
                    ...x,
                    title: typeof x.title  === 'string' ? $t(x.title as string) : x.title,
                    render: (_,entity)=>(
                        <WithPermission access="team.team.member.edit">
                            <Select
                                className="w-full"
                                mode="multiple"
                                maxTagCount="responsive"
                                value={entity.roles?.map((x:EntityItem)=>x.id)}
                                options={roleList?.map((x:{id:string,name:string})=>({label:(x.name), value:x.id}))}
                                onChange={(value)=>{
                                    changeMemberInfo(value,entity ).then((res)=>{
                                        if(res) manualReloadTable()
                                    })
                                }}
                            />
                        </WithPermission>
                    ),
                    filters:roleList?.map((x:{id:string,name:string})=>({text:x.name, value:x.id})),
                    onFilter:(value: unknown, record:TeamMemberTableListItem) =>{
                        return record.roles ? record.roles?.map((x)=>x.id).indexOf(value as string) !== -1 : false;}
                }
                }
            return({...x, title: typeof x.title  === 'string' ? $t(x.title as string) : x.title}) })
        return res
    },[ state.language,roleList])

    useEffect(() => {
        getRoleList()
        setBreadcrumb([
            {title:<Link to="/team/list">{$t('团队')}</Link>},
            {title:$t('成员')}
        ])
        manualReloadTable()
    }, [teamId]);

    const treeDisabledData = useMemo(()=>{ return [...allMemberIds,...allMemberSelectedDepartIds]},[allMemberIds,allMemberSelectedDepartIds])
    
    return (
        <>
        <PageList
            id="global_team_member"
            ref={pageListRef}
            columns = {[...translatedCol,...operation]}
            request={()=>getMemberList()}
            primaryKey="user.id"
            addNewBtnTitle={$t('添加成员')}
            className="ml-[20px] mt-[20px] "
            searchPlaceholder={$t("输入姓名查找")}
            onAddNewBtnClick={()=>{openModal('add')}}
            addNewBtnAccess="team.team.member.add"
            tableClickAccess="team.team.member.edit"
            onSearchWordChange={(e)=>{setSearchWord(e.target.value)}}
        />
            <Modal
                   title={$t("添加成员")}
                   open={modalVisible}
                   destroyOnClose={true}
                   width={900}
                   onCancel={() => cleanModalData()}
                   maskClosable={false}
                   footer={[
                       <Button key="back" onClick={() => cleanModalData()}>
                           {$t('取消')}
                       </Button>,
                       <WithPermission access="team.team.member.add"><Button
                           key="submit"
                           type="primary"
                           disabled={addMemberBtnDisabled}
                           loading={addMemberBtnLoading}
                           onClick={()=>addMember(selectableMemberIds as Set<string>)}
                       >
                           {$t('确认')}
                       </Button></WithPermission>,
                   ]}
               >
                   <MemberTransfer
                    ref={addRef}
                    primaryKey="id"
                    disabledData={treeDisabledData}
                    request={()=>getDepartmentMemberList()}
                    onSelect={(selectedData: Set<string>) => {
                        const memberKeyFromModal = Array.from(selectedData)?.filter(x => allMemberIds.indexOf(x) === -1 &&selectableMemberIds.has(x)) || [];
                        setAddMemberBtnDisabled((memberKeyFromModal.length === 0));
                    }}
                    searchPlaceholder={$t("搜索用户名、邮箱")}
                 />
               </Modal>
        </>
    )

}
export default TeamInsideMember