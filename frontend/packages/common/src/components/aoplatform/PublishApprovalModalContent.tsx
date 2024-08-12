import {App, Col, Form, Input, Row, Table, Tooltip} from "antd";
import {forwardRef, useEffect, useImperativeHandle} from "react";
import {PublishApprovalInfoType, PublishVersionTableListItem} from "@common/const/approval/type.tsx";
import {useFetch} from "@common/hooks/http.ts";
import {BasicResponse, STATUS_CODE} from "@common/const/const.ts";
import WithPermission from "@common/components/aoplatform/WithPermission.tsx";
import { SYSTEM_PUBLISH_ONLINE_COLUMNS } from "@core/const/system/const.tsx";
import { SystemInsidePublishOnlineItems } from "@core/pages/system/publish/SystemInsidePublishOnline.tsx";

enum ChangeTypeEnum  {
    'new' = '新增',
    'update' = '变更',
    'delete' = '删除',
    'none' = '无变更',
    'error' = '缺失字段'
}

const statusColorClass = {
    new: 'text-[#138913]', // 使用 Tailwind 的 Arbitrary Properties
    update: 'text-[#03a9f4]',
    delete: 'text-[#ff3b30]',
    none: 'text-[var(--MAIN_TEXT)]', // 假设你也有一个“none”的状态
  };

const apiColumns = [
    {
        title:'API 名称',
        dataIndex:'name',
        copyable: true,
        ellipsis:true
    },
    {
        title:'请求方式',
        dataIndex:'method',
        copyable: true,
        ellipsis:true
    },
    {
        title:'路径',
        dataIndex:'path',
        copyable: true,
        ellipsis:true
    },
    {
        title:'类型',
        dataIndex:'change',
        render:(_,entity)=>(
            <Tooltip placement="top" title={entity.change === 'error' ?`该 API 缺失 ${entity.proxyStatus == 1 && '转发信息,'} ${entity.docStatus == 1 && '文档信息,'} ${entity.upstreamStatus == 1 && '上游信息,'}请先补充`:''}>
                <span className={`${statusColorClass[entity.change as keyof typeof statusColorClass]} truncate block`}>
                    {ChangeTypeEnum[entity.change as (keyof typeof ChangeTypeEnum)] || '-'}
                    {entity.change === 'error' ?` 该 API 缺失 ${entity.proxyStatus == 1 && '转发信息,'} ${entity.docStatus == 1 && '文档信息,'} ${entity.upstreamStatus == 1 && '上游信息,'}请先补充`:''}
                    </span>
          </Tooltip>)
          
    }
]

const upstreamColumns = [
    {
        title:'上游类型',
        dataIndex:'type',
        ellipsis:true,
        // filters: true,
        // onFilter: true,
        // valueType: 'select',
        // filterSearch: true,
        valueEnum:{
            'static':{
                text:'静态上游'
            },
            // 'dynamic':{
            //     text:'动态上游'
            // }
        }
    },
    {
        title:'地址',
        dataIndex:'addr',
        render:(text:string[])=>(<>{text.join(',')}</>),
        copyable: true,
        ellipsis:true
    },
    {
        title:'类型',
        dataIndex:'change',
        render:(_,entity)=>(
            <Tooltip placement="top" title={entity.change === 'error' ?`该 API 缺失 ${entity.proxyStatus == 1 && '转发信息,'} ${entity.docStatus == 1 && '文档信息,'} ${entity.upstreamStatus == 1 && '上游信息,'}请先补充`:''}>
                <span className={`${statusColorClass[entity.change as keyof typeof statusColorClass]} truncate block`}>{ChangeTypeEnum[entity.change as (keyof typeof ChangeTypeEnum)] || '-'}
                    {entity.change === 'error' ?` 该 API 缺失 ${entity.proxyStatus == 1 && '转发信息,'} ${entity.docStatus == 1 && '文档信息,'} ${entity.upstreamStatus == 1 && '上游信息,'}请先补充`:''}</span>
          </Tooltip>)
    }
]

