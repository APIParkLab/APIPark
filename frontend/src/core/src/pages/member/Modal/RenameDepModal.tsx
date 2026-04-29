
import { App, Form, Input } from "antd";
import { forwardRef, useImperativeHandle, useEffect } from "react";
import WithPermission from "@common/components/aoplatform/WithPermission.tsx";
import { BasicResponse, PLACEHOLDER, RESPONSE_TIPS, STATUS_CODE, VALIDATE_MESSAGE } from "@common/const/const.tsx";
import { MemberDropdownModalHandle, MemberDropdownModalProps, MemberDropdownModalFieldType } from "../../../const/member/type";
import { useFetch } from "@common/hooks/http.ts";
import { $t } from "@common/locales";

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
                        message.success(msg || $t(RESPONSE_TIPS.success))
                        resolve(true)
                    }else{
                        message.error(msg || $t(RESPONSE_TIPS.error))
                        reject(msg || $t(RESPONSE_TIPS.error))
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
            form={form}
            className="mx-auto "
            name="renameDepModal"
            autoComplete="off"
        >
                <Form.Item<MemberDropdownModalFieldType>
                    label={$t("ID")}
                    name="id"
                    hidden
                    rules={[{ required: true,whitespace:true  }]}
                >
                    <Input className="w-INPUT_NORMAL" placeholder="ID"/>
                </Form.Item>
                <Form.Item<MemberDropdownModalFieldType>
                    label={$t("部门名称")}
                    name="name"
                    rules={[{ required: true,whitespace:true  }]}
                >
                    <Input className="w-INPUT_NORMAL" placeholder={$t(PLACEHOLDER.input)}/>
                </Form.Item>
        </Form>
    </WithPermission>)
})