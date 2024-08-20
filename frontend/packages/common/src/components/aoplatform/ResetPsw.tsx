import { Form, Input} from "antd";
import {forwardRef, useEffect, useImperativeHandle} from "react";
import WithPermission from "@common/components/aoplatform/WithPermission.tsx";
import { UserInfoType } from "@common/const/type.ts";

type FieldType = {
    userName:string
    old:string
    password:string
    confirm:string
}
type ResetPswProps = {
    entity?:UserInfoType
}

export type ResetPswHandle = {
    save:()=>Promise<boolean|string>
}

export const ResetPsw = forwardRef<ResetPswHandle,ResetPswProps>((props,ref)=>{
    const [form] = Form.useForm();

    const save:()=>Promise<boolean | string> =  ()=>{
        return new Promise((resolve)=>{
            // form.validateFields().then((value)=>{
            //     fetchData<BasicResponse<null>>(url,{method,eoBody:(value), eoTransformKeys:['departmentIds']}).then(response=>{
            //         const {code,msg} = response
            //         if(code === STATUS_CODE.SUCCESS){
            //             message.success(msg || '操作成功！')
                        resolve(true)
            //         }else{
            //             message.error(msg || '操作失败')
            //             reject(msg || '操作失败')
            //         }
            //     })
            // }).catch((errorInfo)=> reject(errorInfo))
        })
    }

    const getPswStrength =  (value: string) => {
        const pswRegNum: RegExp = /[0-9]/
        const pswRegLowercase: RegExp = /[a-z]/
        const pswRegUppercase: RegExp = /[A-Z]/
        const pswRegSymbol: RegExp = /!@#$%^&*`~()-+=/
        let strength: number = 0
        if (pswRegNum.test(value)) {
            strength++
        }
        if (pswRegLowercase.test(value)) {
            strength++
        }
        if (pswRegUppercase.test(value)) {
            strength++
        }
        if (pswRegSymbol.test(value)) {
            strength++
        }
        return strength
    }

    useImperativeHandle(ref, ()=>({
            save
        })
    )

    useEffect(() => {
                // form.setFieldsValue({id:entity!.id})
    }, []);

    return (<WithPermission access="">
        <Form
            labelAlign='left'
            layout='vertical'
            form={form}
            scrollToFirstError
            className="mx-auto mt-mbase  ml-mbase"
            name="resetPsw"
            // labelCol={{ span: 8 }}
            // wrapperCol={{ span: 10}}
            autoComplete="off"
        >
                <Form.Item<FieldType>
                    label="账号"
                    name="userName"
                    hidden
                    rules={[{ required: true, message: '必填项',whitespace:true  }]}
                >
                    <Input className="w-INPUT_NORMAL"  placeholder="账号" disabled={true}/>
                </Form.Item>

                <Form.Item<FieldType>
                    label="旧密码"
                    name="old"
                    rules={[{ required: true, message: '必填项',whitespace:true  }]}
                >
                    <Input className="w-INPUT_NORMAL"  placeholder="请输入6-32位字符"/>
                </Form.Item>

                <Form.Item<FieldType>
                    label="新密码"
                    name="password"
                    hidden
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    rules={[{ required: true, message: '必填项',whitespace:true  }, ({ getFieldValue }) => ({
                        validator(_, value) {
                            if (!value || getPswStrength(value)>1) {
                                return Promise.resolve();
                            }
                            return Promise.reject(new Error('密码强度：弱，建议使用英文、数字、特殊字符组合'));
                        },
                    })]}
                >
                    <Input className="w-INPUT_NORMAL" placeholder="请输入6-32位字符"/>
                </Form.Item>

                <Form.Item<FieldType>
                    label="确认新密码"
                    name="confirm"
                    dependencies={['password']}
                    rules={[{ required: true, message: '必填项',whitespace:true  }, ({ getFieldValue }) => ({
                        validator(_, value) {
                            if (!value || getFieldValue('password') === value) {
                                return Promise.resolve();
                            }
                            return Promise.reject(new Error('新密码与确认新密码不一致'));
                        },
                    })]}
                >
                    <Input className="w-INPUT_NORMAL" placeholder="请输入6-32位字符"/>
                </Form.Item>

        </Form>
    </WithPermission>)
})