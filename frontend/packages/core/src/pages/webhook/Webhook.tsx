import  {forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState} from "react";
import {useBreadcrumb} from "@common/contexts/BreadcrumbContext.tsx";
import {App, Divider, Form, Input, Select} from "antd";
import {ActionType, ProColumns} from "@ant-design/pro-components";
import PageList from "@common/components/aoplatform/PageList.tsx";
import {DefaultOptionType} from "antd/es/cascader";
import {DynamicKeyValueInput, transferToList, transferToMap} from "@common/components/aoplatform/DynamicKeyValueInput.tsx";
import {BasicResponse, STATUS_CODE} from "@common/const/const.ts";
import {useFetch} from "@common/hooks/http.ts";
import WithPermission from "@common/components/aoplatform/WithPermission.tsx";
import { EntityItem,SimpleMemberItem } from "@common/const/type.ts";
import TableBtnWithPermission from "@common/components/aoplatform/TableBtnWithPermission.tsx";
import { checkAccess } from "@common/utils/permission.ts";
import { useGlobalContext } from "@common/contexts/GlobalStateContext.tsx";
import { PERMISSION_DEFINITION } from "@common/const/permissions.ts";

type WebhookTableListItem = {
    uuid:string;
    name: string;
    url:string;
    method:string;
    type:string;
    updater:EntityItem;
    updateAt:string;
};


const WEBHOOK_TABLE_COLUMNS: ProColumns<WebhookTableListItem>[] = [
    {
        title: 'Webhook 名称',
        dataIndex: 'title',
        ellipsis:true,
        width:120,
        fixed:'left'
    },
    {
        title: '通知 Url',
        dataIndex: 'url',
        ellipsis:true
    },
    {
        title: '请求方式',
        dataIndex: 'method',
        ellipsis:true
    },
    {
        title: '参数类型',
        dataIndex: 'contentType'
    },
    {
        title: '更新者',
        dataIndex: ['operator','name'],
        ellipsis: true,
        filters: true,
        onFilter: true,
        valueType: 'select',
        filterSearch: true
    },
    {
        title: '更新时间',
        dataIndex: 'updateTime',
        ellipsis:true,
        width:182,
    },
];



const methodsList:DefaultOptionType[] = [
    { label: 'POST', value: 'POST' },
    { label: 'GET', value: 'GET' }
]

const contentTypesList: DefaultOptionType[] = [
    { label: 'JSON', value: 'JSON' },
    { label: 'form-data', value: 'form-data' }
]

const noticeTypesList: DefaultOptionType[] = [
    { label: '单次发送', value: 'single' },
    { label: '多次发送', value: 'many' }]


type WebhookConfigProps = {
    type:'add'|'edit'
    entity?:WebhookFieldType
}

type WebhookConfigHandle = {
    save:()=>Promise<boolean|string>
}

type WebhookFieldType = {
    uuid?:string
    title:string
    desc:string
    url:string
    method:string
    contentType:string
    noticeType:string
    userSeparator?:string
    header:Map<string, string> | {[key:string]:string}
    template:string
};

