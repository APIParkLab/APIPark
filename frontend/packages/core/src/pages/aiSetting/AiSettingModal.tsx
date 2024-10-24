import { BasicResponse, STATUS_CODE, RESPONSE_TIPS, PLACEHOLDER } from "@common/const/const";
import { useFetch } from "@common/hooks/http";
import { $t } from "@common/locales";
import { App, Form, Select, Tag } from "antd";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { AiProviderConfig, AiProviderLlmsItems } from "./AiSettingList";
import { Codebox } from "@common/components/postcat/api/Codebox";


export type AiSettingModalContentProps = {
    entity:AiProviderConfig & {defaultLlm:string}
    readOnly:boolean
}

export type AiSettingModalContentHandle = {
    save:()=>Promise<boolean|string>
}

type AiSettingModalContentField = {
    config:string
    defaultLlm:string
}

const AiSettingModalContent = forwardRef<AiSettingModalContentHandle,AiSettingModalContentProps>((props,ref)=>{
    const [form] = Form.useForm();
    const { message } = App.useApp()
    const {entity,readOnly} = props
    const {fetchData} = useFetch()
    const [llmList, setLlmList] = useState<AiProviderLlmsItems[]>()
    const [loading, setLoading] = useState<boolean>(false)

    
    const getLlmList = ()=>{
        setLoading(true)
        fetchData<BasicResponse<{llms:AiProviderLlmsItems[]}>>(`ai/provider/llms`,{method:'GET',eoParams:{provider:entity.id}}).then(response=>{
           const {code,data,msg} = response
           if(code === STATUS_CODE.SUCCESS){
            setLlmList(data.llms)
           }else{
               message.error(msg || $t(RESPONSE_TIPS.error))
           }
        }).finally(()=>{
            setLoading(false)
        })
   }


    useEffect(() => {
        getLlmList()
        try{
            form.setFieldsValue({
                defaultLlm:entity.defaultLlm,
                config:entity!.config ? JSON.stringify(JSON.parse(entity!.config),null,2) : ''
            })
        }catch(e){
            form.setFieldsValue({
                defaultLlm:entity.defaultLlm,
                config: ''
            })
        }
    }, []);

    const save: ()=>Promise<boolean | string> = ()=>{
        return new Promise((resolve, reject)=>{
            form.validateFields().then((value)=>{ 
                fetchData<BasicResponse<null>>('ai/provider/config',{method:'PUT',eoParams:{provider:entity?.id}, eoBody:value, eoTransformKeys:['defaultLlm']}).then(response=>{
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

    return (
        <Form
                    layout='vertical'
                    labelAlign='left'
                    scrollToFirstError
                    form={form}
                    className="mx-auto  flex flex-col  h-full"
                    name="aiServiceInsideRouterModalConfig"
                    autoComplete="off"
                >

                        <Form.Item<AiSettingModalContentField>
                            label={$t("模型")}
                            name="defaultLlm"
                            rules={[{ required: true }]}
                        >
                            <Select className="w-INPUT_NORMAL" 
                                placeholder={$t(PLACEHOLDER.select)} 
                                loading={loading}
                                options={llmList?.map(x=>({
                                    value:x.id, 
                                    label:<div className="flex items-center gap-[10px]">
                                            <span>{x.id}</span>
                                            {x?.scopes?.map(s=><Tag >{s?.toLocaleUpperCase()}</Tag>)}
                                            </div>}))}
                                onChange={(e)=>{
                                    form.setFieldValue('config',llmList?.find(x=>x.id===e)?.config)
                                }}>
                            </Select>
                        </Form.Item>

                        <Form.Item<AiSettingModalContentField>
                            label={$t("参数")}
                            name="config"
                        >
                            <Codebox editorTheme="vs-dark" readOnly={readOnly}
                                width="100%" height="300px" language='json' enableToolbar={false} />
                        </Form.Item>
                    </Form>
  )
})

export default AiSettingModalContent