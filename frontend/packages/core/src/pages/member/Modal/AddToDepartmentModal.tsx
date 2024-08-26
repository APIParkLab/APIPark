import { FolderOpenOutlined, FolderOutlined } from "@ant-design/icons"
import { App, TreeProps, Alert, Tree } from "antd"
import { forwardRef, useState, useImperativeHandle, useEffect } from "react"
import { BasicResponse, RESPONSE_TIPS, STATUS_CODE } from "@common/const/const"
import { AddToDepartmentHandle, AddToDepartmentProps, DepartmentListItem } from "../../../const/member/type"
import { useFetch } from "@common/hooks/http"
import {v4 as uuidv4} from 'uuid'
import { $t } from "@common/locales"

const AddToDepartmentModal = forwardRef<AddToDepartmentHandle,AddToDepartmentProps>((props,ref)=>{
    const {selectedUserIds} = props
    const [selectedKeys, setSelectedKeys] = useState<string[]>([])
    const [treeData,setTreeData] = useState<unknown[]>()
    const { message } = App.useApp()
    const [expandedKeys, setExpandedKeys] = useState<string[]>([])
    const {fetchData} = useFetch()
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
                    treeData={treeData}
                    selectedKeys={[selectedKeys]}
                    expandedKeys={expandedKeys}
                    fieldNames={{title:$t('name'),key:'id',children:'children'}}
                />
            </div>
        </div>)
})

export default AddToDepartmentModal