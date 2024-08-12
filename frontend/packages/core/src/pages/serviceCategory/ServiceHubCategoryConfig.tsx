import {App, Form, Input} from "antd";
import  {forwardRef, useEffect, useImperativeHandle} from "react";
import {BasicResponse, STATUS_CODE} from "@common/const/const.ts";
import {useFetch} from "@common/hooks/http.ts";
import { ServiceHubCategoryConfigHandle, ServiceHubCategoryConfigFieldType, ServiceHubCategoryConfigProps } from "@market/const/serviceHub/type.ts"
import WithPermission from "@common/components/aoplatform/WithPermission";

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
                reject('类型错误')
                return
            }
            form.validateFields().then((value)=>{
                fetchData<BasicResponse<null>>(url,{method,eoBody:(value), eoParams:{ ...(type === 'renameCate' ? {catalogue:value.id} :undefined)}}).then(response=>{
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

        switch(type){
            case 'addCate':
                //console.log(entity)
                form.setFieldsValue({})
                break
            case 'addChildCate':
                form.setFieldsValue({parent:entity!.id})
                break
            case 'renameCate':
                //console.log(entity)
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
            // labelCol={{ span: 5 }}
            // wrapperCol={{ span: 19}}
            autoComplete="off"
        >

            {type === 'renameCate' &&
                <Form.Item<ServiceHubCategoryConfigFieldType>
                    label="ID"
                    name="id"
                    hidden
                    rules={[{ required: true, message: '必填项',whitespace:true  }]}
                >
                    <Input className="w-INPUT_NORMAL" placeholder="ID"/>
                </Form.Item>
            }
            {(type === 'addCate' || type === 'renameCate') &&
                <Form.Item<ServiceHubCategoryConfigFieldType>
                    label="分类名称"
                    name="name"
                    rules={[{ required: true, message: '必填项' ,whitespace:true }]}
                >
                    <Input className="w-INPUT_NORMAL" placeholder="请输入分类名称"/>
                </Form.Item>}

            {type === 'addChildCate' &&<>
                <Form.Item<ServiceHubCategoryConfigFieldType>
                    label="父分类 ID"
                    name="parent"
                    hidden
                    rules={[{ required: true, message: '必填项',whitespace:true  }]}
                >
                    <Input className="w-INPUT_NORMAL" placeholder="父分类 ID"/>
                </Form.Item>

                <Form.Item<ServiceHubCategoryConfigFieldType>
                    label="子分类名称"
                    name="name"
                    rules={[{ required: true, message: '必填项' ,whitespace:true }]}
                >
                    <Input className="w-INPUT_NORMAL" placeholder="请输入子分类名称"/>
                </Form.Item>
            </>
            }
        </Form>
     </WithPermission>
)
})