import PageList from "@common/components/aoplatform/PageList.tsx";
import {App, Divider, Spin} from "antd";
import  {useEffect, useRef, useState} from "react";
import { useLocation, useOutletContext, useParams} from "react-router-dom";
import {useBreadcrumb} from "@common/contexts/BreadcrumbContext.tsx";
import {ActionType, ParamsType, ProColumns} from "@ant-design/pro-components";
import {RouterParams} from "@core/components/aoplatform/RenderRoutes.tsx";
import {DefaultOptionType} from "antd/es/cascader";
import {IntelligentPluginConfig, IntelligentPluginConfigHandle} from "./IntelligentPluginConfig.tsx";
import {BasicResponse, STATUS_CODE} from "@common/const/const.ts";
import {useFetch} from "@common/hooks/http.ts";
import {EntityItem} from "@common/const/type.ts";
import WithPermission from "@common/components/aoplatform/WithPermission.tsx";
import TableBtnWithPermission from "@common/components/aoplatform/TableBtnWithPermission.tsx";
import { DrawerWithFooter } from "@common/components/aoplatform/DrawerWithFooter.tsx";
import { LoadingOutlined } from "@ant-design/icons";

 type DynamicTableField = {
    name: string,
    title: string,
    attr: string,
    enum: Array<string>
}

 type DynamicDriverData = {
    name:string, title:string
}

export type DynamicTableConfig = {
    basic:{
        id:string,
        name: string,
        title: string,
        drivers: Array<DynamicDriverData>,
        fields: Array<DynamicTableField>,
    }
    list: Array<DynamicTableItem>,
    total:number
}

export type DynamicRender = {
    render:unknown,
    basic:{
        id:string,
        name:string,
        title:string
    }
}

export type DynamicPublishCluster = {
    name:string,
    title:string,
    status:string,
    updater:EntityItem,
    update_time:string,
    checked?:boolean
}

export type DynamicPublishData = {
    id:string,
    name:string,
    title:string,
    description:string
    clusters:DynamicPublishCluster[]
}

export type DynamicTableItem = {[k:string]:unknown}

export const StatusColorClass = {
    "已发布":'text-[#03a9f4]',
    "待发布":'text-[#46BE11]',
    "未发布":'text-[#03a9f4]'
}


export type DynamicPublish = {
    code:number,
    msg:string,
    data:{
        success:Array<string>,
        fail:Array<string>
    }
}

