
import { App, Form, Row, Col, Select, Input } from "antd";
import { forwardRef, useEffect, useImperativeHandle, useMemo } from "react";
import WithPermission from "@common/components/aoplatform/WithPermission";
import { BasicResponse, STATUS_CODE } from "@common/const/const";
import { ApplyServiceHandle, ApplyServiceProps } from "../../const/serviceHub/type";
import { useFetch } from "@common/hooks/http";

export const ApplyServiceModal = forwardRef<ApplyServiceHandle,ApplyServiceProps>((props,ref)=>{
    const { message } = App.useApp()
    const {entity,mySystemOptionList,reApply} = props
    const [form] = Form.useForm();
    const {fetchData} = useFetch()

    useEffect(() => {
        form.setFieldsValue(reApply ? {applications:entity?.app.id}:{})
    }, []);

    const apply: ()=>Promise<boolean | string> =  ()=>{
        return new Promise((resolve, reject)=>{
            form.validateFields().then((value)=>{
                fetchData<BasicResponse<null>>('catalogue/service/subscribe',{method:'POST',eoParams:{team:entity?.team?.id}, eoBody:({...value,service:entity.id})}).then(response=>{
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
            apply
        })
    )

    return (<WithPermission access="">
        <Form
            layout='vertical'
            scrollToFirstError
            form={form}
            className=" w-full mt-[20px]"
            name="applyServiceModal"
            autoComplete="off"
        >
            <Row className="mb-btnybase h-[32px]" >
                <Col span={6} className="pb-[8px] text-left">服务名称：</Col>
                <Col span={18}>{entity.name}</Col>
            </Row>
            <Row className="h-[32px] mb-btnybase">
                <Col span={6} className="pb-[8px]  text-left">服务 ID：</Col>
                <Col span={18}>{entity.id}</Col>
            </Row>
            <Form.Item
                label="应用"
                name="applications"
                rules={[{ required: true, message: '必填项' }]}
            >
                <Select className="w-INPUT_NORMAL" disabled={reApply} placeholder="搜索或选择应用" mode="multiple" options={mySystemOptionList?.filter((x)=>x.value !== entity.id)}/>
            </Form.Item>

            <Form.Item
                label="申请理由"
                name="reason"
            >
                <Input.TextArea className="w-INPUT_NORMAL" placeholder=""/>
            </Form.Item>

        </Form>
    </WithPermission>)
})