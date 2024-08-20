
import  {forwardRef, useImperativeHandle, useState} from "react";
import {App, Button, Form, Input} from "antd";
import {useFetch} from "@common/hooks/http.ts";
import {BasicResponse, FORM_ERROR_TIPS, PLACEHOLDER, RESPONSE_TIPS, STATUS_CODE, VALIDATE_MESSAGE} from "@common/const/const.tsx";
import { NodeModalHandle, PartitionClusterNodeModalTableListItem, PartitionClusterNodeTableListItem, NodeModalFieldType, NodeModalPropsType } from "../../const/partitions/types.ts";
import WithPermission from "@common/components/aoplatform/WithPermission.tsx";
import { ClusterConfigPreview } from "./PartitionInsideCluster.tsx";
import { $t } from "@common/locales/index.ts";

export const ClusterNodeModal = forwardRef<NodeModalHandle, NodeModalPropsType>((props,ref)=>{
    const { message } = App.useApp()
    const {changeStatus,getClusterInfo, status} = props
    const [form] = Form.useForm();
    const [dataSource,setDataSource] = useState<PartitionClusterNodeModalTableListItem[]>([])
    const {fetchData} = useFetch()
    const [addressError, setAddressError] = useState<'' | 'error'>('')

    const test = ()=>{
        setDataSource([])
        form.validateFields().then((value)=> {
            if(!value.address) {
                setAddressError('error')
                return
            }
                fetchData<BasicResponse<{ nodes: PartitionClusterNodeTableListItem[] }>>('cluster/check', {method: 'POST', eoBody: (value),eoTransformKeys:['manager_address','service_address','peer_address']}).then(response => {
                    const {code,data, msg} = response
                    if (code === STATUS_CODE.SUCCESS) {
                        message.success(msg || RESPONSE_TIPS.success)
                        setDataSource(data.nodes)
                        changeStatus('preview')
                    } else {
                        message.error(msg ||FORM_ERROR_TIPS.clusterTest)
                        setAddressError('error')
                        
                    }
                }).catch((errorInfo)=>{
                    console.warn(errorInfo)
                })
        })}

    const save = ()=>{
            form.validateFields().then(()=> {
            fetchData<BasicResponse<null>>('cluster/reset',{method:'PUT' ,eoBody:({managerAddress:form.getFieldValue('address')}), eoTransformKeys:['managerAddress']}).then(response=>{
                const {code,msg} = response
                if(code === STATUS_CODE.SUCCESS){
                    message.success(msg || RESPONSE_TIPS.success)
                    getClusterInfo()
                }else{
                    message.error(msg || RESPONSE_TIPS.error)
                }
            }).catch((errorInfo)=>
                console.warn(errorInfo))
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
        {status === 'edit' ? 

                <Form.Item<NodeModalFieldType>
                    label={$t("集群地址")}
                    name="address"
                    className="mb-0"
                    validateStatus={addressError}
                    help={addressError ? form.getFieldValue('address')? FORM_ERROR_TIPS.clusterTest : VALIDATE_MESSAGE.required : ''}
                >  
                        <Input placeholder={PLACEHOLDER.input} onPressEnter={()=>test()} onChange={(e)=>setAddressError(e.target?.value ? '' : 'error')}/>
                </Form.Item> :  dataSource && ClusterConfigPreview(dataSource?.[0] as unknown as PartitionClusterNodeTableListItem)}

                <div className="flex gap-btnbase mt-[20px]">
                    { status === 'edit' && <WithPermission access="system.devops.cluster.edit"><Button type="primary" onClick={test}>{$t('下一步')}</Button></WithPermission>}
                    { status === 'preview' && <WithPermission access="system.devops.cluster.edit"><Button type="primary" onClick={save}>{$t('确定')}</Button></WithPermission>}
                    <Button type="default" onClick={()=>{changeStatus(status === 'edit' ? 'view' :'edit'); form.resetFields()}}>{$t('取消')}</Button>
                </div>
        </Form>
        </WithPermission>
    )
})
