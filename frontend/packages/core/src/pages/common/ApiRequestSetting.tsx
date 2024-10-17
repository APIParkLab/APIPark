import WithPermission from "@common/components/aoplatform/WithPermission";
import { BasicResponse, STATUS_CODE, RESPONSE_TIPS, PLACEHOLDER } from "@common/const/const";
import { useFetch } from "@common/hooks/http";
import { $t } from "@common/locales";
import { App, Form, Input, Row, Button } from "antd";
import { useEffect } from "react";

type ApiRequestSettingFieldType = {
    siteName:string
    siteLogo:string
    invokeAddress:string
    platformName:string
}

export default function ApiRequestSetting(){
    const { message } = App.useApp()
    const [form] = Form.useForm();
    const {fetchData} = useFetch()
    
    
    const onFinish = () => {
         form.validateFields().then((value)=>{
            return fetchData<BasicResponse<null>>('system/general',{method:'POST',eoBody:(value),eoTransformKeys:['invokeAddress','siteName','siteLogo','platformName']}).then(response=>{
                const {code,msg} = response
                if(code === STATUS_CODE.SUCCESS){
                    message.success(msg || $t(RESPONSE_TIPS.success))
                    getSystemSetting()
                    return Promise.resolve(true)
                }else{
                    message.error(msg || $t(RESPONSE_TIPS.error))
                    return Promise.reject(msg || $t(RESPONSE_TIPS.error))
                }
            }).catch((errorInfo)=>{
                return Promise.reject(errorInfo)
            })
        })
    };

    const getSystemSetting = ()=>{
        fetchData<BasicResponse<{ general: ApiRequestSettingFieldType }>>('system/general',{method:'GET',eoTransformKeys:['site_name', 'site_logo','invoke_address','platform_name']}).then(response=>{
            const {code,data,msg} = response
            if(code === STATUS_CODE.SUCCESS){
                form.setFieldsValue(data.general)
            }else{
                message.error(msg || $t(RESPONSE_TIPS.error))
            }
        })
    }
    
    useEffect(() => {
        getSystemSetting()
        return (form.setFieldsValue({}))
    }, []);

    return (
        <>
                <WithPermission access='system.devops.system_setting.edit'>
                    <Form
                        layout='vertical'
                        labelAlign='left'
                        scrollToFirstError
                        form={form}
                        className={`mx-auto`}
                        name="teamConfig"
                        onFinish={onFinish}
                        autoComplete="off"
                    >
                        <Form.Item<ApiRequestSettingFieldType>
                            label={$t("API 调用地址")}
                            name="name"
                            rules={[{ required: true,whitespace:true  }]}
                            extra={$t("API base URL 一般设置为API 网关的外部网络访问地址，或者是API网关绑定的域名。")}
                        >
                            <Input className="w-INPUT_NORMAL" placeholder={$t(PLACEHOLDER.input)}/>
                        </Form.Item>


                    <Row className="mb-[10px]" 
                    >
                        <WithPermission access='system.devops.system_setting.edit'>
                            <Button type="primary" htmlType="submit">
                                {$t('保存')}
                            </Button>
                            </WithPermission>
                    </Row>
                    </Form>
                </WithPermission>
        </>
    )
}