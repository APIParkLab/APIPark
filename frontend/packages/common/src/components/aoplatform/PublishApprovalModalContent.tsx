import {App, Col, Form, Input, Row, Table} from "antd";
import {forwardRef, useEffect, useImperativeHandle} from "react";
import {PublishApprovalInfoType, PublishApprovalModalHandle, PublishApprovalModalProps, PublishVersionTableListItem} from "@common/const/approval/type.tsx";
import {useFetch} from "@common/hooks/http.ts";
import {BasicResponse, FORM_ERROR_TIPS, PLACEHOLDER, RESPONSE_TIPS, STATUS_CODE, VALIDATE_MESSAGE} from "@common/const/const.tsx";
import WithPermission from "@common/components/aoplatform/WithPermission.tsx";
import { SYSTEM_PUBLISH_ONLINE_COLUMNS } from "@core/const/system/const.tsx";
import { $t } from "@common/locales";
import { ApprovalApiColumns, ApprovalUpstreamColumns } from "@common/const/approval/const";


export const PublishApprovalModalContent = forwardRef<PublishApprovalModalHandle,PublishApprovalModalProps>((props, ref) => {
    const { message } = App.useApp()
    const { type,data,insideSystem = false,serviceId, teamId} = props
    const [form] = Form.useForm();
    const {fetchData} = useFetch()

    const save:(operate:'pass'|'refuse')=>Promise<boolean | string> =  (operate)=>{
            if(type === 'view'){
                return Promise.resolve(true)
            }
            return form.validateFields().then((value)=>{
                if(operate === 'refuse' && form.getFieldValue('opinion') === '' ){
                    form.setFields([{
                        name:'opinion',errors:[FORM_ERROR_TIPS.refuseOpinion]
                    }])
                    form.scrollToField('opinion')
                    return Promise.reject(RESPONSE_TIPS.refuseOpinion)
                }
                return fetchData<BasicResponse<null>>(`service/publish/${operate === 'pass' ? 'accept' : 'refuse'}`,{method: 'PUT',eoBody:({comments:value.opinion}), eoParams:{id:data!.id, project:serviceId},eoTransformKeys:['versionRemark']}).then(response=>{
                    const {code,msg} = response
                    if(code === STATUS_CODE.SUCCESS){
                        message.success(msg || RESPONSE_TIPS.success)
                        return Promise.resolve(true)
                    }else{
                        message.error(msg || RESPONSE_TIPS.error)
                        return Promise.reject(msg || RESPONSE_TIPS.error)
                    }
                }).catch((errorInfo)=> Promise.reject(errorInfo))
            }).catch((err)=> {form.scrollToField(err.errorFields[0].name[0]); return Promise.reject(err)})
    }

    const publish:(notSave?:boolean)=>Promise<boolean | string | Record<string, unknown>> =  (notSave)=>{
        return new Promise((resolve, reject)=>{
            form.validateFields().then((value)=>{
                const body = {...value, ...(type === 'publish'&&{release:data.id})}
                fetchData<BasicResponse<null>>(
                    notSave ? 'service/publish/apply' : 'service/publish/release/do',{method: 'POST',eoBody:body, eoParams:{service:serviceId, team:teamId},eoTransformKeys:['versionRemark']}).then(response=>{
                    const {code,msg} = response
                    if(code === STATUS_CODE.SUCCESS){
                        message.success(msg || RESPONSE_TIPS.success)
                        resolve(response)
                    }else{
                        message.error(msg || RESPONSE_TIPS.error)
                        reject(msg || RESPONSE_TIPS.error)
                    }
            }).catch((errorInfo)=> reject(errorInfo))
        }).catch((errorInfo)=> reject(errorInfo))
    })
    }
    
    const online:()=>Promise<boolean | string> =  ()=>{
        return new Promise((resolve, reject)=>{
            form.validateFields().then(()=>{
                fetchData<BasicResponse<null>>('service/publish/execute',{method: 'PUT', eoParams:{project:serviceId,id:(data as PublishVersionTableListItem).flowId},eoTransformKeys:['versionRemark']}).then(response=>{
                const {code,msg} = response
                if(code === STATUS_CODE.SUCCESS){
                    message.success(msg || RESPONSE_TIPS.success)
                    resolve(true)
                }else{
                    message.error(msg || RESPONSE_TIPS.error)
                    reject(msg || RESPONSE_TIPS.error)
                }
            }).catch((errorInfo)=> reject(errorInfo))
        }).catch((errorInfo)=> reject(errorInfo))
    })
    }

    useImperativeHandle(ref, ()=>({
            save,
            publish,
            online
        })
    )

    useEffect(()=>{
        form.setFieldsValue({ opinion:'',...data})
    },[])

    return (
        <>
            {!insideSystem && <>
            <Row className="my-mbase">
                <Col className="text-left" span={4}><span >{$t('申请系统')}：</span></Col>
                <Col span={18}>{(data as PublishApprovalInfoType).project || '-'}</Col>
            </Row>

            <Row className="my-mbase">
                <Col className="text-left" span={4}><span >{$t('所属团队')}：</span></Col>
                <Col span={18}>{(data as PublishApprovalInfoType).team || '-'}</Col>
            </Row>

            <Row className="my-mbase">
                <Col className="text-left" span={4}><span >{$t('申请人')}：</span></Col>
                <Col span={18}>{(data as PublishApprovalInfoType).applier || '-'}</Col>
            </Row>

            <Row className="my-mbase">
                <Col className="text-left" span={4}><span >{$t('申请时间')}：</span></Col>
                <Col span={18}>{(data as PublishApprovalInfoType).applyTime || '-'}</Col>
            </Row>
                </> }
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
                disabled={type === 'view'}
            >

                {
                    insideSystem && 
                    <>
                        <Form.Item
                            label={$t("版本号")}
                            name="version"
                            rules={[{required: true, message: VALIDATE_MESSAGE.required,whitespace:true }]}
                        >
                            <Input className="w-INPUT_NORMAL" disabled={type !== 'add'} placeholder={PLACEHOLDER.input} />
                        </Form.Item>

                        <Form.Item
                            label={$t("版本说明")}
                            name="versionRemark"
                        >
                            <Input.TextArea className="w-INPUT_NORMAL" disabled={type !== 'add' && type !== 'publish'} placeholder={PLACEHOLDER.input} />
                        </Form.Item>
                    </>
                }
                    <Row className="mt-mbase pb-[8px] h-[32px] font-bold" ><span >{$t('API 列表')}：</span></Row>
                    <Row  className="mb-mbase ">
                        <Table
                            columns={ApprovalApiColumns}
                            bordered={true}
                            rowKey="id"
                            size="small"
                            dataSource={data.diffs?.apis || []}
                            pagination={false}
                        /></Row>
                    <Row className="mt-mbase pb-[8px] h-[32px] font-bold" ><span >{$t('上游列表')}：</span></Row>
                    <Row  className="mb-mbase ">
                        <Table
                            bordered={true}
                            columns={ApprovalUpstreamColumns}
                            size="small"
                            rowKey="id"
                            dataSource={data.diffs?.upstreams || []}
                            pagination={false}
                        /></Row>
                <Form.Item
                    label={$t("备注")}
                    name="remark"
                >
                    <Input.TextArea className="w-INPUT_NORMAL" disabled={type !== 'add' && type !== 'publish'} placeholder={PLACEHOLDER.input} />
                </Form.Item>
{/* 
                {type !== 'add' && type !== 'publish' && <Form.Item
                    label={$t("审批意见"
                    name="opinion"
                    extra="选择拒绝时，审批意见为必填"
                >
                    <Input.TextArea className="w-INPUT_NORMAL" placeholder={PLACEHOLDER.input} onChange={()=>{  form.setFields([
                        {
                            name: 'opinion',
                            errors: [], // 设置为空数组来移除错误信息
                        },
                    ]);}}/>
                </Form.Item>} */}
                
                {['error','done'].indexOf(data.status) !== -1 && data.clusterPublishStatus &&data.clusterPublishStatus.length > 0 && <>                    <Row className="text-left h-[32px] mb-8px]" span={3}><span>上线情况：</span></Row>
                    <Row span={24} className="mb-mbase">
                        <Table
                            bordered={true}
                            columns={[...SYSTEM_PUBLISH_ONLINE_COLUMNS]}
                            size="small"
                            rowKey="id"
                            dataSource={data.clusterPublishStatus || []}
                            pagination={false}
                        />
                </Row></>}
            </Form>
            </WithPermission>
        </>)
})