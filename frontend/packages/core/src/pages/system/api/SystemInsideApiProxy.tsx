
import { Form, Input, InputNumber } from "antd";
import { forwardRef, useEffect, useImperativeHandle } from "react"
import EditableTableWithModal from "@common/components/aoplatform/EditableTableWithModal";
import { PROXY_HEADER_CONFIG } from "../../../const/system/const";
import { SystemApiProxyType, ProxyHeaderItem, SystemInsideApiProxyHandle, SystemInsideApiProxyProps } from "../../../const/system/type";
import { PLACEHOLDER, VALIDATE_MESSAGE } from "@common/const/const";
import { $t } from "@common/locales";

const SystemInsideApiProxy = forwardRef<SystemInsideApiProxyHandle,SystemInsideApiProxyProps>((props,ref)=>{
    const {value, onChange, className,initProxyValue} = props

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

    return (
        <>
        <Form
            layout='vertical'
            labelAlign='left'
            scrollToFirstError
            form={form}
            className={`mx-auto  flex flex-col overflow-hidden h-full ${className}`}
            name="systemInsideApiProxy"
            onValuesChange={(_,allValues)=>{onChange?.(allValues)}}
            autoComplete="off">

            <Form.Item<SystemApiProxyType>
                label={$t("转发上游路径")}
                name={'path'}
            >
                <Input  prefix="/" className="w-INPUT_NORMAL" placeholder={PLACEHOLDER.input}/>
            </Form.Item>

            <Form.Item<SystemApiProxyType>
                label={$t("请求超时时间")}
                name={'timeout'}
                extra={$t("单位：ms，最小值：1")}
                rules={[{required: true, message: VALIDATE_MESSAGE.required}]}
            >
                <InputNumber className="w-INPUT_NORMAL"min={1} placeholder={PLACEHOLDER.input} />
            </Form.Item>

            <Form.Item<SystemApiProxyType>
                label={$t("重试次数")}
                name={'retry'}
                rules={[{required: true, message: VALIDATE_MESSAGE.required}]}
            >
                <InputNumber className="w-INPUT_NORMAL" min={0}  placeholder={PLACEHOLDER.input} />
            </Form.Item>

            <Form.Item<SystemApiProxyType>
                label={$t("转发上游请求头")}
                name={'headers'}
            >
                <EditableTableWithModal<ProxyHeaderItem & {_id:string}>
                    configFields={PROXY_HEADER_CONFIG}
                />
            </Form.Item>
        </Form>
        </>
    )
})
export default SystemInsideApiProxy