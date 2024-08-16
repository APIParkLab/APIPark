
import { App, Button, Form, Input } from "antd";
import WithPermission from "@common/components/aoplatform/WithPermission.tsx";
import { BasicResponse, STATUS_CODE } from "@common/const/const.ts";
import { useFetch } from "@common/hooks/http.ts";

const ChangePsw= () => {
    const { message } = App.useApp()
    const {fetchData} = useFetch()
    const [form] = Form.useForm();


    const savePsw = ()=>{
        form.validateFields().then((value)=>{
            return fetchData<BasicResponse<null>>(
                'account/password/reset',
                {
                    method:'PUT',
                    eoBody:({...value}),
                }).then(response=>{
                    const {code,msg} = response
                    if(code === STATUS_CODE.SUCCESS){
                        message.success(msg || '操作成功！')
                    }else{
                        message.error(msg || '操作失败')
                    }
                    form.resetFields()
                }).catch((errorInfo)=> {console.warn(errorInfo)})
            })
    }


    return (
            <div className={`flex-1 h-full overflow-auto pr-PAGE_INSIDE_X`} >
                        <WithPermission access={''}>
                            <Form
                                layout='vertical'
                                labelAlign='left'
                                name="changePsw"
                                scrollToFirstError
                                className="mx-auto pl-[10px]  "
                                autoComplete="off"
                                form={form}
                                onFinish={savePsw}
                                >

                                <Form.Item
                                    name="old_password"
                                    label="旧密码"
                                    rules={[
                                    {
                                        required: true,
                                        message: '必填项',
                                    },
                                    ]}
                                >
                                    <Input.Password />
                                </Form.Item>
                                <Form.Item
                                    name="new_password"
                                    label="新密码"
                                    rules={[
                                    {
                                        required: true,
                                        message: '必填项',
                                    },
                                    ]}
                                >
                                    <Input.Password />
                                </Form.Item>

                                <Form.Item
                                    name="confirm"
                                    label="确认密码"
                                    dependencies={['new_password']}
                                    rules={[
                                    {
                                        required: true,
                                        message: '必填项',
                                    },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                        if (!value || getFieldValue('new_password') === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error('两次密码不一致'));
                                        },
                                    }),
                                    ]}
                                >
                                    <Input.Password />
                                </Form.Item>

                                <Form.Item
                                    className="border-none bg-transparent pt-btnrbase mb-0 pb-0 pl-0"
                                >
                                    <WithPermission access=''><Button type="primary" htmlType="submit" >
                                        修改密码
                                    </Button></WithPermission>
                                </Form.Item>
                            </Form>
                        </WithPermission>
            </div>
    )
}

export default ChangePsw