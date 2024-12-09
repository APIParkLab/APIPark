import PageList, { PageProColumns } from "@common/components/aoplatform/PageList.tsx"
import {ActionType} from "@ant-design/pro-components";
import  {FC, forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState} from "react";
import {App, Button, Col, Divider, Form, Input, Row, Upload} from "antd";
import {BasicResponse, COLUMNS_TITLE, DELETE_TIPS, RESPONSE_TIPS, STATUS_CODE, VALIDATE_MESSAGE} from "@common/const/const.tsx";
import {useFetch} from "@common/hooks/http.ts";
import { Base64 } from 'js-base64';
import { PARTITION_CERT_TABLE_COLUMNS } from "../../const/partitions/const.tsx";
import { PartitionCertConfigHandle, PartitionCertConfigProps, PartitionCertTableListItem } from "../../const/partitions/types.ts";
import WithPermission from "@common/components/aoplatform/WithPermission.tsx";
import { SimpleMemberItem } from "@common/const/type.ts";
import TableBtnWithPermission from "@common/components/aoplatform/TableBtnWithPermission.tsx";
import { useGlobalContext } from "@common/contexts/GlobalStateContext.tsx";
import { checkAccess } from "@common/utils/permission.ts";
import { PERMISSION_DEFINITION } from "@common/const/permissions.ts";
import InsidePage from "@common/components/aoplatform/InsidePage.tsx";
import { $t } from "@common/locales/index.ts";
import { useBreadcrumb } from "@common/contexts/BreadcrumbContext.tsx";

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
            save
        })
    )

    useEffect(() => {
        if(type === 'edit' && entity){
            form.setFieldsValue({key:Base64.decode(entity.key), pem:Base64.decode(entity.pem)})
            forceUpdate({})
        }
    }, []);

    return (<WithPermission access=''>
        <Form
            layout='vertical'
            labelAlign='left'
            scrollToFirstError
            form={form}
            className="mx-auto "
            name="partitionInsideCert"
            autoComplete="off"
        >
        <div className="bg-[#fafafa] p-[10px] mb-[10px] border-[1px] border-solid border-[#f2f2f2] rounded-[10px]">
            <Form.Item
                label={$t("密钥")}
                name="key"
                className="mb-0 bg-transparent p-0 border-none rounded-none"
                rules={[{ required: true }]}
            >
                    <Upload maxCount={1} showUploadList={false} beforeUpload={(file)=>{
                        const reader = new FileReader();
                        reader.readAsText(file);  
                        reader.onload = ()=>{
                            const result = reader.result;
                            form.setFieldsValue({key: result});  
                            forceUpdate({})
                        }
                        return false;  
                    }}>
                        <Button>{$t('上传密钥')}</Button>
                    </Upload>
            </Form.Item>

            <Row className="mb-mbase">
                <Col offset={0} span={24}>
                    <Input.TextArea
                        className="mt-btnybase  w-INPUT_NORMAL  min-h-TEXTAREA"
                        placeholder={$t("密钥文件的后缀名一般为 .key 的文件内容")}
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
                label={$t("证书")}
                name="pem"
                className="mb-0 bg-transparent p-0 border-none rounded-none"
                rules={[{ required: true }]}
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
                        <Button>{$t('上传证书')}</Button>
                    </Upload>
            </Form.Item>


            <Row className="mb-mbase">
                <Col offset={0} span={24}>
                    <Input.TextArea
                        className="mt-btnybase w-INPUT_NORMAL min-h-TEXTAREA"
                        placeholder={$t("证书文件的后缀名一般为 .crt 或 .pem 的文件内容")}
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
    const {fetchData} = useFetch()
    const addRef = useRef<PartitionCertConfigHandle>(null)
    const editRef = useRef<PartitionCertConfigHandle>(null)
    const pageListRef = useRef<ActionType>(null);
    const [memberValueEnum, setMemberValueEnum] = useState<{[k:string]:{text:string}}>({})
    const {accessData,state} = useGlobalContext()

    const getPartitionCertList =(): Promise<{ data: PartitionCertTableListItem[], success: boolean }>=> {
        return fetchData<BasicResponse<{certificates:PartitionCertTableListItem}>>('certificates',{method:'GET',eoTransformKeys:['partition_id','update_time','not_before','not_after']}).then(response=>{
            const {code,data,msg} = response
            if(code === STATUS_CODE.SUCCESS){
                return  {data:data.certificates, success: true}
            }else{
                message.error(msg || $t(RESPONSE_TIPS.error))
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
                    message.success(msg || $t(RESPONSE_TIPS.success))
                    resolve(true)
                }else{
                    message.error(msg || $t(RESPONSE_TIPS.error))
                    reject(msg || $t(RESPONSE_TIPS.error))
                }
            }).catch((errorInfo)=> reject(errorInfo))
        })
    }

    const openModal = async (type:'add'|'edit'|'delete', entity?:PartitionCertTableListItem)=>{
        let title:string = ''
        let content:string | React.ReactNode= ''
        switch (type){
            case 'add':
                title=$t('添加证书')
                content= <WithPermission access='system.devops.ssl_certificate.add'><CertConfigModal   ref={addRef} type="add"/></WithPermission>
                break;
            case 'edit':{
                title=$t('修改证书')
                message.loading($t(RESPONSE_TIPS.loading))
                const {code,data,msg} = await fetchData<BasicResponse<{cert:{key:string, pem:string}}>>('certificate',{method:'GET',eoParams:{id:entity!.id}})
                message.destroy()
                if(code === STATUS_CODE.SUCCESS){
                    content= <WithPermission access={'system.devops.ssl_certificate.edit'}><CertConfigModal ref={editRef}  type="edit" entity={{...data.cert,id:entity!.id}}/></WithPermission>
                }else{
                    message.error(msg || $t(RESPONSE_TIPS.error))
                    return
                }
                break;}
            case 'delete':
                title=$t('删除')
                content=$t(DELETE_TIPS.default)
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
            okText:$t('确认'),
            okButtonProps:{
                disabled : !checkAccess( `system.devops.ssl_certificate.${type}` as keyof typeof PERMISSION_DEFINITION[0], accessData)
            },
            cancelText:$t('取消'),
            closable:true,
            icon:<></>,
        })
    }


    const manualReloadTable = () => {
        pageListRef.current?.reload()
    };

    const operation:PageProColumns<PartitionCertTableListItem>[] =[
        {
            title: COLUMNS_TITLE.operate,
            key: 'option',
            fixed:'right',
            btnNums:2,
            valueType: 'option',
            render: (_: React.ReactNode, entity: PartitionCertTableListItem) => [
                <TableBtnWithPermission  access="system.devops.ssl_certificate.edit" key="edit" btnType="edit" onClick={()=>{openModal('edit',entity)}} btnTitle="编辑"/>,
                <Divider type="vertical" className="mx-0"  key="div1"/>,
                <TableBtnWithPermission  access="system.devops.ssl_certificate.delete" key="delete" btnType="delete" onClick={()=>{openModal('delete',entity)}} btnTitle="删除"/>]
        }
    ]

    useEffect(() => {
        setBreadcrumb([
            {title:$t('证书管理')}
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
            message.error(msg || $t(RESPONSE_TIPS.error))
        }
    }

    const columns = useMemo(()=>{
        const res = PARTITION_CERT_TABLE_COLUMNS.map(x=>{if(x.filters &&((x.dataIndex as string[])?.indexOf('updater') !== -1) ){x.valueEnum = memberValueEnum} return {...x,title:typeof x.title  === 'string' ? $t(x.title as string) : x.title}})
        return res
    },[memberValueEnum, state.language])

    return (
        <InsidePage 
            pageTitle={$t('证书')} 
            description={$t("通过为 API 服务配置和管理 SSL 证书，企业可以加密数据传输，防止敏感信息被窃取或篡改。")}
            showBorder={false}
            contentClassName="pr-PAGE_INSIDE_X pb-PAGE_INSIDE_B"
            >
            <PageList
                id="global_partition_cert"
                ref={pageListRef}
                columns = {[...columns,...operation]}
                request={()=>getPartitionCertList()}
                showPagination={false}
                addNewBtnTitle={$t("添加证书")}
                addNewBtnAccess="system.devops.ssl_certificate.add"
                onAddNewBtnClick={()=>{openModal('add')}}
                onRowClick={(row:PartitionCertTableListItem)=>openModal('edit',row)}
                tableClickAccess="system.devops.ssl_certificate.edit"
            />
       </InsidePage>
    )

}
export default PartitionInsideCert