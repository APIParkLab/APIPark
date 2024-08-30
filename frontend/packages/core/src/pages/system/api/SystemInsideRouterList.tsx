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
import SystemInsideRouterCreate from "./SystemInsideRouterCreate.tsx";
import {useSystemContext} from "../../../contexts/SystemContext.tsx";
import { SYSTEM_API_TABLE_COLUMNS } from "../../../const/system/const.tsx";
import {SystemApiTableListItem, SystemInsideRouterCreateHandle, SystemInsideApiDocumentHandle } from "../../../const/system/type.ts";
import TableBtnWithPermission from "@common/components/aoplatform/TableBtnWithPermission.tsx";
import { useGlobalContext } from "@common/contexts/GlobalStateContext.tsx";
import { checkAccess } from "@common/utils/permission.ts";
import { DrawerWithFooter } from "@common/components/aoplatform/DrawerWithFooter.tsx";
import { $t } from "@common/locales/index.ts";

const SystemInsideRouterList:FC = ()=>{
    const [searchWord, setSearchWord] = useState<string>('')
    const { setBreadcrumb } = useBreadcrumb()
    const { modal,message } = App.useApp()
    const [tableListDataSource, setTableListDataSource] = useState<SystemApiTableListItem[]>([]);
    const [tableHttpReload, setTableHttpReload] = useState(true);
    const {fetchData} = useFetch()
    const pageListRef = useRef<ActionType>(null);
    const {apiPrefix, prefixForce} = useSystemContext()
    const [memberValueEnum, setMemberValueEnum] = useState<SimpleMemberItem[]>([])
    const {accessData,state} = useGlobalContext()
    const [drawerType,setDrawerType]= useState<'add'|'edit'|'view'|'upstream'|undefined>()
    const [open, setOpen] = useState(false);
    const drawerAddFormRef = useRef<SystemInsideRouterCreateHandle>(null)
    const {serviceId, teamId}  = useParams<RouterParams>()

    const [curApi, setCurApi] = useState<SystemApiTableListItem>()

    const getRoutesList = (): Promise<{ data: SystemApiTableListItem[], success: boolean }>=> {
        //console.log(sorter, filter)
        if(!tableHttpReload){
            setTableHttpReload(true)
            return Promise.resolve({
                data: tableListDataSource,
                success: true,
            });
        }

        return fetchData<BasicResponse<{routers:SystemApiTableListItem}>>('service/routers',{method:'GET',eoParams:{service:serviceId,team:teamId, keyword:searchWord},eoTransformKeys:['request_path','create_time','update_time','is_disable']}).then(response=>{
            const {code,data,msg} = response
            if(code === STATUS_CODE.SUCCESS){
                setTableListDataSource(data.routers)
                setTableHttpReload(false)
                return  {data:data.routers, success: true}
            }else{
                message.error(msg || $t(RESPONSE_TIPS.error))
                return {data:[], success:false}
            }
        }).catch(() => {
            return {data:[], success:false}
        })
    }

    const deleteRoute = (entity:SystemApiTableListItem)=>{
        return new Promise((resolve, reject)=>{
            fetchData<BasicResponse<null>>('service/router',{method:'DELETE',eoParams:{service:serviceId,team:teamId, router:entity!.id}}).then(response=>{
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

    const openModal = async (type: 'delete',entity:SystemApiTableListItem) =>{
        let title:string = ''
        let content:string|React.ReactNode = ''
        switch (type){
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
                    case 'delete':
                        return deleteRoute(entity).then((res)=>{if(res === true) manualReloadTable()})
                }
            },
            width:600,
            okText:$t('确认'),
            okButtonProps:{
                disabled : !checkAccess( `team.service.router.${type}`, accessData )
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
            btnNums:2,
            fixed:'right',
            valueType: 'option',
            render: (_: React.ReactNode, entity: SystemApiTableListItem) => [
                <TableBtnWithPermission  access="team.service.router.edit" key="edit"  btnType="edit"  onClick={()=>{openDrawer('edit',entity)}}  btnTitle="编辑"/>,
                 <Divider type="vertical" className="mx-0"  key="div3"/>,
                 <TableBtnWithPermission  access="team.service.router.delete" key="delete"   btnType="delete"  onClick={()=>{openModal('delete',entity)}} btnTitle="删除"/>,
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
                title:$t('路由')
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
            
            if(x.filters &&((x.dataIndex as string[])?.indexOf('isDisabled') !== -1) ){
                x.valueEnum = {
                    true:{text:<span className="text-status_fail">{$t('拦截')}</span>},
                    false:{text:<span className="text-status_success">{$t('放行')}</span>}
                }
            }
            return {...x,title:typeof x.title  === 'string' ? $t(x.title as string) : x.title}})
    },[memberValueEnum,state.language])

    const handlerSubmit:() => Promise<string | boolean>|undefined= ()=>{
        switch(drawerType){
            case 'add':{
                return drawerAddFormRef.current?.save()?.then((res)=>{res && manualReloadTable();return res})
            }
            case 'edit':{
                return drawerAddFormRef.current?.save()?.then((res)=>{res && manualReloadTable();return res})
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
                request={()=>getRoutesList()}
                dataSource={tableListDataSource}
                addNewBtnTitle={$t('添加路由')}
                searchPlaceholder={$t('输入名称、URL 查找路由')}
                onAddNewBtnClick={()=>{openDrawer('add')}}
                addNewBtnAccess="team.service.router.add"
                tableClickAccess="team.service.router.view"
                manualReloadTable={manualReloadTable}
                onSearchWordChange={(e)=>{setSearchWord(e.target.value)}}
                onChange={() => {
                    setTableHttpReload(false)
                }}
                onRowClick={(row:SystemApiTableListItem)=>openDrawer('view',row)}
                tableClass="mr-PAGE_INSIDE_X "
                />
                <DrawerWithFooter 
                    title={drawerType === 'add' ? $t("添加路由"):$t("路由详情")} 
                    open={open} 
                    onClose={onClose} 
                    onSubmit={()=>handlerSubmit()} 
                    showOkBtn={drawerType !== 'view'} 
                    >
                         <SystemInsideRouterCreate ref={drawerAddFormRef} type={drawerType as 'add'|'edit'|'copy'}  entity={drawerType === 'edit' ? curApi : undefined} modalApiPrefix={apiPrefix} serviceId={serviceId!} teamId={teamId!} modalPrefixForce={prefixForce}/>
                </DrawerWithFooter>
        </>
    )

}
export default SystemInsideRouterList