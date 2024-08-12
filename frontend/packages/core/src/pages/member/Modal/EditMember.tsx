
import { App, Form, Input, TreeSelect } from "antd";
import { forwardRef, useState, useImperativeHandle, useEffect } from "react";
import WithPermission from "@common/components/aoplatform/WithPermission";
import { BasicResponse, STATUS_CODE } from "@common/const/const";
import { MemberDropdownModalHandle, MemberDropdownModalProps, DepartmentListItem, MemberTableListItem, MemberDropdownModalFieldType } from "../../../const/member/type";
import { useFetch } from "@common/hooks/http";

export const EditMemberModal = forwardRef<MemberDropdownModalHandle,MemberDropdownModalProps>((props,ref)=>{
    const { message} = App.useApp()
    const [form] = Form.useForm();
    const {type,entity,selectedMemberGroupId} = props
    const {fetchData} = useFetch()
    const [departmentList, setDepartmentList] = useState<DepartmentListItem[]>([])

    const save:()=>Promise<boolean | string> =  ()=>{
        return new Promise((resolve, reject)=>{
            form.validateFields().then((value)=>{
            fetchData<BasicResponse<null>>('user/account',
                    {method:type === 'addMember' ? 'POST' : 'PUT',
                    eoBody:({
                        ...value,
                        ...(value?.departmentIds ?{ departmentIds:Array.isArray(value?.departmentIds)? value?.departmentIds : [value?.departmentIds]}:{}),
                        ...(type !== 'addDep' && type !== 'addMember' && {eoParams: {id:entity!.id}})
                    }),eoTransformKeys:['departmentIds']}).then(response=>{
                    const {code,msg} = response
                    if(code === STATUS_CODE.SUCCESS){
                        message.success(msg || '操作成功！')
                        resolve(true)
                    }else{
                        message.error(msg || '操作失败')
                        reject(msg || '操作失败')
                    }
                }).catch((errorInfo)=> reject(errorInfo))
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
                setDepartmentList([{...data.departments,children:data.departments.children?.filter((x)=>['unknown','disable'].indexOf(x.id) === -1),disabled:true}])
            }else{
                message.error(msg || '操作失败')
                return {data:[], success:false}
            }
        })
    }

    useEffect(() => {
        switch(type){
            case 'addMember':
                form.setFieldsValue( (!selectedMemberGroupId || ['-1','disable','unknown'].indexOf(selectedMemberGroupId.toString()) !== -1 )? {} : {departmentIds:[selectedMemberGroupId]})
                break
            case 'editMember':
                form.setFieldsValue({...entity,departmentIds:(entity as MemberTableListItem )?.department?.map(x=>x.id)})
                break
        }
        getDepartmentList()

    }, []);


    return (<WithPermission access="">
        <Form
            layout='vertical'
            scrollToFirstError
            labelAlign='left'
            form={form}
            className="mx-auto "
            name="EditMember"
            // labelCol={{ offset:1, span: 3 }}
            // wrapperCol={{ span: 20}}
            autoComplete="off"
        >
                <Form.Item<MemberDropdownModalFieldType>
                    label="用户名"
                    name="name"
                    rules={[{required: true, message: '必填项',whitespace:true }]}
                >
                    <Input className="w-INPUT_NORMAL" placeholder="请输入用户名"/>
                </Form.Item>
                <Form.Item<MemberDropdownModalFieldType>
                    label="邮箱"
                    name="email"
                    rules={[{required: true, message: '必填项',whitespace:true },{type:"email",message: '不是有效邮箱地址'}]}
                >
                    <Input className="w-INPUT_NORMAL" disabled={type ==='editMember'} placeholder="请输入"/>
                </Form.Item>
                <Form.Item<MemberDropdownModalFieldType>
                    label="部门"
                    name="departmentIds"
                >
                    <TreeSelect
                            className="w-INPUT_NORMAL"
                            disabled={type ==='editMember'}
                            fieldNames={{label:'name',value:'id',children:'children'}}
                            showSearch
                            dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                            placeholder="请选择"
                            allowClear
                            treeDefaultExpandAll
                            treeData={departmentList}
                            multiple
                        />
                </Form.Item>
        </Form>
    </WithPermission>)
})