
import  {forwardRef, useImperativeHandle, useState} from "react";
import {App, Button, Form, Input, Table} from "antd";
import {useFetch} from "@common/hooks/http.ts";
import {BasicResponse, STATUS_CODE} from "@common/const/const.ts";
import { NODE_MODAL_COLUMNS } from "../../const/partitions/const.tsx";
import { NodeModalHandle, PartitionClusterNodeModalTableListItem, PartitionClusterNodeTableListItem, NodeModalFieldType } from "../../const/partitions/types.ts";
import WithPermission from "@common/components/aoplatform/WithPermission.tsx";

export const ClusterNodeModal = forwardRef<NodeModalHandle>((_,ref)=>{
    const { message } = App.useApp()
    const [form] = Form.useForm();
    const [dataSource,setDataSource] = useState<PartitionClusterNodeModalTableListItem[]>([])
    const {fetchData} = useFetch()

    const test = ()=>{
        setDataSource([])
        return new Promise((resolve, reject)=>{
            form.validateFields().then((value)=> {
                fetchData<BasicResponse<{ nodes: PartitionClusterNodeTableListItem[] }>>('cluster/check', {method: 'POST', eoBody: (value),eoTransformKeys:['manager_address','service_address','peer_address']}).then(response => {
                    const {code,data, msg} = response
                    if (code === STATUS_CODE.SUCCESS) {
                        message.success(msg || '操作成功')
                        setDataSource(data.nodes)
                    } else {
                        message.error(msg || '操作失败')
                    }
                }).catch((errorInfo)=> reject(errorInfo))
            }).catch((errorInfo)=> reject(errorInfo))
        })}

    const save:()=>Promise<boolean | string> =  ()=>{
        return new Promise((resolve, reject)=>{
            form.validateFields().then(()=> {
            fetchData<BasicResponse<null>>('cluster/reset',{method:'PUT' ,eoBody:({managerAddress:form.getFieldValue('address')}), eoTransformKeys:['managerAddress']}).then(response=>{
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

    return (
    <WithPermission access="system.devops.cluster.edit">
        <Form
            layout='vertical'
            labelAlign='left'
            scrollToFirstError
            form={form}
            className="mx-auto "
            autoComplete="off"
            name="partitionInsideClusterNode"
        >
            <div className="flex items-end justify-between bg-[#fafafa] p-[10px] border-[1px] border-solid border-[#f2f2f2] rounded-[10px] gap-btnbase ">
                <Form.Item<NodeModalFieldType>
                    label="集群地址"
                    name="address"
                    className="p-0 bg-transparent rounded-none border-none  flex-1"
                    rules={[{ required: true, message: '必填项' }]}
                >  
                        <Input placeholder="请输入" onPressEnter={()=>test()}/>
                </Form.Item>
                <div className="">
                    <Button type='primary' className="mb-[10px]" onClick={()=>test()}>测试</Button>
            </div>
            </div>
            {
                dataSource.length > 0 &&
                <Table
                    className="mt-btnbase"
                    bordered={true}
                    columns={NODE_MODAL_COLUMNS}
                    size="small"
                    rowKey="id"
                    dataSource={dataSource}
                    pagination={false}
                />
            }
        </Form>
        </WithPermission>
    )
})
