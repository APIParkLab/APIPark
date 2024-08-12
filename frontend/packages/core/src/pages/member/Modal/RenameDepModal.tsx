
import { App, Form, Input } from "antd";
import { forwardRef, useImperativeHandle, useEffect } from "react";
import WithPermission from "@common/components/aoplatform/WithPermission.tsx";
import { BasicResponse, STATUS_CODE } from "@common/const/const.ts";
import { MemberDropdownModalHandle, MemberDropdownModalProps, MemberDropdownModalFieldType } from "../../../const/member/type";
import { useFetch } from "@common/hooks/http.ts";

export const RenameDepModal = forwardRef<MemberDropdownModalHandle,MemberDropdownModalProps>((props,ref)=>{
    const { message} = App.useApp()
    const [form] = Form.useForm();
    const {entity} = props
    const {fetchData} = useFetch()

    const save:()=>Promise<boolean | string> =  ()=>{
        return new Promise((resolve, reject)=>{
            form.validateFields().then((value)=>{
            fetchData<BasicResponse<null>>('user/department',
                    {method:'PUT',
                    eoBody:({
                        ...value,
                    }),eoParams: {id:entity!.id}}).then(response=>{
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

    useEffect(() => {
        form.setFieldsValue({id:entity!.id,name:entity!.name})
    }, []);


    return (<WithPermission access="">
        <Form
            // labelAlign='left'
            form={form}
            className="mx-auto "
            name="renameDepModal"
            // labelCol={{ span: 4 }}
            // wrapperCol={{ span: 20}}
            autoComplete="off"
        >
                <Form.Item<MemberDropdownModalFieldType>
                    label="ID"
                    name="id"
                    hidden
                    rules={[{ required: true, message: '必填项',whitespace:true  }]}
                >
                    <Input className="w-INPUT_NORMAL" placeholder="ID"/>
                </Form.Item>
                <Form.Item<MemberDropdownModalFieldType>
                    label="部门名称"
                    name="name"
                    rules={[{ required: true, message: '必填项',whitespace:true  }]}
                >
                    <Input className="w-INPUT_NORMAL" placeholder="请输入部门名称"/>
                </Form.Item>
        </Form>
    </WithPermission>)
})