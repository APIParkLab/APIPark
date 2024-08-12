import { App, Form, Input } from "antd";
import { forwardRef, useImperativeHandle, useEffect } from "react";
import WithPermission from "@common/components/aoplatform/WithPermission";
import { BasicResponse, STATUS_CODE } from "@common/const/const";
import { MemberDropdownModalHandle, MemberDropdownModalProps, MemberDropdownModalFieldType } from "../../../const/member/type";
import { useFetch } from "@common/hooks/http";

export const AddDepModal = forwardRef<MemberDropdownModalHandle,MemberDropdownModalProps>((props,ref)=>{
    const { message} = App.useApp()
    const [form] = Form.useForm();
    const {type,entity} = props
    const {fetchData} = useFetch()

    const save:()=>Promise<boolean | string> =  ()=>{
        return new Promise((resolve, reject)=>{
            form.validateFields().then((value)=>{
            fetchData<BasicResponse<null>>('user/department',
                    {method:'POST',
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

    useEffect(() => {
        type === 'addChild'&& form.setFieldsValue({parent:entity!.id})
    }, []);


    return (<WithPermission access="">
        <Form
            layout='vertical'
            scrollToFirstError
            labelAlign='left'
            form={form}
            className="mx-auto "
            name="AddDepModal"
            // labelCol={{ offset:0, span: 4 }}
            // wrapperCol={{ span: 20}}
            autoComplete="off"
        >

                {type === 'addChild'  && <Form.Item<MemberDropdownModalFieldType>
                    label="父部门 ID"
                    name="parent"
                    hidden
                    rules={[{ required: true, message: '必填项',whitespace:true  }]}
                >
                    <Input className="w-INPUT_NORMAL" placeholder="父部门 ID"/>
                </Form.Item>}

                <Form.Item<MemberDropdownModalFieldType>
                    label={`${type === 'addChild' ? '子' : ''}部门名称`}
                    name="name"
                    rules={[{ required: true, message: '必填项',whitespace:true  }]}
                >
                    <Input className="w-INPUT_NORMAL" placeholder={`请输入${type === 'addChild' ? '子' : ''}部门名称`}/>
                </Form.Item>

        </Form>
    </WithPermission>)
})