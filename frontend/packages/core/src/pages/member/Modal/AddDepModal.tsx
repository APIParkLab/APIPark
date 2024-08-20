import { App, Form, Input } from "antd";
import { forwardRef, useImperativeHandle, useEffect } from "react";
import WithPermission from "@common/components/aoplatform/WithPermission";
import { BasicResponse, PLACEHOLDER, RESPONSE_TIPS, STATUS_CODE, VALIDATE_MESSAGE } from "@common/const/const";
import { MemberDropdownModalHandle, MemberDropdownModalProps, MemberDropdownModalFieldType } from "../../../const/member/type";
import { useFetch } from "@common/hooks/http";
import { $t } from "@common/locales";

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
                        message.success(msg || RESPONSE_TIPS.success)
                        resolve(true)
                    }else{
                        message.error(msg || RESPONSE_TIPS.error)
                        reject(msg || RESPONSE_TIPS.error)
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
            autoComplete="off"
        >

                {type === 'addChild'  && <Form.Item<MemberDropdownModalFieldType>
                    label={$t("父部门 ID")}
                    name="parent"
                    hidden
                    rules={[{ required: true, message: VALIDATE_MESSAGE.required,whitespace:true  }]}
                >
                    <Input className="w-INPUT_NORMAL" placeholder={PLACEHOLDER.input}/>
                </Form.Item>}

                <Form.Item<MemberDropdownModalFieldType>
                    label={[type === 'addChild' ? $t('子部门名称') : $t('部门名称')]}
                    name="name"
                    rules={[{ required: true, message: VALIDATE_MESSAGE.required,whitespace:true  }]}
                >
                    <Input className="w-INPUT_NORMAL" placeholder={PLACEHOLDER.input}/>
                </Form.Item>

        </Form>
    </WithPermission>)
})