const WebhookConfig = forwardRef<WebhookConfigHandle, WebhookConfigProps>((props,ref)=>{
    const { message } = App.useApp()
    const {type,entity} = props
    const {fetchData} = useFetch()
    const [form] = Form.useForm();
    const [noticeType,setNoticeType] = useState('')

    const save:()=>Promise<boolean | string> =  ()=>{
        return new Promise((resolve, reject)=>{
            form.validateFields().then((value)=>{
                fetchData<BasicResponse<null>>('webhook',{method:type === 'add'? 'POST' : 'PUT',eoBody:({...value,header:transferToMap(value.header)}),eoTransformKeys:['contentType','noticeType','userSeparator']}).then(response=>{
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
            form.setFieldsValue({...entity,header:transferToList(entity.header) || []})
        }
    }, []);

    return  (<WithPermission access="">
        <Form
            layout='vertical'
            labelAlign='left'
            scrollToFirstError
            form={form}
            className="mx-auto  mt-[48px]"
            name="webhook"
            // labelCol={{ span: 7 }}
            // wrapperCol={{ span: 17}}
            autoComplete="off"
        >
            <Form.Item<WebhookFieldType>
                label="模板名称"
                name="title"
                rules={[{ required: true, message: '必填项',whitespace:true  },{pattern:new RegExp('^[\u4E00-\u9FA5A-Za-z]+$'),message:'仅支持中英文'}]}
            >
                <Input className="w-INPUT_NORMAL" placeholder="请输入"/>
            </Form.Item>

            <Form.Item
                label="描述"
                name="desc"
            >
                <Input.TextArea className="w-INPUT_NORMAL" placeholder="请输入"/>
            </Form.Item>

            <Form.Item
                label="通知URL"
                name="url"
                extra="仅支持 HTTP/HTTPS 协议 API"
                rules={[{ required: true, message: '必填项' ,whitespace:true }]}
            >
                <Input className="w-INPUT_NORMAL" placeholder="请输入"/>
            </Form.Item>

            <Form.Item
                label="请求方式"
                name="method"
                rules={[{required: true, message: '必填项'}]}
            >
                <Select className="w-INPUT_NORMAL"  placeholder="请选择" options={methodsList}>
                </Select>
            </Form.Item>

            <Form.Item
                label="参数类型"
                name="contentType"
                rules={[{required: true, message: '必填项'}]}
            >
                <Select className="w-INPUT_NORMAL" placeholder="请选择" options={contentTypesList}>
                </Select>
            </Form.Item>

            <Form.Item
                label="消息类型"
                name="noticeType"
                tooltip="单次发送是指网关每触发一次告警就会调用该接口一次，该接口应该支持群发消息给用户；多次发送是指网关每触发一次告警就会按用户个数调用该接口。"
                rules={[{required: true, message: '必填项'}]}
            >
                <Select className="w-INPUT_NORMAL" placeholder="请选择" options={noticeTypesList} onSelect={(e)=>setNoticeType(e)}>
                </Select>
            </Form.Item>

            {noticeType === 'single' &&
                <Form.Item
                    label="用户分隔符"
                    name="userSeparator"
                    tooltip="users变量值中user间的分隔符，比如：user1,user2，使用英文‘,’分隔符。"
                    rules={[{ required: true, message: '必填项',whitespace:true  }]}
                >
                    <Input className="w-INPUT_NORMAL" placeholder="请输入"/>
                </Form.Item>
                }

            <Form.Item
                label="Header参数"
                name="header"
            ><DynamicKeyValueInput/>
            </Form.Item>

            <Form.Item
                label="参数模板"
                name="template"
                extra="提供{title}、{msg}、{users}三个参数变量"
            >
                <Input.TextArea className="w-INPUT_NORMAL" placeholder="请输入"/>
            </Form.Item>
        </Form>
    </WithPermission>)
})

export default function Webhook(){
    // const [searchWord, setSearchWord] = useState<string>('')
    // const navigate = useNavigate();
    const { setBreadcrumb } = useBreadcrumb()
    // const [teamPageType,setTeamPageType]=useState<string>( '')
    const { modal,message } = App.useApp()
    // const [confirmLoading, setConfirmLoading] = useState(false);
    const {fetchData} = useFetch()
    const [memberValueEnum, setMemberValueEnum] = useState<{[k:string]:{text:string}}>({})

    const pageListRef = useRef<ActionType>(null);
    const addRef = useRef<WebhookConfigHandle>(null)
    const editRef = useRef<WebhookConfigHandle>(null)
    const {accessData} = useGlobalContext()


    const getWebhookList = ()=>{
        return fetchData<BasicResponse<{webhooks:WebhookTableListItem}>>('webhooks',{method:'GET',eoTransformKeys:['content_type','create_time','is_delete','update_time']}).then(response=>{
            const {code,data,msg} = response
            if(code === STATUS_CODE.SUCCESS){
                return  {data:data.webhooks, success: true}
            }else{
                message.error(msg || '操作失败')
                return {data:[], success:false}
            }
        }).catch(() => {
            return {data:[], success:false}
        })
    }


    const manualReloadTable = () => {
        pageListRef.current?.reload()
    };


    const deleteWebhook = (entity:WebhookTableListItem)=>{
        return new Promise((resolve, reject)=>{
            fetchData<BasicResponse<null>>('webhook',{method:'DELETE',eoParams:{uuid:entity!.uuid}}).then(response=>{
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

    const openModal = async (type:'add'|'edit'|'delete',entity?:WebhookTableListItem)=>{
        //console.log(type,entity)
        let title:string = ''
        let content:string | React.ReactNode= ''
        switch (type){
            case 'add':
                title='编辑 Webhook'
                content= <WebhookConfig ref={addRef} type={type}/>
                break;
            case 'edit':{
                title='编辑 Webhook'
                message.loading('正在加载数据')
                const {code,data,msg} = await fetchData<BasicResponse<{webhook:WebhookFieldType}>>('webhook',{method:'GET',eoParams:{uuid:entity!.uuid},eoTransformKeys:['content_type','notice_type','user_separator']})
                message.destroy()
                //console.log(data)
                if(code === STATUS_CODE.SUCCESS){
                    content= <WebhookConfig ref={editRef} type={type} entity={data.webhook}/>
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
            onOk:()=>{
                switch (type){
                    case 'add':
                        return addRef.current?.save().then((res)=>{if(res === true) manualReloadTable()})
                    case 'edit':
                        return editRef.current?.save().then((res)=>{if(res === true) manualReloadTable()})
                    case 'delete':
                        return deleteWebhook(entity!).then((res)=>{if(res === true) manualReloadTable()})
                }
            },
            width:900,
            okText:'确认',
            okButtonProps:{
                disabled : !checkAccess(`system.webhook.self.${type}` as (keyof typeof PERMISSION_DEFINITION[0]), accessData)
            },
            cancelText:'取消',
            closable:true,
            icon:<></>,
        })
    }

    const operation:ProColumns<WebhookTableListItem>[] =[
        {
            title: '操作',
            key: 'option',
            width: 93,
            valueType: 'option',
            render: (_: React.ReactNode, entity: WebhookTableListItem) =>
                    [<TableBtnWithPermission  access="" key="view"  onClick={()=>{openModal('edit',entity)}} btnTitle="查看"/>,
                    <Divider type="vertical" className="mx-0"  key="div1"/>,
                    <TableBtnWithPermission  access="" key="delete" onClick={()=>{openModal('delete',entity)}} btnTitle="删除"/>]
        }
    ]

    
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

    useEffect(() => {
        setBreadcrumb([
            {title:'Webhook 管理'}
        ])
        getMemberList()
    }, []);

    
    const columns = useMemo(()=>{
        return WEBHOOK_TABLE_COLUMNS.map(x=>{if(x.filters &&((x.dataIndex as string[])?.indexOf('updater') !== -1) ){x.valueEnum = memberValueEnum} return x})
    },[memberValueEnum])

    return (
        <PageList
            id="global_webhook"
            ref={pageListRef}
            columns = {[...columns,...operation]}
            request={()=>getWebhookList()}
            primaryKey="uuid"
            showPagination={false}
            addNewBtnTitle="添加 Webhook"
            onAddNewBtnClick={()=>{openModal('add')}}
            onRowClick={(row:WebhookTableListItem)=>openModal('edit',row)}
        />
    )

}