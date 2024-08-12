
import {App, Form, Input} from "antd";
import  {forwardRef, useEffect, useImperativeHandle} from "react";
import {BasicResponse, STATUS_CODE} from "@common/const/const.ts";
import {useFetch} from "@common/hooks/http.ts";
import WithPermission from "@common/components/aoplatform/WithPermission.tsx";
import {v4 as uuidv4} from 'uuid'

export type OpenApiConfigFieldType = {
    id?:string
    name:string
    desc:string
};

type OpenApiConfigProps = {
    type:'add'|'edit'
    entity?:OpenApiConfigFieldType
}

export type OpenApiConfigHandle = {
    save:()=>Promise<boolean|string>
}


export const OpenApiConfig = forwardRef<OpenApiConfigHandle,OpenApiConfigProps>((props, ref) => {
    const { message } = App.useApp()
    const {type,entity} = props
    const [form] = Form.useForm();
    const {fetchData} = useFetch()
    const save:()=>Promise<boolean | string> =  ()=>{
        return new Promise((resolve, reject)=>{
            form.validateFields().then((value)=>{
                fetchData<BasicResponse<null>>('external-app',{method:type === 'add'? 'POST' : 'PUT',eoBody:(value), eoParams:type === 'add' ? {}:{id:entity!.id}}).then(response=>{
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
        if(type === 'edit' && entity){
            form.setFieldsValue(entity)
        }else{
            form.setFieldValue('id',uuidv4())
        }
    }, []);

    return  (<WithPermission access={type === 'edit' ? 'system.openapi.self.edit':'system.openapi.self.add'}>
        <Form
            layout='vertical'
            scrollToFirstError
            labelAlign='left'
            form={form}
            className="mx-auto "
            name="OpenApiConfig"
            // labelCol={{ offset:1, span: 4 }}
            // wrapperCol={{ span: 19}}
            autoComplete="off"
        >
            <Form.Item<OpenApiConfigFieldType>
                label="应用名称"
                name="name"
                rules={[{ required: true, message: '必填项',whitespace:true  }]}
            >
                <Input className="w-INPUT_NORMAL" placeholder="请输入"/>
            </Form.Item>

            <Form.Item<OpenApiConfigFieldType>
                label="应用 ID"
                name="id"
                rules={[{ required: true, message: '必填项' ,whitespace:true }]}
            >
                <Input className="w-INPUT_NORMAL" placeholder="请输入" disabled={type === 'edit'}/>
            </Form.Item>

            <Form.Item
                label="描述"
                name="desc"
            >
                <Input.TextArea className="w-INPUT_NORMAL" placeholder="请输入"/>
            </Form.Item>

        </Form>
    </WithPermission>)
})