export default function IntelligentPluginList(){
    const { modal,message } = App.useApp()
    const [searchWord, setSearchWord] = useState<string>('')
    const { moduleId }  = useParams<RouterParams>();
    const [pluginName,setPluginName] = useState<string>('-')
    const [partitionOptions] = useState<DefaultOptionType[]>([{label:'default', value:'default'}])
    const { setBreadcrumb } = useBreadcrumb()
    const [renderSchema ,setRenderSchema] = useState<{[k:string]:unknown}>({})
    const drawerFormRef = useRef<IntelligentPluginConfigHandle>(null);
    const [driverOptions, setDriverOptions] = useState<DefaultOptionType[]>([])
    const [tableListDataSource, setTableListDataSource] = useState<DynamicTableItem[]>([]);

    const [tableHttpReload, setTableHttpReload] = useState(true);
    const [columns,setColumns] = useState<ProColumns<DynamicTableItem>[] >([])
    const {fetchData} = useFetch()
    const pageListRef = useRef<ActionType>(null);
    const [publishBtnLoading, setPublishBtnLoading] = useState<boolean>(false)
    const [curDetail,setCurDetail] = useState<{[k: string]: unknown;}|undefined>()
    const [drawerType, setDrawerType]  = useState<'add'|'edit'>('add')
    const [drawerOpen, setDrawerOpen] = useState<boolean>(false)
    const [drawerLoading, setDrawerLoading] = useState<boolean>(false)
    const location = useLocation().pathname
    const {accessPrefix} = useOutletContext<{accessPrefix:string}>()


    const getIntelligentPluginTableList=(params:ParamsType & {
        pageSize?: number | undefined;
        current?: number | undefined;
        keyword?: string | undefined;
    }): Promise<{ data: DynamicTableItem[], success: boolean }>=> {
        if(!tableHttpReload){
            setTableHttpReload(true)
            return Promise.resolve({
                data: tableListDataSource,
                success: true,
            });
        }
        const query = {
            page:params.current,
            pageSize:params.pageSize,
            keyword:searchWord,
        }
        return fetchData<BasicResponse<DynamicTableConfig>>(
            `dynamic/${moduleId}/list`,
            {method:'GET',eoParams:query,eoTransformKeys:['pageSize']}).then((res)=>{
                message.destroy(); 
                if(res.code === STATUS_CODE.SUCCESS){
                    getConfig(res.data) 
                    setColumns(res.data.basic.fields.map((field:DynamicTableField, index:number)=>({
                            title:field.title,
                            dataIndex:field.name,
                            fixed:field.name === 'title' ? 'left' : undefined,
                            ellipsis:true,
                            width:field.name === 'title' ? 150 : undefined, 
                            ...(field.enum?.length > 0 ?{
                                onFilter: (value: string, record: { [x: string]: string | string[]; }) => record[field.name].indexOf(value) === 0,
                                filters:field.enum?.map((x:string)=>{return {text:x, value:x}}),
                                render:(_: unknown, entity: { [x: string]: string; })=> {
                                    return <span className={StatusColorClass[entity[field.name] as keyof typeof StatusColorClass]}>{(entity[field.name] as string)}</span>                        
                                },
                            }:{}),
                    })))
                    setTableListDataSource(res.data.list);
                    return ({ data: res.data.list, success: true,total:res.data.total });
                }else{
                    setTableListDataSource([]);
                    return ({ data: [], success: false });
                }
            }).catch((e)=>{console.warn(e);
                return ({ data: [], success: false });})
    }

    const getConfig = (data:DynamicTableConfig)=>{
        const {basic,list } = data
        const {title,drivers} = basic
        
        setBreadcrumb([
            {title:location.includes('resourcesettings') ? '资源配置': '日志配置'},
            {
                title
            }
        ])
        
        setPluginName(title)
        setDriverOptions(drivers?.map((driver:DynamicDriverData) => {
            return { label: driver.title, value: driver.name }
        }) || [])
        
    }

    const getRender = ()=>{
        return fetchData<BasicResponse<DynamicRender>>(`dynamic/${moduleId}/render`,{method:'GET'}).then((resp) => {
            if (resp.code === STATUS_CODE.SUCCESS) {
                setRenderSchema(resp.data.render)
                return Promise.resolve(resp.data.render)
            }
            return Promise.reject(resp.msg || '操作失败')
        })
    }

    const operation:ProColumns<DynamicTableItem>[] =[
        {
            title: '操作',
            key: 'option',
            width: 150,
            fixed:'right',
            valueType: 'option',
            render: (_: React.ReactNode, entity: DynamicTableItem) => [
                <TableBtnWithPermission  access={`${accessPrefix}.publish`} key="publish" onClick={()=>{openModal('publish',entity)}} btnTitle={entity.status === '已发布' ? '下线' : '上线'}/>,
                <Divider type="vertical" className="mx-0"  key="div1"/>,
                <TableBtnWithPermission  access={`${accessPrefix}.view`} key="edit" onClick={()=>{openDrawer('edit',entity)}} btnTitle="查看"/>,
                <Divider type="vertical" className="mx-0"  key="div2"/>,
                <TableBtnWithPermission  access={`${accessPrefix}.delete`}  key="delete" onClick={()=>{openModal('delete',entity)}} btnTitle="删除"/>,
            ],
        }
    ]
    const handleClusterChange = (e:string[])=>{
        setTableHttpReload(true)
        pageListRef.current?.reload()
    }

    const manualReloadTable = () => {
        setTableHttpReload(true); // 表格数据需要从后端接口获取
        pageListRef.current?.reload()
    };

    const deleteInstance = (entity:DynamicTableItem)=>{
        return new Promise((resolve, reject)=>{
            fetchData<BasicResponse<null>>(`dynamic/${moduleId}/batch`,{method:'DELETE',eoParams:{ids:JSON.stringify([entity!.id])}}).then(response=>{
                const {code,msg} = response
                if(code === STATUS_CODE.SUCCESS){
                    message.success(msg || '操作成功！')
                    resolve(true)
                }else{
                    message.error(msg || '操作失败')
                    reject(msg || '操作失败')
                }
            })
        })
    }

    const openDrawer = async (type:'add'|'edit', entity?:DynamicTableItem)=>{
        switch (type){
            case 'add':
                setCurDetail({driver:driverOptions[0].value || '',config:{}})
                break;
            case 'edit':{
                setDrawerLoading(true)
                fetchData<BasicResponse<{info:DynamicTableItem}>>(
                    `dynamic/${moduleId}/info`,
                    {method:'GET',eoParams:{id:entity!.id}}).then((res)=>{
                        const {code, data, msg } = res
                        if(code === STATUS_CODE.SUCCESS){
                            if(data.info.config){
                            }
                            setCurDetail(data.info)
                        }else{
                            message.error(msg || '操作失败')
                        }
                    }).finally(()=>setDrawerLoading(false))
                break;
            }
        }
        setDrawerType(type)
        setDrawerOpen(true)
    }

    const openModal = async (type:'publish'|'delete', entity?:DynamicTableItem)=>{
        let title:string = ''
        let content:string|React.ReactNode = ''
        switch (type){
            case 'publish':{
                message.loading('正在操作')
                await fetchData<BasicResponse<DynamicPublish>>(`dynamic/${moduleId}/${entity!.status === '已发布' ? 'offline':'online'}`, {
                    method: 'PUT',
                    eoParams:{id:entity!.id},
                }).then(response => {
                    const {code, msg} = response
                    if (code === STATUS_CODE.SUCCESS) {
                        message.success(msg || '操作成功！')
                        return Promise.resolve(true)
                    } else {
                        message.error(msg || '操作失败')
                        return Promise.reject(msg || '操作失败')
                    }
                }).catch((errorInfo)=> Promise.reject(errorInfo))
                message.destroy()
                return;}
            case 'delete':
                title='删除'
                content=<span>确定删除<span className="text-status_fail"></span>？此操作无法恢复，确认操作？</span>
                break;
        }

       modal.confirm({
            title,
            content,
            onOk:()=>{
                switch (type){ // case 'publish':
                    //     return editRef.current?.save().then((res)=>{if(res === true) manualReloadTable()})
                    case 'delete':
                        return deleteInstance(entity!).then((res)=>{if(res === true) manualReloadTable()})
                }
            },
            width: type === 'delete'? 600 : 900,
            okText:'确认',
            okButtonProps:{
                disabled:false
            },
            cancelText:'取消',
            closable:true,
            icon:<></>,
            footer:(_, { OkBtn, CancelBtn }) =>{
                return (
                        <>
                            <WithPermission access=""><CancelBtn/></WithPermission>
                            <WithPermission access=""><OkBtn/></WithPermission>
                        </>
                );
            },
        })
    }

    useEffect(() => {
        getRender()
        pageListRef.current?.reload()
    }, [moduleId]);


    return (<>
    <PageList
            ref={pageListRef}
            columns = {[...columns,...operation]}
            request={(params)=>getIntelligentPluginTableList(params)}
            addNewBtnTitle={`添加${pluginName}`}
            searchPlaceholder={`搜索${pluginName}名称`}
            onChange={() => {
                setTableHttpReload(false)
            }}
            addNewBtnAccess={`${accessPrefix}.add`} 
            onAddNewBtnClick={()=>{openDrawer('add')}}
            onSearchWordChange={(e)=>{setSearchWord(e.target.value);setTableHttpReload(true);setTableHttpReload(true)}}
        />
        
        <DrawerWithFooter title={`${drawerType === 'add' ? '添加' : '编辑'}${pluginName }`} open={drawerOpen} onClose={()=>{setCurDetail(undefined);setDrawerOpen(false)}} onSubmit={()=>drawerFormRef.current?.save()?.then((res)=>{res && manualReloadTable();return res})}  submitAccess=''>
            <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin/>} spinning={drawerLoading}>
                <IntelligentPluginConfig 
                    ref={drawerFormRef!} 
                    type={drawerType} 
                    renderSchema={renderSchema} 
                    tabData={partitionOptions}
                    moduleId={moduleId!} 
                    driverSelectionOptions={driverOptions}  
                    initFormValue={curDetail as { [k: string]: unknown; }} />
            </Spin>
        </DrawerWithFooter>
    </>)
}