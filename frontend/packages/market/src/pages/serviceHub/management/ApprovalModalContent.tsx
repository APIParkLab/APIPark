
import { App, Form, Row, Col, Input } from "antd"
import { forwardRef, useImperativeHandle, useEffect } from "react"
import WithPermission from "@common/components/aoplatform/WithPermission"
import { BasicResponse, PLACEHOLDER, RESPONSE_TIPS, STATUS_CODE } from "@common/const/const"
import { useFetch } from "@common/hooks/http"
import { SYSTEM_SUBSCRIBE_APPROVAL_DETAIL_LIST } from "@core/const/system/const"
import { SubSubscribeApprovalModalHandle, SubSubscribeApprovalModalProps } from "@core/const/system/type"
import { $t } from "@common/locales"

type FieldType = {
    reason: string
    opinion?:string
}

export const ApprovalModalContent = forwardRef<SubSubscribeApprovalModalHandle,SubSubscribeApprovalModalProps>((props, ref) => {
    const { message } = App.useApp()
    const {data, type, serviceId, teamId} = props
    const [form] = Form.useForm();
    const {fetchData} = useFetch()

    const reApply:()=>Promise<boolean | string> =  ()=>{
        return new Promise((resolve, reject)=>{
            if(type === 'view'){
                resolve(true)
                return
            }
            form.validateFields().then((value)=>{
                fetchData<BasicResponse<null>>('catalogue/service/subscribe',{method: 'POST',eoParams:{team:teamId}, eoBody:({service:data!.service.id, applications:[serviceId], reason:value.reason})}).then(response=>{
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
        reApply
        })
    )

    useEffect(()=>{
        form.setFieldsValue({...data})
    },[])


    return (
        <div className="my-btnybase">
        <WithPermission access="">
            <Form
                layout='vertical'
                labelAlign='left'
                scrollToFirstError
                form={form}
                className="mx-auto "
                name="subSubscribeApprovalDetailModalContent"
                autoComplete="off"
                disabled={type === 'view'}
            >

            {SYSTEM_SUBSCRIBE_APPROVAL_DETAIL_LIST?.map((x)=>{
                return (
                    <Row key={x.key} className="leading-[32px] mb-btnbase">
                        <Col className="text-left" span={8}>{$t(x.title)}：</Col>
                        <Col >{x.nested ? data?.[x.key]?.[x.nested] : ( (data as {[k:string]:unknown})?.[x.key] || '-')}</Col>
                    </Row>)
                })}

                <Form.Item<FieldType>
                    label={$t("申请原因")}
                    name="reason"
                >
                    <Input.TextArea className="w-INPUT_NORMAL" disabled={type === 'view'} placeholder={$t(PLACEHOLDER.input)}  />
                </Form.Item>
                <Form.Item<FieldType>
                    label={$t("审核意见")}
                    name="opinion"
                >
                    <Input.TextArea className="w-INPUT_NORMAL" placeholder={$t(PLACEHOLDER.input)} disabled={true} />
                </Form.Item>
            </Form>
            </WithPermission>
        </div>
    )
})