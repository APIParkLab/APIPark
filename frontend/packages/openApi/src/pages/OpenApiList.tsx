import PageList from "@common/components/aoplatform/PageList.tsx";
import  {useEffect, useRef, useState} from "react";
import {ActionType, ProColumns} from "@ant-design/pro-components";
import {useBreadcrumb} from "@common/contexts/BreadcrumbContext.tsx";
import { App, Divider, Switch} from "antd";
import copy from "copy-to-clipboard";
import {useFetch} from "@common/hooks/http.ts";
import {BasicResponse, STATUS_CODE} from "@common/const/const.ts";
import {OpenApiConfig, OpenApiConfigFieldType, OpenApiConfigHandle} from "./OpenApiConfig.tsx";
import { EntityItem } from "@common/const/type.ts";
import { SimpleMemberItem } from "@common/const/type.ts";
import TableBtnWithPermission from "@common/components/aoplatform/TableBtnWithPermission.tsx";
import { frontendTimeSorter } from "@common/utils/dataTransfer.ts"; 

type OpenApiTableListItem = {
    id:string;
    name: string;
    token:string;
    tags:string;
    status:boolean;
    operator:EntityItem;
    updateTime:string;
};

const OPENAPI_LIST_COLUMNS: ProColumns<OpenApiTableListItem>[] = [
    {
        title: '应用名称',
        dataIndex: 'name',
        ellipsis:true,
        width:160,
        fixed:'left'
    },
    {
        title: '应用 ID',
        dataIndex: 'id',
        ellipsis:true,
        width: 140,
    },
    {
        title: '鉴权 Token',
        dataIndex: 'token',
        ellipsis:{
            showTitle:true
        }
    },
    {
        title: '关联标签',
        dataIndex: 'tag'
    },
    {
        title: '启用',
        dataIndex: 'status'
    },
    {
        title: '更新者',
        dataIndex: ['operator','name'],
        filters: true,
        onFilter: true,
        valueType: 'select',
        filterSearch: true
    },
    {
        title: '更新时间',
        width:182,
        dataIndex: 'updateTime',
        sorter: (a,b)=>(new Date(a.updateTime)).getTime() - (new Date(b.updateTime)).getTime()
    }
];


