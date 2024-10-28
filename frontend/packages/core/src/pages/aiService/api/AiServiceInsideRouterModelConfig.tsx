import { Codebox } from "@common/components/postcat/api/Codebox"
import { BasicResponse, PLACEHOLDER, RESPONSE_TIPS, STATUS_CODE } from "@common/const/const"
import { useFetch } from "@common/hooks/http"
import { $t } from "@common/locales"
import { AiProviderDefaultConfig, AiProviderLlmsItems } from "@core/pages/aiSetting/AiSettingList"
import { SimpleAiProviderItem } from "@core/pages/system/SystemConfig"
import { Form, message, Select, Tag } from "antd"
import { DefaultOptionType } from "antd/es/select"
import { forwardRef, useEffect, useImperativeHandle, useState } from "react"

export type AiServiceRouterModelConfigHandle = {
    save:()=>Promise<{id:string, config:string}>
}

export type AiServiceRouterModelConfigProps = {
    entity:AiServiceRouterModelConfigField
    llmList:AiProviderLlmsItems[]
}

type AiServiceRouterModelConfigField = {
    provider:string
    id:string
    config:string
}

const AiServiceRouterModelConfig = forwardRef<AiServiceRouterModelConfigHandle, AiServiceRouterModelConfigProps>((props, ref)=>{
    const [form] = Form.useForm();
    const {entity} = props
    const [providerList, setProviderList]= useState<DefaultOptionType[]>([])
    const [llmList, setLlmList]= useState<DefaultOptionType[]>([])
    const {fetchData} = useFetch()
    useImperativeHandle(ref, ()=>({
        save:form.validateFields
        })
    )

    useEffect(()=>{
        getProviderList()
        form.setFieldsValue(entity)
    },[])

    const getProviderList = ()=>{
        setProviderList([])
        fetchData<BasicResponse<{ providers: SimpleAiProviderItem[] }>>('simple/ai/providers',{method:'GET',eoTransformKeys:[]}).then(response=>{
            const {code,data,msg} = response
            if(code === STATUS_CODE.SUCCESS){
                setProviderList(data.providers?.filter(x=>x.configured)?.map((x:SimpleAiProviderItem)=>{return {...x,
                    label: x.name, value:x.id
                }}))
            }else{
                message.error(msg || $t(RESPONSE_TIPS.error))
            }
        })
    }

    const getLlmList = (provider:string)=>{
        fetchData<BasicResponse<{llms:AiProviderLlmsItems[],provider:AiProviderDefaultConfig}>>('ai/provider/llms',{method:'GET',eoParams:{provider}, eoTransformKeys:['default_llm']}).then(response=>{
            const {code,data,msg} = response
            if(code === STATUS_CODE.SUCCESS){
                setLlmList(data.llms)
                console.log(data)
                form.setFieldsValue({
                    id:data.provider.defaultLlm,
                    config:data.llms.find(x=>x.id===data.provider.defaultLlm)?.config})
            }else{
                message.error(msg || $t(RESPONSE_TIPS.error))
            }
        }).catch((errorInfo)=> console.error(errorInfo))
    }

    const handleChangeProvider = (provider:string)=>{
        getLlmList(provider)
    }

    useEffect(()=>{
        getLlmList(entity.provider)
    },[])

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
                        <Form.Item<AiServiceRouterModelConfigField>
                            label={$t("模型供应商")}
                            name="provider"
                            rules={[{ required: true }]}
                        >
                            <Select className="w-INPUT_NORMAL" 
                                placeholder={$t(PLACEHOLDER.select)} 
                                options={providerList}
                                onChange={(e)=>{
                                    handleChangeProvider(e)
                                }}>
                            </Select>
                        </Form.Item>

                        <Form.Item<AiServiceRouterModelConfigField>
                            label={$t("模型")}
                            name="id"
                            rules={[{ required: true }]}
                        >
                            <Select className="w-INPUT_NORMAL" 
                                placeholder={$t(PLACEHOLDER.select)} 
                                options={llmList?.map(x=>({
                                    value:x.id, 
                                    label:<div className="flex items-center gap-[10px]">
                                            <span>{x.id}</span>
                                            {x?.scopes?.map(s=><Tag >{s?.toLocaleUpperCase()}</Tag>)}
                                            </div>}))}
                                onChange={(e)=>{
                                    form.setFieldValue('config',llmList.find(x=>x.id===e)?.config)
                                }}>
                            </Select>
                        </Form.Item>

                        <Form.Item<AiServiceRouterModelConfigField>
                            label={$t("参数")}
                            name="config"
                        >
                                <Codebox editorTheme="vs-dark"
                                    width="100%" height="300px" language='json' enableToolbar={false} />
                        </Form.Item>
                    </Form>
    )
})

export default AiServiceRouterModelConfig