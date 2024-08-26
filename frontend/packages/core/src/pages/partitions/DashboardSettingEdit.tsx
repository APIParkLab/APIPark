import { App, Form, Input, Select, Button } from "antd";
import { useEffect } from "react";
import { PartitionDashboardConfigFieldType } from "../../const/partitions/types";
import { DASHBOARD_SETTING_DRIVER_OPTION_LIST } from "../../const/partitions/const";
import WithPermission from "@common/components/aoplatform/WithPermission";
import { BasicResponse, PLACEHOLDER, STATUS_CODE, VALIDATE_MESSAGE } from "@common/const/const";
import { useFetch } from "@common/hooks/http";

export type DashboardPageShowStatus = 'view'|'edit'

export type DashboardSettingEditHandle = {
    save:()=>void
}
export type DashboardSettingEditProps = {
    changeStatus:(status:DashboardPageShowStatus)=>void
    refreshData:()=>void
    data?:PartitionDashboardConfigFieldType
}

 const DashboardSettingEdit = (props:DashboardSettingEditProps)=>{

    const {changeStatus,refreshData,data} = props
    const { message } = App.useApp()
    const [ form ] = Form.useForm();
    const { fetchData} = useFetch()
    const onFinish = () => {
        form.validateFields().then((value)=>{
            fetchData<BasicResponse<{info: PartitionDashboardConfigFieldType}>>('monitor/config',{method: 'POST',body:JSON.stringify(value),eoParams:{}}).then(response=>{
                const {code,msg} = response
                if(code === STATUS_CODE.SUCCESS){
                    message.success(msg || '操作成功，即将刷新页面')
                    refreshData?.()
                }else{
                    message.error(msg || '操作失败')
                }
            })
        })
    }

    useEffect(()=>{form.setFieldsValue(data)},[data])

    useEffect(() => {
        return (form.setFieldsValue({}))
    }, []);

    return (
        <>
                <div className="overflow-auto h-full">
                <WithPermission access={''} >
                    <Form
                        form={form}
                        className="mx-auto flex flex-col justify-between h-full"
                        layout="vertical"
                        onFinish={onFinish}
                        autoComplete="off"
                    >
                            <Form.Item<PartitionDashboardConfigFieldType>
                                label="数据源类型"
                                name="driver"
                                rules={[{ required: true }]}
                            >
                                <Select className="w-INPUT_NORMAL" placeholder={$t(PLACEHOLDER.select)} options={[...DASHBOARD_SETTING_DRIVER_OPTION_LIST]}/>
                            </Form.Item>

                            <Form.Item<PartitionDashboardConfigFieldType>
                                label="数据源地址"
                                name={['config','addr']}
                                rules={[{ required: true }]}
                            >
                                <Input className="w-INPUT_NORMAL"  placeholder={$t(PLACEHOLDER.input)}/>
                            </Form.Item>

                            <Form.Item<PartitionDashboardConfigFieldType>
                                label="Organization"
                                name={['config','org']}
                                rules={[{ required: true }]}
                            >
                                <Input className="w-INPUT_NORMAL"  placeholder={$t(PLACEHOLDER.input)}/>
                            </Form.Item>

                            <Form.Item<PartitionDashboardConfigFieldType>
                                label="鉴权 Token"
                                name={['config','token']}
                            >
                                <Input className="w-INPUT_NORMAL"  placeholder={$t(PLACEHOLDER.input)}/>
                            </Form.Item>

                            <div className="flex gap-btnbase">
                                <WithPermission access=''>
                                    <Button type="primary" htmlType="submit">
                                        保存
                                    </Button>
                                </WithPermission>
                                <Button type="default" onClick={()=>changeStatus('view')}>
                                        取消
                                </Button>
                            </div>
                    </Form>
                </WithPermission>
                </div>
        </>
    )
}

export default DashboardSettingEdit