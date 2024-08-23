
import Tree, {DataNode} from "antd/es/tree";
import {Outlet, useNavigate, useParams } from "react-router-dom";
import  {Key, useEffect, useMemo, useRef, useState} from "react";
import {App, Button, Input } from "antd";
import {debounce} from "lodash-es";
import {DownOutlined, SearchOutlined} from "@ant-design/icons";
import TreeWithMore from "@common/components/aoplatform/TreeWithMore.tsx";
import {useFetch} from "@common/hooks/http.ts";
import {BasicResponse, RESPONSE_TIPS, STATUS_CODE} from "@common/const/const.tsx";
import { DepartmentListItem, MemberDropdownModalHandle } from "../../const/member/type.ts";
import WithPermission from "@common/components/aoplatform/WithPermission.tsx";
import { RouterParams } from "@core/components/aoplatform/RenderRoutes.tsx";
import { PERMISSION_DEFINITION } from "@common/const/permissions.ts";
import { useGlobalContext } from "@common/contexts/GlobalStateContext.tsx";
import { checkAccess } from "@common/utils/permission.ts";
import { RenameDepModal } from "./Modal/RenameDepModal.tsx";
import { AddDepModal } from "./Modal/AddDepModal.tsx";
import { EditMemberModal } from "./Modal/EditMember.tsx";
import InsidePage from "@common/components/aoplatform/InsidePage.tsx";
import { $t } from "@common/locales/index.ts";

