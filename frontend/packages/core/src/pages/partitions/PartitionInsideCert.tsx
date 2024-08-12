import PageList from "@common/components/aoplatform/PageList.tsx"
import {ActionType, ProColumns} from "@ant-design/pro-components";
import  {FC, forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState} from "react";
import {Link, useParams} from "react-router-dom";
import {useBreadcrumb} from "@common/contexts/BreadcrumbContext.tsx";
import {App, Button, Col, Divider, Form, Input, Row, Upload} from "antd";
import {BasicResponse, STATUS_CODE} from "@common/const/const.ts";
import {useFetch} from "@common/hooks/http.ts";
import {RouterParams} from "@core/components/aoplatform/RenderRoutes.tsx";
import { Base64 } from 'js-base64';
import { PARTITION_CERT_TABLE_COLUMNS } from "../../const/partitions/const.tsx";
import { PartitionCertConfigHandle, PartitionCertConfigProps, PartitionCertTableListItem } from "../../const/partitions/types.ts";
import WithPermission from "@common/components/aoplatform/WithPermission.tsx";
import { SimpleMemberItem } from "@common/const/type.ts";
import TableBtnWithPermission from "@common/components/aoplatform/TableBtnWithPermission.tsx";
import { useGlobalContext } from "@common/contexts/GlobalStateContext.tsx";
import { checkAccess } from "@common/utils/permission.ts";
import { PERMISSION_DEFINITION } from "@common/const/permissions.ts";

