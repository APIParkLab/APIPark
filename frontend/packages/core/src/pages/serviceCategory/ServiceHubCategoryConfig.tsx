import {App, Form, Input} from "antd";
import  {forwardRef, useEffect, useImperativeHandle} from "react";
import {BasicResponse, PLACEHOLDER, RESPONSE_TIPS, STATUS_CODE, VALIDATE_MESSAGE} from "@common/const/const.tsx";
import {useFetch} from "@common/hooks/http.ts";
import { ServiceHubCategoryConfigHandle, ServiceHubCategoryConfigFieldType, ServiceHubCategoryConfigProps } from "@market/const/serviceHub/type.ts"
import WithPermission from "@common/components/aoplatform/WithPermission";
import { $t } from "@common/locales";

export const ServiceHubCategoryConfig = forwardRef<ServiceHubCategoryConfigHandle,ServiceHubCategoryConfigProps>((props,ref)=>{
    const { message } = App.useApp()
    const [form] = Form.useForm();
    const {type,entity} = props
    const {fetchData} = useFetch()

    const save:()=>Promise<boolean | string> =  ()=>{
        const url:string = 'catalogue'
        let method:string
        switch (type){
            case 'addCate':
            case 'addChildCate':
                method = 'POST'
                break;
            case 'renameCate':
                method = 'PUT'
                break
        }
        return new Promise((resolve, reject)=>{
            if(!url || !method){
                reject(RESPONSE_TIPS.error)
                return
            }
            form.validateFields().then((value)=>{
                fetchData<BasicResponse<null>>(url,{method,eoBody:(value), eoParams:{ ...(type === 'renameCate' ? {catalogue:value.id} :undefined)}}).then(response=>{
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

        switch(type){
            case 'addCate':
                form.setFieldsValue({})
                break
            case 'addChildCate':
                form.setFieldsValue({parent:entity!.id})
                break
            case 'renameCate':
                form.setFieldsValue(entity)
                break
        }

    }, []);


    return (
    <WithPermission access={type === 'addCate'? 'system.api_market.service_classification.add': 'system.api_market.service_classification.edit'}>
        <Form
            layout='vertical'
            scrollToFirstError
            labelAlign='left'
            form={form}
            className="mx-auto "
            name="serviceHubCategoryConfig"
            autoComplete="off"
        >

            {type === 'renameCate' &&
                <Form.Item<ServiceHubCategoryConfigFieldType>
                    label={$t("ID")}
                    name="id"
                    hidden
                    rules={[{ required: true, message: VALIDATE_MESSAGE.required,whitespace:true  }]}
                >
                    <Input className="w-INPUT_NORMAL" placeholder={PLACEHOLDER.input}/>
                </Form.Item>
            }
            {(type === 'addCate' || type === 'renameCate') &&
                <Form.Item<ServiceHubCategoryConfigFieldType>
                    label={$t("分类名称")}
                    name="name"
                    rules={[{ required: true, message: VALIDATE_MESSAGE.required ,whitespace:true }]}
                >
                    <Input className="w-INPUT_NORMAL" placeholder={PLACEHOLDER.input}/>
                </Form.Item>}

            {type === 'addChildCate' &&<>
                <Form.Item<ServiceHubCategoryConfigFieldType>
                    label={$t("父分类 ID")}
                    name="parent"
                    hidden
                    rules={[{ required: true, message: VALIDATE_MESSAGE.required,whitespace:true  }]}
                >
                    <Input className="w-INPUT_NORMAL" placeholder={PLACEHOLDER.input}/>
                </Form.Item>

                <Form.Item<ServiceHubCategoryConfigFieldType>
                    label={$t("子分类名称")}
                    name="name"
                    rules={[{ required: true, message: VALIDATE_MESSAGE.required ,whitespace:true }]}
                >
                    <Input className="w-INPUT_NORMAL" placeholder={PLACEHOLDER.input}/>
                </Form.Item>
            </>
            }
        </Form>
     </WithPermission>
)
})