const MemberPage = ()=>{
        const [searchWord, setSearchWord] = useState<string>('')
        const { modal,message } = App.useApp()
        // const [confirmLoading, setConfirmLoading] = useState(false);
        const navigate = useNavigate()
        const [departmentList, setDepartmentList] = useState<DepartmentListItem[]>([])
        // const [modalDepartmentList, setModalDepartmentList] = useState<DepartmentListItem[]>([])
        const {fetchData} = useFetch()
        const AddDepRef = useRef<MemberDropdownModalHandle>(null)
        const AddChildRef = useRef<MemberDropdownModalHandle>(null)
        const AddMemberRef = useRef<MemberDropdownModalHandle>(null)
        const RenameRef = useRef<MemberDropdownModalHandle>(null)
        const [selectedDepartmentIds, setSelectedDepartmentIds] = useState<string[]>()
        const [expandedKeys, setExpandedKeys] = useState<string[]>([])
        const { memberGroupId } = useParams<RouterParams>();
        const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>('-1')
        const {accessData} = useGlobalContext()
        const [refreshMemberCount, setRefreshMemberCount] = useState<number>(0)
    const onSearchWordChange = (e:string)=>{
            setSearchWord(e || '')
        }

        const deleteDepartment = (id:string)=>{
            return new Promise((resolve, reject)=>{
                fetchData<BasicResponse<null>>('user/department',{method:'DELETE',eoParams:{id}}).then(response=>{
                    const {code,msg} = response
                    if(code === STATUS_CODE.SUCCESS){
                        message.success(msg || RESPONSE_TIPS.success)
                        resolve(true)
                    }else{
                        message.error(msg || RESPONSE_TIPS.error)
                        reject(msg || RESPONSE_TIPS.error)
                    }
                }).catch((errorInfo)=> reject(errorInfo))
            })
        }

        const openModal = (type:'addDep'|'addChild'|'addMember'|'rename'|'delete',entity:DepartmentListItem)=>{
            let title:string = ''
            let content:string|React.ReactNode = ''
            switch (type){
                case 'addDep':
                    title=$t('添加部门')
                    content=<AddDepModal ref={AddDepRef} type={type} />
                    break;
                case 'addChild':
                    title=$t('添加子部门')
                    content=<AddDepModal ref={AddChildRef} type={type} entity={{id:entity.id}}  />
                    break;
                case 'addMember':
                    title=$t('添加账号')
                    content=<EditMemberModal ref={AddMemberRef} type={type} entity={{id:entity.id,departmentIds:entity.departmentIds}} selectedMemberGroupId={entity.id}/>
                    break;
                case 'rename':
                    title=$t('重命名')
                    content=<RenameDepModal  ref={RenameRef} type={type} entity={{id:entity.id,name:entity.name}} />
                    break;
                case 'delete':
                    title=$t('删除')
                    content=$t('该数据删除后将无法找回，请确认是否删除？')
                    break;
            }
            modal.confirm({
                title,
                content,
                onOk:()=>{
                    switch (type){
                        case 'addDep':
                            return AddDepRef.current?.save().then((res)=>{if(res === true)getDepartmentList()})
                        case 'addChild':
                            return AddChildRef.current?.save().then((res)=>{if(res === true)getDepartmentList()})
                        case 'addMember':
                            return AddMemberRef.current?.save().then((res)=>{if(res === true){getDepartmentList();setRefreshMemberCount(pre=>pre+1)}})
                        case 'rename':
                            return RenameRef.current?.save().then((res)=>{if(res === true)getDepartmentList()})
                        case 'delete':
                            return deleteDepartment(entity.id).then((res)=>{if(res === true) getDepartmentList()})
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

        const isActionAllowed = (type:'addDep'|'addChild'|'addMember'|'rename'|'delete') => {
            const actionToPermissionMap = {
              'addDep': 'system.organization.member.department.add',
              'addChild': 'system.organization.member.department.add',
              'addMember': 'system.organization.member.add',
              'rename': 'system.organization.member.department.edit',
              'delete': 'system.organization.member.department.delete'
            };
          
            const action = actionToPermissionMap[type] as keyof typeof PERMISSION_DEFINITION[0];
          
            return !checkAccess(action, accessData);
          };

        const dropdownMenu = (entity:DepartmentListItem) => [
            entity.id !== '-1' &&  {
                key: 'addDep',
                label: (
                    <WithPermission access="system.organization.member.department.add" key="addDepPermission"><Button key="addDep" type="text" className="border-none p-0 flex items-center bg-transparent " onClick={()=>openModal('addDep',entity)}>
                       {$t('添加部门')} 
                    </Button></WithPermission>
                ),
            },
            {
                key: 'addChild',
                label: (
                    <WithPermission access="system.organization.member.department.add" key="addChildPermission"><Button key="addChild" type="text" className=" border-none p-0 flex items-center bg-transparent " onClick={()=>openModal('addChild',entity)}>
                       {$t('添加子部门')} 
                    </Button></WithPermission>
                ),
            },
            entity.id !== '-1' && {
                key: 'addMember',
                label: (
                    <WithPermission access="system.organization.member.add" key="addMemberPermission"><Button key="addMember" type="text" className=" border-none p-0 flex items-center bg-transparent " onClick={()=>openModal('addMember',{...entity,...(entity.departmentIds ? {departmentIds:[entity.departmentIds?.[entity.departmentIds.length - 1]]}:{})})}>
                       {$t('添加账号')} 
                    </Button></WithPermission>
                ),
            },
            entity.id !== '-1' && {
                key: 'rename',
                label: (
                    <WithPermission access="system.organization.member.department.edit"  key="renamePermission"><Button type="text" key="rename" className=" border-none p-0 flex items-center bg-transparent " onClick={()=>openModal('rename',entity)}>
                       {$t('重命名')} 
                    </Button></WithPermission>
                ),
            },
            {
                key: 'delete',
                label: (
                    <WithPermission access="system.organization.member.department.delete"  key="deletePermission"><Button key="delete" type="text" className=" border-none p-0 flex items-center bg-transparent " onClick={()=>openModal('delete',entity)}>
                       {$t('删除')} 
                    </Button></WithPermission>
                ),
            },
        ]

        const treeData = useMemo(() => {
            const loop = (data: DepartmentListItem[], parentIds:string[] = []): DataNode[] =>
                data?.map((item) => {
                    const strTitle = $t(item.name) as string;
                    const index = strTitle.indexOf(searchWord);
                    const beforeStr = strTitle.substring(0, index);
                    const afterStr = strTitle.slice(index + searchWord.length);
                    const title =
                        index > -1 ? (
                            <span className='w-[calc(100%-16px)] truncate' title={`${strTitle} (${item.number ?? 0})`}>
              {beforeStr}
                                <span className="text-theme">{searchWord}</span>
                                {afterStr} <span>({item.number ?? 0})</span>
            </span>
                        ) : (
                            <span className='w-[calc(100%-16px)] truncate' title={`${strTitle} (${item.number ?? 0})`}>{strTitle}<span>({item.number ?? 0})</span></span>
                        )
                    if(!parentIds || parentIds.length === 0){
                        item.id = '-1'
                        setSelectedDepartmentId(prev => prev ?? item.id)
                        setExpandedKeys(prevData=>Array.from(new Set([...prevData,item.id])))
                    }
                    const departmentIds:string[] = [...parentIds]
                    departmentIds.push(item.id)
                    item.key = item.id
                    item.departmentIds = departmentIds
                    if (item.children) {
                        return {
                            title:<TreeWithMore  dropdownMenu={dropdownMenu(item)}>{title}</TreeWithMore>, 
                            key: item.id,
                            departmentIds:departmentIds,
                            children: loop(item.children,departmentIds) };
                    }

                    return {
                        title: ['unknown','disable'].indexOf(item.id) === -1 ? <TreeWithMore  dropdownMenu={dropdownMenu(item)}>{title}</TreeWithMore> : title,
                        key: item.id,
                        departmentIds:departmentIds,
                        isLeaf:true
                    };
                });
            return loop(departmentList);
        }, [departmentList,searchWord]);

        const getDepartmentList = ()=>{
            fetchData<BasicResponse<{departments:DepartmentListItem[]}>>('user/departments',{method:'GET'}).then(response=>{
                const {code,data,msg} = response
                if(code === STATUS_CODE.SUCCESS){
                    setDepartmentList([data.departments])
                }else{
                    message.error(msg || RESPONSE_TIPS.error)
                    return {data:[], success:false}
                }
            })
        }

        useEffect(() => {
            getDepartmentList()
        }, []);

        useEffect(()=>{
            setSelectedDepartmentId(memberGroupId || '-1')
        },[memberGroupId])

        return (
            <InsidePage 
                pageTitle={$t('成员')} 
                description={$t("设置成员和对应的角色，成员只能够看到权限范围内的功能和数据。")}
                >
                <div className="flex flex-1 h-full w-full">
                    <div className="w-[200px] border-0 border-solid border-r-[1px] border-r-BORDER">
                    <div className="px-btnbase pb-[0px]">
                        <Input className=" my-btnybase" onChange={(e) => debounce(onSearchWordChange, 100)(e.target.value)}
                            allowClear placeholder={$t("搜索部门")}
                            prefix={<SearchOutlined className="cursor-pointer"/>}/>
                            </div>
                    <div className="h-[calc(100%-52px)] overflow-auto">
                        <div  className="h-[calc(100%-30px)] overflow-y-auto pl-[5px] pr-[10px]">
                        <Tree
                        showLine
                        switcherIcon={<DownOutlined />}
                        blockNode={true}
                        treeData={treeData}
                        selectedKeys={[selectedDepartmentId]}
                        expandedKeys={expandedKeys}
                        onExpand={(expandedKeys:Key[])=>{setExpandedKeys(expandedKeys)}}
                        onSelect={(selectedKeys,selectedRow) => {
                            if(selectedKeys.length > 0 ){
                            setSelectedDepartmentIds((selectedRow.node as unknown).departmentIds || [])
                            navigate(`/member/list${selectedKeys[0] === '-1'? '' : `/${selectedKeys[0]}`}`)
                            }
                        }}
                        />
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 p-btnbase pr-PAGE_INSIDE_X overflow-x-hidden">
                        <Outlet context={{refreshMemberCount, selectedDepartmentIds,refreshGroup:()=>getDepartmentList()}}/>
                    </div>
                </div>
            </InsidePage>);
}
export default MemberPage;