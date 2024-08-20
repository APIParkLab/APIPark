import PageList, { PageProColumns } from "@common/components/aoplatform/PageList.tsx";
import {App, Divider, Spin} from "antd";
import  {useEffect, useRef, useState} from "react";
import { useLocation, useOutletContext, useParams} from "react-router-dom";
import {useBreadcrumb} from "@common/contexts/BreadcrumbContext.tsx";
import {ActionType, ParamsType} from "@ant-design/pro-components";
import {RouterParams} from "@core/components/aoplatform/RenderRoutes.tsx";
import {DefaultOptionType} from "antd/es/cascader";
import {IntelligentPluginConfig, IntelligentPluginConfigHandle} from "./IntelligentPluginConfig.tsx";
import {BasicResponse, COLUMNS_TITLE, DELETE_TIPS, RESPONSE_TIPS, STATUS_CODE} from "@common/const/const.tsx";
import {useFetch} from "@common/hooks/http.ts";
import {EntityItem} from "@common/const/type.ts";
import WithPermission from "@common/components/aoplatform/WithPermission.tsx";
import TableBtnWithPermission from "@common/components/aoplatform/TableBtnWithPermission.tsx";
import { DrawerWithFooter } from "@common/components/aoplatform/DrawerWithFooter.tsx";
import { LoadingOutlined } from "@ant-design/icons";
import { $t } from "@common/locales/index.ts";

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
    const [columns,setColumns] = useState<PageProColumns<DynamicTableItem>[] >([])
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
            {title:location.includes('resourcesettings') ? $t('资源'): $t('日志')},
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
            return Promise.reject(resp.msg || RESPONSE_TIPS.error)
        })
    }

    const operation:PageProColumns<DynamicTableItem>[] =[
        {
            title: COLUMNS_TITLE.operate,
            key: 'option',
            fixed:'right',
            valueType: 'option',
            btnNums:3,
            render: (_: React.ReactNode, entity: DynamicTableItem) => [
                <TableBtnWithPermission  access={`${accessPrefix}.publish`} key="publish" btnType="publish" onClick={()=>{openModal('publish',entity)}} btnTitle={entity.status === $t('已发布') ? $t('下线') : $t('上线')}/>,
                <Divider type="vertical" className="mx-0"  key="div1"/>,
                <TableBtnWithPermission  access={`${accessPrefix}.view`} key="edit"  btnType="edit" onClick={()=>{openDrawer('edit',entity)}} btnTitle={$t("查看")}/>,
                <Divider type="vertical" className="mx-0"  key="div2"/>,
                <TableBtnWithPermission  access={`${accessPrefix}.delete`}  key="delete"  btnType="delete"  onClick={()=>{openModal('delete',entity)}} btnTitle={$t("删除")}/>,
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
                    message.success(msg || RESPONSE_TIPS.success)
                    resolve(true)
                }else{
                    message.error(msg || RESPONSE_TIPS.error)
                    reject(msg || RESPONSE_TIPS.error)
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
                            message.error(msg || RESPONSE_TIPS.error)
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
                message.loading(RESPONSE_TIPS.operating)
                await fetchData<BasicResponse<DynamicPublish>>(`dynamic/${moduleId}/${entity!.status === $t('已发布') ? 'offline':'online'}`, {
                    method: 'PUT',
                    eoParams:{id:entity!.id},
                }).then(response => {
                    const {code, msg} = response
                    if (code === STATUS_CODE.SUCCESS) {
                        message.success(msg || RESPONSE_TIPS.success)
                        return Promise.resolve(true)
                    } else {
                        message.error(msg || RESPONSE_TIPS.error)
                        return Promise.reject(msg || RESPONSE_TIPS.error)
                    }
                }).catch((errorInfo)=> Promise.reject(errorInfo))
                message.destroy()
                return;}
            case 'delete':
                title='删除'
                content=<span>{DELETE_TIPS.default}</span>
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
            okText:$t('确认'),
            okButtonProps:{
                disabled:false
            },
            cancelText:$t('取消'),
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
            addNewBtnTitle={$t('添加(0)',[$t(pluginName)])}
            searchPlaceholder={$t('搜索(0)名称',[$t(pluginName)])}
            onChange={() => {
                setTableHttpReload(false)
            }}
            addNewBtnAccess={`${accessPrefix}.add`} 
            onAddNewBtnClick={()=>{openDrawer('add')}}
            onSearchWordChange={(e)=>{setSearchWord(e.target.value);setTableHttpReload(true);setTableHttpReload(true)}}
        />
        
        <DrawerWithFooter title={`${drawerType === 'add' ? $t('添加') : $t('编辑')}${pluginName }`} open={drawerOpen} onClose={()=>{setCurDetail(undefined);setDrawerOpen(false)}} onSubmit={()=>drawerFormRef.current?.save()?.then((res)=>{res && manualReloadTable();return res})}  submitAccess=''>
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