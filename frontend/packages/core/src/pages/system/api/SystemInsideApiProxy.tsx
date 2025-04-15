
import { Form, Input, InputNumber, Select } from "antd";
import { forwardRef, useEffect, useImperativeHandle, useMemo } from "react"
import EditableTableWithModal from "@common/components/aoplatform/EditableTableWithModal";
import { PROXY_HEADER_CONFIG, UPSTREAM_PROXY_HEADER_TYPE_OPTIONS } from "../../../const/system/const";
import { SystemApiProxyType, ProxyHeaderItem, SystemInsideApiProxyHandle, SystemInsideApiProxyProps } from "../../../const/system/type";
import { PLACEHOLDER, } from "@common/const/const";
import { $t } from "@common/locales";
import { useGlobalContext } from "@common/contexts/GlobalStateContext";

const SystemInsideApiProxy = forwardRef<SystemInsideApiProxyHandle,SystemInsideApiProxyProps>((props,ref)=>{
    const {value, onChange, className,initProxyValue,type} = props
    const {state} = useGlobalContext()
    const [form] = Form.useForm();
    
    useEffect(()=>{
        initProxyValue && form.setFieldsValue({
            ...initProxyValue,
            path:initProxyValue.path ? (initProxyValue.path.startsWith('/')? initProxyValue.path.substring(1):initProxyValue.path):''})
    },[])

    useImperativeHandle(ref,()=>({
        validate:form.validateFields
    }))

    useEffect(() => {
        form.setFieldsValue(value)
    }, [value,form]);

    const ProxyHeadeerConfig = useMemo(()=>PROXY_HEADER_CONFIG.map((x)=>({
            ...x, 
            ...(x.key === 'optType' ? {
                component: <Select
                showSearch
                optionFilterProp="label"
                className="w-INPUT_NORMAL" options={UPSTREAM_PROXY_HEADER_TYPE_OPTIONS.map((x)=>({...x, label:$t(x.label)}))}/>
            } : {})
        }))
    ,[state.language])

    return (
        <>
        <Form
            layout='vertical'
            labelAlign='left'
            scrollToFirstError
            form={form}
            className={`mx-auto  flex flex-col overflow-hidden h-full ${className}`}
            name="SystemInsideApiProxy"
            onValuesChange={(_,allValues)=>{onChange?.(allValues)}}
            autoComplete="off">

            <Form.Item<SystemApiProxyType>
                label={$t("转发上游路径")}
                name={'path'}
            >
                <Input  prefix={type === 'edit' ? null :"/"} className="w-INPUT_NORMAL" placeholder={$t(PLACEHOLDER.input)}/>
            </Form.Item>

            <Form.Item<SystemApiProxyType>
                label={$t("请求超时时间")}
                name={'timeout'}
                extra={$t("单位：ms，最小值：1")}
                rules={[{required: true}]}
            >
                <InputNumber className="w-INPUT_NORMAL"min={1} placeholder={$t(PLACEHOLDER.input)} />
            </Form.Item>

            <Form.Item<SystemApiProxyType>
                label={$t("重试次数")}
                name={'retry'}
                rules={[{required: true}]}
            >
                <InputNumber className="w-INPUT_NORMAL" min={0}  placeholder={$t(PLACEHOLDER.input)} />
            </Form.Item>

            <Form.Item<SystemApiProxyType>
                label={$t("转发上游请求头")}
                name={'headers'}
            >
                <EditableTableWithModal<ProxyHeaderItem & {_id:string}>
                    configFields={ProxyHeadeerConfig}
                />
            </Form.Item>
        </Form>
        </>
    )
})
export default SystemInsideApiProxy