import {App, Form, Input, Row, Table} from "antd";
import {forwardRef, useEffect, useImperativeHandle, useMemo} from "react";
import {useFetch} from "@common/hooks/http.ts";
import {BasicResponse, PLACEHOLDER, PolicyPublishColumns, RESPONSE_TIPS, STATUS_CODE} from "@common/const/const.tsx";
import WithPermission from "@common/components/aoplatform/WithPermission.tsx";
import { $t } from "@common/locales";
import { useGlobalContext } from "@common/contexts/GlobalStateContext";
import { PolicyPublishModalHandle, PolicyPublishModalProps } from "@common/const/type";


export const PolicyPublishModalContent = forwardRef<PolicyPublishModalHandle,PolicyPublishModalProps>((props, ref) => {
    const { message } = App.useApp()
    const { data} = props
    const [form] = Form.useForm();
    const {fetchData} = useFetch()
    const {state} = useGlobalContext()

    const publish:()=>Promise<boolean | string | Record<string, unknown>> =  ()=>{
        return new Promise((resolve, reject)=>{
            form.validateFields().then((value)=>{
                const body = {...value, source:data.source}
                fetchData<BasicResponse<null>>('strategy/global/data-masking/publish',{method: 'POST',eoBody:body,eoTransformKeys:['versionName']}).then(response=>{
                    const {code,msg} = response
                    if(code === STATUS_CODE.SUCCESS){
                        message.success(msg || $t(RESPONSE_TIPS.success))
                        resolve(response)
                    }else{
                        message.error(msg || $t(RESPONSE_TIPS.error))
                        reject(msg || $t(RESPONSE_TIPS.error))
                    }
            }).catch((errorInfo)=> reject(errorInfo))
        }).catch((errorInfo)=> reject(errorInfo))
    })
    }

    useImperativeHandle(ref, ()=>({
            publish,
        })
    )

    useEffect(()=>{
        form.setFieldsValue(data)
    },[data])

    const translatedPolicyColumns = useMemo(()=>PolicyPublishColumns.map((x)=>({
        ...x, 
    title: typeof x.title === 'string' ? $t(x.title) : x.title,
})),[state.language])

console.log(translatedPolicyColumns,data.strategies)

    return (
        <>
            <WithPermission access=""><Form
                className=" mx-auto"
                form={form}
                labelAlign='left'
                layout='vertical'
                scrollToFirstError
                name="publishApprovalModalContent"
                // labelCol={{span: 3}}
                // wrapperCol={{span: 21}}
                autoComplete="off"
            >

                        <Form.Item
                            label={$t("发布名称")}
                            name='versionName'
                            rules={[{required: true,whitespace:true }]}
                        >
                            <Input className="w-INPUT_NORMAL"  placeholder={$t(PLACEHOLDER.input)} />
                        </Form.Item>

                        <Form.Item
                            label={$t("描述")}
                            name="desc"
                        >
                            <Input.TextArea className="w-INPUT_NORMAL" placeholder={$t(PLACEHOLDER.input)} />
                        </Form.Item>
                    <Row className="mt-mbase pb-[8px] h-[32px] font-bold" ><span >{$t('策略列表')}：</span></Row>
                    <Row  className="mb-mbase ">
                        <Table
                            columns={translatedPolicyColumns}
                            bordered={true}
                            rowKey="name"
                            size="small"
                            dataSource={data.strategies || []}
                            pagination={false}
                        />
                        {!data?.isPublish&& data?.unpublishMsg&& <p  className="text-status_fail mt-[4px]">{data.unpublishMsg}</p>}
                        </Row>
                
            </Form>
            </WithPermission>
        </>)
})