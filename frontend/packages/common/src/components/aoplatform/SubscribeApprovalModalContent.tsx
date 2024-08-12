import {App, Checkbox, Col, Form, Input, Row} from "antd";
import { forwardRef, useEffect, useImperativeHandle} from "react";
import {SubscribeApprovalInfoType} from "@common/const/approval/type.tsx";
import {BasicResponse, STATUS_CODE} from "@common/const/const.ts";
import {useFetch} from "@common/hooks/http.ts";
import WithPermission from "@common/components/aoplatform/WithPermission.tsx";

type SubscribeApprovalModalProps = {
    type:'approval'|'view'
    data?:SubscribeApprovalInfoType
    inSystem?:boolean
    serviceId:string
    teamId:string
}

export type SubscribeApprovalModalHandle = {
    save:(operate:'pass'|'refuse') =>Promise<boolean|string>
}

type FieldType = {
    reason?:string;
    opinion?:string;
};

const list = [
    {
        title:'申请方应用',key:'application'
    },
    {
        title:'申请方所属团队',key:'applyTeam'
    },
    {
        title:'申请人',key:'applier'
    },
    {
        title:'申请时间',key:'applyTime'
    },
    {
        title:'申请服务',key:'service'
    },
    {
        title:'服务所属团队',key:'team'
    }
]
export const SubscribeApprovalModalContent = forwardRef<SubscribeApprovalModalHandle,SubscribeApprovalModalProps>((props, ref) => {
    const { message } = App.useApp()
    const {data, type,inSystem=false, teamId, serviceId} = props
    const [form] = Form.useForm();
    const {fetchData} = useFetch()

    const save:(operate:'pass'|'refuse')=>Promise<boolean | string> =  (operate)=>{
        return new Promise((resolve, reject)=>{
            if(type === 'view'){
                resolve(true)
                return
            }
            form.validateFields().then((value)=>{
                if(operate === 'refuse' && form.getFieldValue('opinion') === ''){
                    form.setFields([{
                        name:'opinion',errors:['必填项']
                    }])
                    form.scrollToField('opinion')
                    reject('未填写审核意见')
                    return
                }
                fetchData<BasicResponse<null>>(`${inSystem?'service/':''}approval/subscribe`,{method: 'POST',eoBody:({opinion:value.opinion,operate}), eoParams:(inSystem ? {apply:data!.id, team:teamId} : {id:data!.id,team:teamId})}).then(response=>{
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
            save
        })
    )

    useEffect(()=>{
        form.setFieldsValue({opinion:'',...data})
    },[])

    return (
        <div className="my-btnybase">{
            list?.map((x)=>(
                <Row key={x.key} className="leading-[32px] mb-btnbase mx-auto">
                    <Col className="text-left" span={6}>{x.title}：</Col>
                    <Col >{(data as {[k:string]:unknown})?.[x.key]?.name || (data as {[k:string]:unknown})?.[x.key] || '-'}</Col>
                </Row>
            ))
        }
        <WithPermission access="">
            <Form
                labelAlign='left'
                layout='vertical'
                form={form}
                className="mx-auto "
                name="subscribeApprovalModalContent"
                // labelCol={{ span: 6}}
                // wrapperCol={{ span: 18}}
                autoComplete="off"
                disabled={type === 'view'}
            >

                <Form.Item<FieldType>
                    label="申请原因"
                    name="reason"
                >
                    <Input.TextArea className="w-INPUT_NORMAL" disabled={true} placeholder=" "  />
                </Form.Item>
                <Form.Item<FieldType>
                    label="审核意见"
                    name="opinion"
                    extra="选择拒绝时，审批意见为必填"
                >
                    <Input.TextArea className="w-INPUT_NORMAL" placeholder="请输入" onChange={()=>{  form.setFields([
                        {
                            name: 'opinion',
                            errors: [], // 设置为空数组来移除错误信息
                        },
                    ])}} />
                </Form.Item>
            </Form>
            </WithPermission>
        </div>
    )
})