export default function OpenApiList(){
    const { modal,message } = App.useApp()
    // const [confirmLoading, setConfirmLoading] = useState(false);
    const [init, setInit] = useState<boolean>(true)
    const [tableListDataSource, setTableListDataSource] = useState<OpenApiTableListItem[]>([]);
    const [tableHttpReload, setTableHttpReload] = useState(true);
    const [columns,setColumns] = useState<ProColumns<OpenApiTableListItem>[] >([])
    const pageListRef = useRef<ActionType>(null);
    const addOpenApiRef = useRef<OpenApiConfigHandle>(null)
    const editOpenApiRef = useRef<OpenApiConfigHandle>(null)
    const {fetchData} = useFetch()
    const { setBreadcrumb } = useBreadcrumb()
    const [memberValueEnum, setMemberValueEnum] = useState<{[k:string]:{text:string}}>({})

    const operation:ProColumns<OpenApiTableListItem>[] =[
        {
            title: '操作',
            key: 'option',
            width: 266,
            valueType: 'option',
            fixed:'right',
            render: (_: React.ReactNode, entity: OpenApiTableListItem) => [
                <TableBtnWithPermission  access="system.openapi.self.updateToken" key="refreshToken" onClick={()=>{refreshToken(entity)}} btnTitle="更新token"/>,
                <Divider type="vertical" className="mx-0"  key="div1"/>,
                <TableBtnWithPermission  access="system.openapi.self.view" key="copyToken" onClick={()=>{copyToken(entity)}} btnTitle="复制token"/>,
                <Divider type="vertical" className="mx-0"  key="div2"/>,
                <TableBtnWithPermission  access="system.openapi.self.edit" key="edit"  onClick={()=>{openModal('edit',entity)}} btnTitle="编辑"/>,
                <Divider type="vertical" className="mx-0"  key="div3"/>,
                <TableBtnWithPermission  access="system.openapi.self.delete" key="delete" onClick={()=>{openModal('delete',entity)}} btnTitle="删除"/>
            ],
        }
    ]

    const getOpenApiList =(): Promise<{ data: OpenApiTableListItem[], success: boolean }>=> {
        if(!tableHttpReload){
            setTableHttpReload(true)
            return Promise.resolve({
                data: tableListDataSource,
                success: true,
            });
        }
        return fetchData<BasicResponse<{apps:OpenApiTableListItem}>>('external-apps',{method:'GET',eoTransformKeys:['update_time']}).then(response=>{
            const {code,data,msg} = response
            if(code === STATUS_CODE.SUCCESS){
                setTableListDataSource(data.apps)
                setInit((prev)=>prev ? false : prev)
                tableHttpReload && data.apps.sort((a:OpenApiTableListItem,b:OpenApiTableListItem)=>frontendTimeSorter(a,b,'updateTime'))
                setTableHttpReload(false)
                return  {data:data.apps, success: true}
            }else{
                message.error(msg || '操作失败')
                return {data:[], success:false}
            }
        }).catch(() => {
            return {data:[], success:false}
        })
    }

    const refreshToken = (entity: OpenApiTableListItem)=>{
        fetchData<BasicResponse<null>>('external-app/token',{method:'PUT',eoParams:{id:entity.id}}).then(response=>{
            const {code,msg} = response
            if(code === STATUS_CODE.SUCCESS){
                message.success(msg || '操作成功！')
                manualReloadTable()
            }else{
                message.error(msg || '操作失败')
            }
        })
    }

    const copyToken = (entity: OpenApiTableListItem)=>{
        if(copy(entity.token)){
            message.success('复制成功')
        }else{
            message.error('复制失败，请重试')
        }
    }

    const manualReloadTable = () => {
        setTableHttpReload(true); // 表格数据需要从后端接口获取
        pageListRef.current?.reload()
    };

    const deleteOpenApi = (entity:OpenApiTableListItem)=>{
        return new Promise((resolve, reject)=>{
            fetchData<BasicResponse<null>>('external-app',{method:'DELETE',eoParams:{id:entity!.id}}).then(response=>{
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

    const openModal = async (type:'add'|'edit'|'delete',entity?:OpenApiTableListItem)=>{

        let title:string = ''
        let content:string|React.ReactNode = ''
        switch (type){
            case 'add':
                title='添加 Open Api'
                content=<OpenApiConfig ref={addOpenApiRef} type={type} />
                break;
            case 'edit':{
                title='配置 Open Api'
                message.loading('正在加载数据')
                const {code,data,msg} = await fetchData<BasicResponse<{app:OpenApiConfigFieldType}>>('external-app',{method:'GET',eoParams:{id:entity!.id}})
                message.destroy()
                if(code === STATUS_CODE.SUCCESS){
                    content=<OpenApiConfig ref={editOpenApiRef} type={type} entity={data.app}/>
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
                        return addOpenApiRef.current?.save().then((res)=>{if(res === true) manualReloadTable()})
                    case 'edit':
                        return editOpenApiRef.current?.save().then((res)=>{if(res === true) manualReloadTable()})
                    case 'delete':
                        return deleteOpenApi(entity!).then((res)=>{if(res === true) manualReloadTable()})
                }
            },
            width:600,
            okText:'确认',
            cancelText:'取消',
            closable:true,
            icon:<></>,
        })
    }

    const changeOpenApiStatus = (enabled:boolean,entity:OpenApiTableListItem)=>{
        fetchData<BasicResponse<null>>(`external-app/${enabled ? 'disable' :'enable'}`,{method:'PUT',eoParams:{id:entity.id}}).then(response=>{
            const {code,msg} = response
            if(code === STATUS_CODE.SUCCESS){
                message.success(msg || '操作成功！')
                manualReloadTable()
            }else{
                message.error(msg || '操作失败')
            }
        })
    }

    
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
        setBreadcrumb([{ title: 'Open Api'}])
        getMemberList()
        setColumns(OPENAPI_LIST_COLUMNS
                        .map((x)=>{
                            if(x.dataIndex === 'status' ){
                                x.render = (_,record)=>(
                                    <div onClick={(e)=>{e?.stopPropagation()}}><Switch value={!record.status} size="small" onChange={(e)=>{ changeOpenApiStatus(e,record)}} /></div>
                                )
                            }
                            if(x.filters &&((x.dataIndex as string[])?.indexOf('updater') !== -1 )){
                                x.valueEnum = memberValueEnum
                            }
                            return x
                        }
                )
        )
    }, []);

    return ( <PageList
        id="global_openApi"
        ref={pageListRef}
        columns={[...columns, ...operation]}
        request={()=>getOpenApiList()}
        dataSource={tableListDataSource}
        showPagination={false}
        primaryKey="id"
        addNewBtnTitle="添加应用"
        addNewBtnAccess="system.openapi.self.add"
        onChange={() => {
            setTableHttpReload(false)
        }}
        onAddNewBtnClick={() => {
            openModal('add')
        }}
        onRowClick={(row:OpenApiTableListItem)=>openModal('edit',row)}
        tableClickAccess="system.openapi.self.edit"
        />)

}