const CertConfigModal = forwardRef<PartitionCertConfigHandle,PartitionCertConfigProps>((props, ref) => {
    const { message } = App.useApp()
    const {type,entity} = props
    const [form] = Form.useForm();
    const [, forceUpdate] = useState<unknown>(null);
    const {fetchData} = useFetch()

    const save:()=>Promise<boolean | string> =  ()=>{
        return new Promise((resolve, reject)=>{
            form.validateFields().then((value)=>{
                const body = {
                    key:Base64.encode(value.key),
                    pem:Base64.encode(value.pem)
                }
                fetchData<BasicResponse<null>>('certificate',{method:type === 'add'? 'POST' : 'PUT',eoBody:(body), eoParams:type === 'add' ? {}:{id:entity!.id}}).then(response=>{
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

    useEffect(() => {
        if(type === 'edit' && entity){
            //console.log(entity)
            form.setFieldsValue({key:Base64.decode(entity.key), pem:Base64.decode(entity.pem)})
            forceUpdate({})
        }
    }, []);

    return (<WithPermission access={type === 'edit' ? 'system.devops.ssl_certificate.edit':'system.devops.ssl_certificate.add'}>
        <Form
            layout='vertical'
            labelAlign='left'
            scrollToFirstError
            form={form}
            className="mx-auto "
            name="partitionInsideCert"
            // labelCol={{ offset:1, span: 3 }}
            // wrapperCol={{ span: 20}}
            autoComplete="off"
        >
        <div className="bg-[#fafafa] p-[10px] mb-[10px] border-[1px] border-solid border-[#f2f2f2] rounded-[10px]">
            <Form.Item
                label="密钥"
                name="key"
                className="mb-0 bg-transparent p-0 border-none rounded-none"
                rules={[{ required: true, message: '必填项' }]}
            >
                    <Upload maxCount={1} showUploadList={false} beforeUpload={(file)=>{
                        const reader = new FileReader();
                        reader.readAsText(file);  // 如果你想要纯文本
                        reader.onload = ()=>{
                            const result = reader.result;
                            form.setFieldsValue({key: result});  // 更新表单的密钥字段
                            forceUpdate({})
                        }
                        return false;  // 阻止自动上传
                    }}>
                        <Button>上传密钥</Button>
                    </Upload>
            </Form.Item>

            <Row className="mb-mbase">
                <Col offset={0} span={24}>
                    <Input.TextArea
                        className="mt-btnybase  w-INPUT_NORMAL  min-h-TEXTAREA"
                        placeholder="密钥文件的后缀名一般为 .key 的文件内容"
                        value={form.getFieldValue('key')}  // 绑定表单的密钥字段作为值
                        onChange={(e) => {
                            form.setFieldsValue({key: e.target.value});  // 当用户手动输入时更新表单的密钥字段
                            forceUpdate({})
                        }}
                    />
                </Col>
            </Row>
        </div>

        <div className="bg-[#fafafa] p-[10px] border-[1px] border-solid border-[#f2f2f2] rounded-[10px]">
            <Form.Item
                label="证书"
                name="pem"
                className="mb-0 bg-transparent p-0 border-none rounded-none"
                rules={[{ required: true, message: '必填项' }]}
            >
                    <Upload  maxCount={1} showUploadList={false} beforeUpload={(file)=>{
                        const reader = new FileReader();
                        reader.readAsText(file);
                        reader.onload = ()=>{
                            const {result} = reader
                            form.setFieldsValue({pem: result})
                            forceUpdate({})
                        }
                        return false
                    }}>
                        <Button>上传证书</Button>
                    </Upload>
            </Form.Item>


            <Row className="mb-mbase">
                <Col offset={0} span={24}>
                    <Input.TextArea
                        className="mt-btnybase w-INPUT_NORMAL min-h-TEXTAREA"
                        placeholder="证书文件的后缀名一般为 .crt 或 .pem 的文件内容"
                        value={form.getFieldValue('pem')}  // 绑定表单的密钥字段作为值
                        onChange={(e) => {
                            form.setFieldsValue({pem: e.target.value});  // 当用户手动输入时更新表单的密钥字段
                            forceUpdate({})
                        }}/>
                </Col>
            </Row>
            </div>
        </Form>
    </WithPermission>)
})

const PartitionInsideCert:FC = ()=>{
    const { setBreadcrumb } = useBreadcrumb()
    const { modal,message } = App.useApp()
    const [init, setInit] = useState<boolean>(true)
    const {fetchData} = useFetch()
    const addRef = useRef<PartitionCertConfigHandle>(null)
    const editRef = useRef<PartitionCertConfigHandle>(null)
    const pageListRef = useRef<ActionType>(null);
    const [memberValueEnum, setMemberValueEnum] = useState<{[k:string]:{text:string}}>({})
    const {accessData} = useGlobalContext()

    const getPartitionCertList =(): Promise<{ data: PartitionCertTableListItem[], success: boolean }>=> {
        return fetchData<BasicResponse<{certificates:PartitionCertTableListItem}>>('certificates',{method:'GET',eoTransformKeys:['partition_id','update_time','not_before','not_after']}).then(response=>{
            const {code,data,msg} = response
            if(code === STATUS_CODE.SUCCESS){
                setInit((prev)=>prev ? false : prev)
                return  {data:data.certificates, success: true}
            }else{
                message.error(msg || '操作失败')
                return {data:[], success:false}
            }
        }).catch(() => {
            return {data:[], success:false}
        })
    }

    const deleteCert = (entity:PartitionCertTableListItem)=>{
        return new Promise((resolve, reject)=>{
            fetchData<BasicResponse<null>>('certificate',{method:'DELETE',eoParams:{id:entity.id}}).then(response=>{
                const {code,msg} = response
                if(code === STATUS_CODE.SUCCESS){
                    message.success(msg || '操作成功！')
                    resolve(true)
                }else{
                    message.error(msg || '操作失败')
                    reject(msg || '操作失败')
                }
            }).catch((errorInfo)=> reject(errorInfo))
        })
    }

    const openModal = async (type:'add'|'edit'|'delete', entity?:PartitionCertTableListItem)=>{
        let title:string = ''
        let content:string | React.ReactNode= ''
        switch (type){
            case 'add':
                title='添加证书'
                content= <CertConfigModal   ref={addRef} type="add"/>
                break;
            case 'edit':{
                title='修改证书'
                message.loading('正在加载数据')
                const {code,data,msg} = await fetchData<BasicResponse<{cert:{key:string, pem:string}}>>('certificate',{method:'GET',eoParams:{id:entity!.id}})
                message.destroy()
                if(code === STATUS_CODE.SUCCESS){
                    content= <CertConfigModal ref={editRef}  type="edit" entity={{...data.cert,id:entity!.id}}/>
                }else{
                    message.error(msg || '操作失败')
                    return
                }
                break;}
            case 'delete':
                title='删除'
                content='该数据删除后将无法找回，请确认是否删除？'
                break;
        }

        modal.confirm({
            title,
            content,
            onOk:()=> {
                switch (type){
                    case 'add':
                        return addRef.current?.save().then((res)=>{if(res === true) manualReloadTable()})
                    case 'edit':
                        return editRef.current?.save().then((res)=>{if(res === true) manualReloadTable()})
                    case 'delete':
                        return deleteCert(entity!).then((res)=>{if(res === true) manualReloadTable()})
                }
            },
            width:600,
            okText:'确认',
            okButtonProps:{
                disabled : !checkAccess( `system.devops.ssl_certificate.${type}` as keyof typeof PERMISSION_DEFINITION[0], accessData)
            },
            cancelText:'取消',
            closable:true,
            icon:<></>,
        })
    }


    const manualReloadTable = () => {
        pageListRef.current?.reload()
    };

    const operation:ProColumns<PartitionCertTableListItem>[] =[
        {
            title: '操作',
            key: 'option',
            width: 105,
            fixed:'right',
            valueType: 'option',
            render: (_: React.ReactNode, entity: PartitionCertTableListItem) => [
                <TableBtnWithPermission  access="system.devops.ssl_certificate.edit" key="edit" onClick={()=>{openModal('edit',entity)}} btnTitle="编辑"/>,
                <Divider type="vertical" className="mx-0"  key="div1"/>,
                <TableBtnWithPermission  access="system.devops.ssl_certificate.delete" key="delete" onClick={()=>{openModal('delete',entity)}} btnTitle="删除"/>]
        }
    ]

    useEffect(() => {
        setBreadcrumb([
            {title:'证书管理'}
        ])
        getMemberList()
        manualReloadTable()
    }, []);

    const getMemberList = async ()=>{
        setMemberValueEnum({})
        const {code,data,msg}  = await fetchData<BasicResponse<{ members: SimpleMemberItem[] }>>('simple/member',{method:'GET'})
        if(code === STATUS_CODE.SUCCESS){
            const tmpValueEnum:{[k:string]:{text:string}} = {}
            data.members?.forEach((x:SimpleMemberItem)=>{
                tmpValueEnum[x.name] = {text:x.name}
            })
            setMemberValueEnum(tmpValueEnum)
        }else{
            message.error(msg || '操作失败')
        }
    }

    const columns = useMemo(()=>{
        return PARTITION_CERT_TABLE_COLUMNS.map(x=>{if(x.filters &&((x.dataIndex as string[])?.indexOf('updater') !== -1) ){x.valueEnum = memberValueEnum} return x})
    },[memberValueEnum])

    return (
        <div className="flex flex-col flex-1 h-full">
            <div className="pb-[30px] pt-0">
                        <p className="text-theme text-[26px] mb-[20px]">证书</p>
                        <p>通过为 API 服务配置和管理 SSL 证书，企业可以加密数据传输，防止敏感信息被窃取或篡改。 </p>
            </div>
            <PageList
                id="global_partition_cert"
                ref={pageListRef}
                columns = {[...columns,...operation]}
                request={()=>getPartitionCertList()}
                showPagination={false}
                addNewBtnTitle="添加证书"
                addNewBtnAccess="system.devops.ssl_certificate.add"
                onAddNewBtnClick={()=>{openModal('add')}}
                onRowClick={(row:PartitionCertTableListItem)=>openModal('edit',row)}
                tableClickAccess="system.devops.ssl_certificate.edit"
            />
        </div>
    )

}
export default PartitionInsideCert