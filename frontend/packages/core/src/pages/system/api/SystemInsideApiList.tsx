import PageList, { PageProColumns } from "@common/components/aoplatform/PageList.tsx"
import {ActionType} from "@ant-design/pro-components";
import  {FC, useEffect, useMemo, useRef, useState} from "react";
import {Link, useParams} from "react-router-dom";
import {useBreadcrumb} from "@common/contexts/BreadcrumbContext.tsx";
import {App, Divider} from "antd";
import {BasicResponse, COLUMNS_TITLE, DELETE_TIPS, RESPONSE_TIPS, STATUS_CODE} from "@common/const/const.tsx";
import { SimpleMemberItem} from '@common/const/type.ts'
import {useFetch} from "@common/hooks/http.ts";
import {RouterParams} from "@core/components/aoplatform/RenderRoutes.tsx";
import SystemInsideApiCreate from "./SystemInsideApiCreate.tsx";
import {useSystemContext} from "../../../contexts/SystemContext.tsx";
import { SYSTEM_API_TABLE_COLUMNS } from "../../../const/system/const.tsx";
import { SystemApiSimpleFieldType, SystemApiTableListItem, SystemInsideApiCreateHandle, SystemInsideApiDocumentHandle } from "../../../const/system/type.ts";
import TableBtnWithPermission from "@common/components/aoplatform/TableBtnWithPermission.tsx";
import { useGlobalContext } from "@common/contexts/GlobalStateContext.tsx";
import { checkAccess } from "@common/utils/permission.ts";
import { DrawerWithFooter } from "@common/components/aoplatform/DrawerWithFooter.tsx";
import SystemInsideApiDetail from "./SystemInsideApiDetail.tsx";
import SystemInsideApiDocument from "./SystemInsideApiDocument.tsx";
import { $t } from "@common/locales/index.ts";

