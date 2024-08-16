
import {App, Button, Divider, Form, Input, Row} from "antd";
import  {forwardRef, useEffect, useImperativeHandle, useState} from "react";
import {v4 as uuidv4} from 'uuid'
import WithPermission from "@common/components/aoplatform/WithPermission";
import { BasicResponse, STATUS_CODE } from "@common/const/const";
import { useFetch } from "@common/hooks/http";
import { useNavigate } from "react-router-dom";
import { useTenantManagementContext } from "@market/contexts/TenantManagementContext";

export type ManagementConfigFieldType = {
    name:string
    description:string
    id?:string
    team?:string
    asApp?:boolean
};

type ManagementConfigProps = {
    type:'add'|'edit'
    teamId:string
    appId?:string
}

export type ManagementConfigHandle = {
    save:()=>Promise<boolean|string>
}


const ManagementConfig = forwardRef<ManagementConfigHandle,ManagementConfigProps>((props, ref) => {
    const { message,modal } = App.useApp()
    const {type,teamId,appId} = props
    const [form] = Form.useForm();
    const {fetchData} = useFetch()
    const [delBtnLoading, setDelBtnLoading] = useState<boolean>(false)
    const {setAppName} = type === 'edit' ? useTenantManagementContext():{setAppName:()=>{}}
    const navigate = type === 'edit' ? useNavigate() : ()=>{}
    const save:()=>Promise<boolean | string> =  ()=>{
        return new Promise((resolve, reject)=>{
            form.validateFields().then((value)=>{
                fetchData<BasicResponse<{apps:ManagementConfigFieldType}>>(type === 'add'? 'team/app' : 'app/info',{method:type === 'add'? 'POST' : 'PUT',eoBody:(value), eoParams:type === 'add' ? {team:teamId}:{app:appId,team:teamId}}).then(response=>{
                    const {code,data,msg} = response
                    if(code === STATUS_CODE.SUCCESS){
                        message.success(msg || '操作成功！')
                        form.setFieldsValue(data.apps)
                        type === 'edit' && setAppName(data.apps.name)
                        resolve(true)
                    }else{
                        message.error(msg || '操作失败')
                        reject(msg || '操作失败')
                    }
                }).catch((errorInfo)=> reject(errorInfo))
            }).catch((errorInfo)=> reject(errorInfo))
        })
    }

    // 获取表单默认值
    const getApplicationInfo = () => {
        fetchData<BasicResponse<{ app: ManagementConfigFieldType }>>('app/info',{method:'GET',eoParams:{app:appId,team:teamId},eoTransformKeys:['as_app']}).then(response=>{
            const {code,data,msg} = response
            if(code === STATUS_CODE.SUCCESS){
                setAppName(data.app.name)
                setTimeout(()=>{form.setFieldsValue({...data.app})},0)
            }else{
                message.error(msg || '操作失败')
            }
        })
    };
    
    const deleteApplicationModal = async ()=>{
        setDelBtnLoading(true)
        modal.confirm({
            title:'删除',
            content:'该数据删除后将无法找回，请确认是否删除？',
            onOk:()=> {
                return deleteApplication()
            },
            width:600,
            okText:'确认',
            okButtonProps:{
                danger:true
            },
            onCancel:()=>{
                setDelBtnLoading(false)
            },
            cancelText:'取消',
            closable:true,
            icon:<></>
        })
    }

    
    const deleteApplication = ()=>{
        fetchData<BasicResponse<null>>('app',{method:'DELETE',eoParams:{app:appId,team:teamId}}).then(response=>{
            const {code,msg} = response
            if(code === STATUS_CODE.SUCCESS){
                message.success(msg || '操作成功！')
                navigate(`/tenantManagement/list`)
            }else{
                message.error(msg || '操作失败')
            }
        })
    }

    useImperativeHandle(ref, ()=>({
            save
        })
    )

    useEffect(() => {
        if(type === 'edit'){
            appId && getApplicationInfo()
        }else{
            form.setFieldValue('id',uuidv4())
        }
    }, [appId]);

    return  (<><WithPermission 
     access={type === 'edit' ? 'team.application.application.edit':'team.application.application.add'}
    >
        <Form
            layout='vertical'
            scrollToFirstError
            labelAlign='left'
            form={form}
            className="mx-auto w-full pb-[20px]"
            name="managementConfig"
            // labelCol={{ offset:1, span: 4 }}
            // wrapperCol={{ span: 19}}
            autoComplete="off"
            onFinish={save}
        >
            <div>
            <Form.Item<ManagementConfigFieldType>
                label="应用名称"
                name="name"
                rules={[{ required: true, message: '必填项',whitespace:true  }]}
            >
                <Input className="w-INPUT_NORMAL" placeholder="请输入"/>
            </Form.Item>

            <Form.Item<ManagementConfigFieldType>
                label="应用 ID"
                name="id"
                extra="应用ID（app_id）可用于检索服务或日志"
                rules={[{ required: true, message: '必填项' ,whitespace:true }]}
            >
                <Input className="w-INPUT_NORMAL" placeholder="请输入" disabled={type === 'edit'}/>
            </Form.Item>

            <Form.Item
                label="描述"
                name="description"
            >
                <Input.TextArea className="w-INPUT_NORMAL" placeholder="请输入"/>
            </Form.Item>
            {type === 'edit' && <>
                        <Row className="mb-[10px]"
                            // wrapperCol={{ offset: 5, span: 19 }}
                            >
                        <WithPermission access={type === 'edit'? 'team.application.application.edit' :'team.application.application.add'}>
                            <Button type="primary" htmlType="submit">
                                保存
                            </Button>
                            </WithPermission>
                        </Row>  </>                   
            } </div>
            
            { type === 'edit' && <>
            
                <WithPermission access="team.application.application.delete" showDisabled={false}>
                    <div className="bg-[rgb(255_120_117_/_5%)] rounded-[10px] mt-[50px] p-btnrbase pb-0">
                            <p className="text-left"><span className="font-bold">删除应用：</span>删除操作不可恢复，请谨慎操作！</p>
                                <div className="text-left">
                                    <WithPermission access="team.application.application.delete">
                                        <Button className="m-auto mt-[16px] mb-[20px]" type="default" danger={true} onClick={deleteApplicationModal} loading={delBtnLoading}>删除应用</Button>
                                        </WithPermission>
                                </div>
                            </div>
                    </WithPermission>
    </>}
            </Form>
    </WithPermission></>
        )
})

export default ManagementConfig