type PublishApprovalModalProps = {
    type:'approval'|'view'|'add'|'publish'|'online'
    data:PublishApprovalInfoType | PublishApprovalInfoType &{id?:string} | PublishVersionTableListItem
    insideSystem?:boolean
    serviceId:string
    teamId:string
    clusterPublishStatus?:SystemInsidePublishOnlineItems[]
}

export type PublishApprovalModalHandle = {
    save:(operate:'pass'|'refuse') =>Promise<boolean|string>
    publish:(notSave?:boolean)=>Promise<boolean|string|Record<string, unknown>>
    online:()=>Promise<boolean|string>
}

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
                        name:'opinion',errors:['选择拒绝时，审批意见为必填']
                    }])
                    form.scrollToField('opinion')
                    return Promise.reject('未填写审核意见')
                }
                return fetchData<BasicResponse<null>>(`service/publish/${operate === 'pass' ? 'accept' : 'refuse'}`,{method: 'PUT',eoBody:({comments:value.opinion}), eoParams:{id:data!.id, project:serviceId},eoTransformKeys:['versionRemark']}).then(response=>{
                    const {code,msg} = response
                    if(code === STATUS_CODE.SUCCESS){
                        message.success(msg || '操作成功！')
                        return Promise.resolve(true)
                    }else{
                        message.error(msg || '操作失败')
                        return Promise.reject(msg || '操作失败')
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
                        message.success(msg || '操作成功！')
                        resolve(response)
                    }else{
                        message.error(msg || '操作失败')
                        reject(msg || '操作失败')
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
                <Col className="text-left" span={4}><span >申请系统：</span></Col>
                <Col span={18}>{(data as PublishApprovalInfoType).project || '-'}</Col>
            </Row>

            <Row className="my-mbase">
                <Col className="text-left" span={4}><span >所属团队：</span></Col>
                <Col span={18}>{(data as PublishApprovalInfoType).team || '-'}</Col>
            </Row>

            <Row className="my-mbase">
                <Col className="text-left" span={4}><span >申请人：</span></Col>
                <Col span={18}>{(data as PublishApprovalInfoType).applier || '-'}</Col>
            </Row>

            <Row className="my-mbase">
                <Col className="text-left" span={4}><span >申请时间：</span></Col>
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
                            label="版本号"
                            name="version"
                            rules={[{required: true, message: '必填项',whitespace:true }]}
                        >
                            <Input className="w-INPUT_NORMAL" disabled={type !== 'add'} placeholder="请输入" />
                        </Form.Item>

                        <Form.Item
                            label="版本说明"
                            name="versionRemark"
                        >
                            <Input.TextArea className="w-INPUT_NORMAL" disabled={type !== 'add' && type !== 'publish'} placeholder="请输入" />
                        </Form.Item>
                    </>
                }
                    <Row className="mt-mbase pb-[8px] h-[32px] font-bold" ><span >API 列表：</span></Row>
                    <Row  className="mb-mbase ">
                        <Table
                            columns={apiColumns}
                            bordered={true}
                            rowKey="id"
                            size="small"
                            dataSource={data.diffs?.apis || []}
                            pagination={false}
                        /></Row>
                    <Row className="mt-mbase pb-[8px] h-[32px] font-bold" ><span >上游列表：</span></Row>
                    <Row  className="mb-mbase ">
                        <Table
                            bordered={true}
                            columns={upstreamColumns}
                            size="small"
                            rowKey="id"
                            dataSource={data.diffs?.upstreams || []}
                            pagination={false}
                        /></Row>
                <Form.Item
                    label="备注"
                    name="remark"
                >
                    <Input.TextArea className="w-INPUT_NORMAL" disabled={type !== 'add' && type !== 'publish'} placeholder="请输入" />
                </Form.Item>

                {type !== 'add' && type !== 'publish' && <Form.Item
                    label="审批意见"
                    name="opinion"
                    extra="选择拒绝时，审批意见为必填"
                >
                    <Input.TextArea className="w-INPUT_NORMAL" placeholder="请输入" onChange={()=>{  form.setFields([
                        {
                            name: 'opinion',
                            errors: [], // 设置为空数组来移除错误信息
                        },
                    ]);}}/>
                </Form.Item>}
                
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