const SystemInsideApiList:FC = ()=>{
    const [searchWord, setSearchWord] = useState<string>('')
    const { setBreadcrumb } = useBreadcrumb()
    const { modal,message } = App.useApp()
    // const [confirmLoading, setConfirmLoading] = useState(false);
    const [init, setInit] = useState<boolean>(true)
    const [tableListDataSource, setTableListDataSource] = useState<SystemApiTableListItem[]>([]);
    const [tableHttpReload, setTableHttpReload] = useState(true);
    const {fetchData} = useFetch()
    const pageListRef = useRef<ActionType>(null);
    const copyRef = useRef<SystemInsideApiCreateHandle>(null)
    const {apiPrefix, prefixForce} = useSystemContext()
    const [memberValueEnum, setMemberValueEnum] = useState<SimpleMemberItem[]>([])
    const {accessData,state} = useGlobalContext()
    const [drawerType,setDrawerType]= useState<'add'|'edit'|'view'|'upstream'|undefined>()
    const [open, setOpen] = useState(false);
    const drawerEditFormRef = useRef<SystemInsideApiDocumentHandle>(null)
    const drawerAddFormRef = useRef<SystemInsideApiCreateHandle>(null)
    const {serviceId, teamId}  = useParams<RouterParams>()

    const [curApi, setCurApi] = useState<SystemApiTableListItem>()

    const getApiList = (): Promise<{ data: SystemApiTableListItem[], success: boolean }>=> {
        //console.log(sorter, filter)
        if(!tableHttpReload){
            setTableHttpReload(true)
            return Promise.resolve({
                data: tableListDataSource,
                success: true,
            });
        }

        return fetchData<BasicResponse<{apis:SystemApiTableListItem}>>('service/apis',{method:'GET',eoParams:{service:serviceId,team:teamId, keyword:searchWord},eoTransformKeys:['request_path','create_time','update_time','can_delete']}).then(response=>{
            const {code,data,msg} = response
            if(code === STATUS_CODE.SUCCESS){
                setTableListDataSource(data.apis)
                setInit((prev)=>prev ? false : prev)
                setTableHttpReload(false)
                return  {data:data.apis, success: true}
            }else{
                message.error(msg || $t(RESPONSE_TIPS.error))
                return {data:[], success:false}
            }
        }).catch(() => {
            return {data:[], success:false}
        })
    }

    const deleteApi = (entity:SystemApiTableListItem)=>{
        return new Promise((resolve, reject)=>{
            fetchData<BasicResponse<null>>('service/api',{method:'DELETE',eoParams:{service:serviceId,team:teamId, api:entity!.id}}).then(response=>{
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

    const openModal = async (type:'copy' | 'delete',entity:SystemApiTableListItem) =>{
        let title:string = ''
        let content:string|React.ReactNode = ''
        switch (type){
            case 'copy':{
                title=$t('复制 API')
                message.loading($t(RESPONSE_TIPS.loading))
                const {code,data,msg} = await fetchData<BasicResponse<{api:SystemApiSimpleFieldType}>>('service/api/detail/simple',{method:'GET',eoParams:{service:serviceId,team:teamId, api:entity!.id}})
                message.destroy()
                if(code === STATUS_CODE.SUCCESS){
                    content=<SystemInsideApiCreate ref={copyRef} type={type} entity={{...data.api, path:(data.api.path?.startsWith('/')? data.api.path.substring(1): data.api.path),serviceId:serviceId}} serviceId={serviceId!} teamId={teamId!} modalApiPrefix={apiPrefix} modalPrefixForce={prefixForce}/>
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
                    case 'copy':
                        return copyRef.current?.copy().then(()=> {
                            manualReloadTable()
                        })
                    case 'delete':
                        return deleteApi(entity).then((res)=>{if(res === true) manualReloadTable()})
                }
            },
            width:type==='copy'? 900: 600,
            okText:$t('确认'),
            okButtonProps:{
                disabled : !checkAccess( `team.service.api.${type}`, accessData )
            },
            cancelText:$t('取消'),
            closable:true,
            icon:<></>,
        })
    }

    const operation:PageProColumns<SystemApiTableListItem>[] =[
        {
            title: COLUMNS_TITLE.operate,
            key: 'option',
            btnNums:4,
            fixed:'right',
            valueType: 'option',
            render: (_: React.ReactNode, entity: SystemApiTableListItem) => [
                <TableBtnWithPermission  access="team.service.api.view" key="view"  btnType="view"  onClick={()=>{openDrawer('view',entity)}} btnTitle="详情"/>,
                <Divider type="vertical" className="mx-0"  key="div1" />,
                <TableBtnWithPermission  access="team.service.api.copy" key="copy"  btnType="copy"   onClick={()=>{openModal('copy',entity)}} btnTitle="复制"/>,
                <Divider type="vertical" className="mx-0"  key="div2"/>,
                <TableBtnWithPermission  access="team.service.api.edit" key="edit"  btnType="edit"  onClick={()=>{openDrawer('edit',entity)}}  btnTitle="编辑"/>,
                entity.canDelete && <Divider type="vertical" className="mx-0"  key="div3"/>,
                entity.canDelete && <TableBtnWithPermission  access="team.service.api.delete" key="delete"   btnType="delete"  onClick={()=>{openModal('delete',entity)}} btnTitle="删除"/>,
            ],
        }
    ]

    const manualReloadTable = () => {
        setTableHttpReload(true); // 表格数据需要从后端接口获取
        pageListRef.current?.reload()
    };
    
    const getMemberList = async ()=>{
        setMemberValueEnum([])
        const {code,data,msg}  = await fetchData<BasicResponse<{ members: SimpleMemberItem[] }>>('simple/member',{method:'GET'})
        if(code === STATUS_CODE.SUCCESS){
            setMemberValueEnum(data.members)
        }else{
            message.error(msg || $t(RESPONSE_TIPS.error))
        }
    }

    const openDrawer = (type:'add'|'edit'|'view',entity?:SystemApiTableListItem)=>{
        setCurApi(entity)
        setDrawerType(type)
    }

    useEffect(()=>{drawerType !== undefined ? setOpen(true):setOpen(false)},[drawerType])

    useEffect(() => {
        setBreadcrumb([
            {
                title:<Link to={`/service/list`}>{$t('服务')}</Link>
            },
            {
                title:$t('API')
            }
        ])
        getMemberList()
        manualReloadTable()
    }, [serviceId]);

    const onClose = () => {
        setDrawerType(undefined);
        setCurApi(undefined)
      };
    
    const columns = useMemo(()=>{
        return [...SYSTEM_API_TABLE_COLUMNS].map(x=>{
            if(x.filters &&((x.dataIndex as string[])?.indexOf('creator') !== -1) ){
                const tmpValueEnum:{[k:string]:{text:string}} = {}
                memberValueEnum?.forEach((x:SimpleMemberItem)=>{
                    tmpValueEnum[x.name] = {text:x.name}
                })
                x.valueEnum = tmpValueEnum
            }
            return {...x,title:typeof x.title  === 'string' ? $t(x.title as string) : x.title}})
    },[memberValueEnum,state.language])

    const handlerSubmit:() => Promise<string | boolean>|undefined= ()=>{
        switch(drawerType){
            case 'add':{
                return drawerAddFormRef.current?.save()?.then((res)=>{res && manualReloadTable();return res})
            }
            case 'edit':{
                return drawerEditFormRef.current?.save()?.then((res)=>{res && manualReloadTable();return res})
            }
            default:return undefined
        }
    }

    return (
        <>
            <PageList
                id="global_system_api"
                ref={pageListRef}
                columns = {[...columns,...operation]}
                request={()=>getApiList()}
                dataSource={tableListDataSource}
                addNewBtnTitle={$t('添加 API')}
                searchPlaceholder={$t('输入名称、URL 查找 API')}
                onAddNewBtnClick={()=>{openDrawer('add')}}
                addNewBtnAccess="team.service.api.add"
                tableClickAccess="team.service.api.view"
                manualReloadTable={manualReloadTable}
                onSearchWordChange={(e)=>{setSearchWord(e.target.value)}}
                onChange={() => {
                    setTableHttpReload(false)
                }}
                onRowClick={(row:SystemApiTableListItem)=>openDrawer('view',row)}
                tableClass="mr-PAGE_INSIDE_X "
                />
                <DrawerWithFooter 
                    title={drawerType === 'add' ? $t("添加 API"):$t("API 详情")} 
                    open={open} 
                    onClose={onClose} 
                    onSubmit={()=>handlerSubmit()} 
                    showOkBtn={drawerType !== 'view'} 
                    >
                        {drawerType === 'add' && <SystemInsideApiCreate ref={drawerAddFormRef}  modalApiPrefix={apiPrefix} serviceId={serviceId!} teamId={teamId!} modalPrefixForce={prefixForce}/>}
                        {drawerType === 'edit' && <SystemInsideApiDocument ref={drawerEditFormRef} serviceId={serviceId!} teamId={teamId!} apiId={curApi!.id!}/>}
                        {drawerType === 'view' && <SystemInsideApiDetail serviceId={serviceId!}  teamId={teamId!}  apiId={curApi!.id!}/>}
                </DrawerWithFooter>
        </>
    )

}
export default SystemInsideApiList