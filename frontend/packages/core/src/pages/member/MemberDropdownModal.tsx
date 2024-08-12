import {App, Form, Input, TreeSelect} from "antd";
import {forwardRef, useEffect, useImperativeHandle, useState} from "react";
import {BasicResponse, STATUS_CODE} from "@common/const/const.ts";
import {useFetch} from "@common/hooks/http.ts";
import { MemberDropdownModalHandle, MemberDropdownModalProps, DepartmentListItem, MemberDropdownModalFieldType, MemberTableListItem } from "../../const/member/type.ts";
import WithPermission from "@common/components/aoplatform/WithPermission.tsx";

export const MemberDropdownModal = forwardRef<MemberDropdownModalHandle,MemberDropdownModalProps>((props,ref)=>{
    const { message} = App.useApp()
    const [form] = Form.useForm();
    const {type,entity,selectedMemberGroupId} = props
    const {fetchData} = useFetch()
    const [departmentList, setDepartmentList] = useState<DepartmentListItem[]>([])

    const save:()=>Promise<boolean | string> =  ()=>{
        let url:string
        let method:string
        switch (type){
            case 'addDep':
            case 'addChild':
                url = 'user/department'
                method = 'POST'
                break;
            case 'rename':
                url = 'user/department'
                method = 'PUT'
                break
            case 'addMember':
                url = 'user/account'
                method = 'POST'
                break
            case 'editMember':
                url = 'user/account'
                method = 'PUT'
                break
        }
        return new Promise((resolve, reject)=>{
            if(!url || !method){
                reject('类型错误')
                return
            }
            form.validateFields().then((value)=>{
            fetchData<BasicResponse<null>>(url,
                    {method,
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
                setDepartmentList([{...data.departments,disabled:true}])
            }else{
                message.error(msg || '操作失败')
                return {data:[], success:false}
            }
        })
    }

    useEffect(() => {
        switch(type){
            case 'addChild':
                form.setFieldsValue({parent:entity!.id})
                break
            case 'rename':
                form.setFieldsValue({id:entity!.id,name:entity!.name})
                break
            case 'addMember':
                form.setFieldsValue('-1' === selectedMemberGroupId ? {} : {departmentIds:selectedMemberGroupId})
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
            name="MemberDropdownModal"
            // labelCol={{ offset:1, span: 3 }}
            // wrapperCol={{ span: 20}}
            autoComplete="off"
        >

            {type === 'rename' &&
                <Form.Item<MemberDropdownModalFieldType>
                    label="ID"
                    name="id"
                    hidden
                    rules={[{ required: true, message: '必填项',whitespace:true  }]}
                >
                    <Input className="w-INPUT_NORMAL" placeholder="ID"/>
                </Form.Item>
            }
            {(type === 'addDep' || type === 'rename') &&
                <Form.Item<MemberDropdownModalFieldType>
                    label="部门名称"
                    name="name"
                    rules={[{ required: true, message: '必填项',whitespace:true  }]}
                >
                    <Input className="w-INPUT_NORMAL" placeholder="请输入部门名称"/>
                </Form.Item>}

            {type === 'addChild' &&<>
                <Form.Item<MemberDropdownModalFieldType>
                    label="父部门 ID"
                    name="parent"
                    hidden
                    rules={[{ required: true, message: '必填项',whitespace:true  }]}
                >
                    <Input className="w-INPUT_NORMAL" placeholder="父部门 ID"/>
                </Form.Item>

                <Form.Item<MemberDropdownModalFieldType>
                    label="子部门名称"
                    name="name"
                    rules={[{ required: true, message: '必填项',whitespace:true  }]}
                >
                    <Input className="w-INPUT_NORMAL" placeholder="请输入子部门名称"/>
                </Form.Item>
            </>
            }

            {(type === 'addMember'|| type ==='editMember') && <>
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
            </>
            }
        </Form>
    </WithPermission>)
})