import { Codebox } from "@common/components/postcat/api/Codebox"
import { PLACEHOLDER } from "@common/const/const"
import { $t } from "@common/locales"
import { AiProviderLlmsItems } from "@core/pages/aiSetting/AiSettingList"
import { Form, Select, Tag } from "antd"
import { forwardRef, useEffect, useImperativeHandle } from "react"

export type AiServiceRouterModelConfigHandle = {
    save:()=>Promise<{id:string, config:string}>
}

export type AiServiceRouterModelConfigProps = {
    entity:AiServiceRouterModelConfigField
    llmList:AiProviderLlmsItems[]
}

type AiServiceRouterModelConfigField = {
    id:string
    config:string
}

const AiServiceRouterModelConfig = forwardRef<AiServiceRouterModelConfigHandle, AiServiceRouterModelConfigProps>((props, ref)=>{
    const [form] = Form.useForm();
    const {llmList,entity} = props

    useImperativeHandle(ref, ()=>({
        save:form.validateFields
        })
    )

    useEffect(()=>{
        form.setFieldsValue(entity)
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
                            label={$t("模型")}
                            name="id"
                            rules={[{ required: true }]}
                        >
                            <Select className="w-INPUT_NORMAL" 
                                placeholder={$t(PLACEHOLDER.select)} 
                                options={llmList?.map(x=>({
                                    value:x.id, 
                                    label:<div className="flex items-center gap-[4px]">
                                            <div className="flex items-center" dangerouslySetInnerHTML={{ __html: x.logo }}></div>
                                            <span>{x.id}</span>
                                            {x?.scopes?.map(s=><Tag >{s?.toLocaleUpperCase()}</Tag>)}
                                            </div>}))}>
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