import {Alert, App, Button, Form, Input, InputNumber, Select} from "antd";
import  {useEffect, useState} from "react";
import {useBreadcrumb} from "@common/contexts/BreadcrumbContext.tsx";
import {BasicResponse, STATUS_CODE} from "@common/const/const.ts";
import {useFetch} from "@common/hooks/http.ts";
import WithPermission from "@common/components/aoplatform/WithPermission.tsx";

type EmailFieldType = {
    uuid?: string;
    smtpUrl?: string;
    smtpPort?:number;
    protocol?: string;
    email?:string;
    account?:string;
    password?:string
};

const PROTOCOL_OPTIONS = [
    { label: '不设置任何协议', value: 'none' },
    { label: 'SSL协议', value: 'ssl' },
    { label: 'TLS协议', value: 'tls' }
]

export default function Email(){
    const { message } = App.useApp()
    const [form] = Form.useForm();
    const { setBreadcrumb } = useBreadcrumb()
    const {fetchData} = useFetch()
    const [uuid, setUuid] = useState<string>('')
    const [type,setType] = useState<'add'|'edit'>('add')
    const save = () => {
        form.validateFields().then(values => {
        fetchData<BasicResponse<null>>('email',{method:type === 'add'? 'POST' : 'PUT',eoBody:({...values,...(type === 'add'? {}:{uuid})}), eoTransformKeys:['emailInfo','smtpUrl']}).then(response=>{
            const {code,msg} = response
            if(code === STATUS_CODE.SUCCESS){
                type === 'add' && setType('edit')
                message.success(msg || '操作成功！')
            }else{
                message.error(msg || '操作失败')
            }
        })
    })
    };

    const getEmailConfig = ()=>{
        fetchData<BasicResponse<{emailInfo:EmailFieldType}>>('email',{method:'GET',eoTransformKeys:['email_info','smtp_url']}).then(response=>{
            const {code,data,msg} = response
            //console.log(data)
            if(code === STATUS_CODE.SUCCESS && data.emailInfo){
                form.setFieldsValue({...data.emailInfo,protocol:data.emailInfo.protocol === '' ? 'none' : data.emailInfo.protocol})
                setType('edit')
                setUuid(data.emailInfo.uuid)
            }else{
                message.error(msg || '操作失败')
            }
        })
    }

    useEffect(() => {
        setBreadcrumb([
            {
                title:'邮箱设置'
            },
        ])
        getEmailConfig()
    }, []);

    return (<>
        <Alert message="邮箱设置用于触发告警策略系统发送邮件给用户。" type="info" showIcon />
        <WithPermission access="">
        <Form
            form={form}
            className="mx-auto max-w-[1000px]"
            name="email"
            // labelCol={{ span: 7 }}
            // wrapperCol={{ span: 16}}
            onFinish={save}
            autoComplete="off"
        >
            <Form.Item<EmailFieldType>
                label="SMTP 地址"
                name="smtpUrl"
                rules={[{ required: true, message: '必填项',whitespace:true  }]}
            >
                <Input className="w-INPUT_NORMAL" placeholder="请输入"/>
            </Form.Item>

            <Form.Item<EmailFieldType>
                label="SMTP 端口"
                name="smtpPort"
                rules={[{ required: true, message: '必填项'  }]}
            >
                <InputNumber className="w-INPUT_NORMAL" min={0} controls={false} placeholder="请输入" />
            </Form.Item>

            <Form.Item<EmailFieldType>
                label="通信协议"
                name="protocol"
                rules={[{ required: true, message: '必填项' }]}
            >
                <Select placeholder="请选择" className="w-INPUT_NORMAL" defaultValue="ssl" options={PROTOCOL_OPTIONS}/>
            </Form.Item>

            <Form.Item<EmailFieldType>
                label="发件邮箱"
                name="email"
                rules={[{ type: 'email' }]}
            >
                <Input className="w-INPUT_NORMAL" placeholder="请输入"/>
            </Form.Item>

            <Form.Item<EmailFieldType>
                label="账号"
                name="account"
            >
                <Input className="w-INPUT_NORMAL" placeholder="请输入"/>
            </Form.Item>

            <Form.Item<EmailFieldType>
                label="密码"
                name="password"
            >
                <Input className="w-INPUT_NORMAL" placeholder="请输入"/>
            </Form.Item>

            <Form.Item 
            // wrapperCol={{ offset: 7, span: 16 }}
            >
            <WithPermission access=""><Button type="primary" htmlType="submit">
                    保存
                </Button></WithPermission>
            </Form.Item>
        </Form>
        </WithPermission>
    </>)
}