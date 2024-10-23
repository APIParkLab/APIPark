import PageList, { PageProColumns } from "@common/components/aoplatform/PageList.tsx";
import  {useEffect, useRef, useState} from "react";
import {ActionType} from "@ant-design/pro-components";
import {useBreadcrumb} from "@common/contexts/BreadcrumbContext.tsx";
import { App, Divider, Switch} from "antd";
import copy from "copy-to-clipboard";
import {useFetch} from "@common/hooks/http.ts";
import {BasicResponse, COLUMNS_TITLE, DELETE_TIPS, RESPONSE_TIPS, STATUS_CODE} from "@common/const/const.tsx";
import {OpenApiConfig, OpenApiConfigFieldType, OpenApiConfigHandle} from "./OpenApiConfig.tsx";
import { SimpleMemberItem } from "@common/const/type.ts";
import TableBtnWithPermission from "@common/components/aoplatform/TableBtnWithPermission.tsx";
import { frontendTimeSorter } from "@common/utils/dataTransfer.ts"; 
import { OPENAPI_LIST_COLUMNS } from "@market/consts/const.tsx";
import { OpenApiTableListItem } from "@market/consts/type.ts";
import { $t } from "@common/locales/index.ts";


export default function OpenApiList(){
    const { modal,message } = App.useApp()
    // const [confirmLoading, setConfirmLoading] = useState(false);
    const [init, setInit] = useState<boolean>(true)
    const [tableListDataSource, setTableListDataSource] = useState<OpenApiTableListItem[]>([]);
    const [tableHttpReload, setTableHttpReload] = useState(true);
    const [columns,setColumns] = useState<PageProColumns<OpenApiTableListItem>[] >([])
    const pageListRef = useRef<ActionType>(null);
    const addOpenApiRef = useRef<OpenApiConfigHandle>(null)
    const editOpenApiRef = useRef<OpenApiConfigHandle>(null)
    const {fetchData} = useFetch()
    const { setBreadcrumb } = useBreadcrumb()
    const [memberValueEnum, setMemberValueEnum] = useState<{[k:string]:{text:string}}>({})

    const operation:PageProColumns<OpenApiTableListItem>[] =[
        {
            title: COLUMNS_TITLE.operate,
            key: 'option',
            btnNums:4,
            valueType: 'option',
            fixed:'right',
            render: (_: React.ReactNode, entity: OpenApiTableListItem) => [
                <TableBtnWithPermission  access="system.openapi.self.updateToken" key="refresh"  btnType="refresh"   onClick={()=>{refreshToken(entity)}} btnTitle="更新token"/>,
                <Divider type="vertical" className="mx-0"  key="div1"/>,
                <TableBtnWithPermission  access="system.openapi.self.view" key="copy" btnType="copy"  onClick={()=>{copyToken(entity)}} btnTitle="复制token"/>,
                <Divider type="vertical" className="mx-0"  key="div2"/>,
                <TableBtnWithPermission  access="system.openapi.self.edit" key="edit"   btnType="edit" onClick={()=>{openModal('edit',entity)}} btnTitle="编辑"/>,
                <Divider type="vertical" className="mx-0"  key="div3"/>,
                <TableBtnWithPermission  access="system.openapi.self.delete" key="delete"  btnType="delete"  onClick={()=>{openModal('delete',entity)}} btnTitle="删除"/>
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
                message.error(msg || $t(RESPONSE_TIPS.error))
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
                message.success(msg || $t(RESPONSE_TIPS.success))
                manualReloadTable()
            }else{
                message.error(msg || $t(RESPONSE_TIPS.error))
            }
        })
    }

    const copyToken = (entity: OpenApiTableListItem)=>{
        if(copy(entity.token)){
            message.success($t(RESPONSE_TIPS.copySuccess))
        }else{
            message.error($t(RESPONSE_TIPS.copyError))
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
                    message.success(msg || $t(RESPONSE_TIPS.success))
                    resolve(true)
                }else{
                    message.error(msg || $t(RESPONSE_TIPS.error))
                    reject(msg || $t(RESPONSE_TIPS.error))
                }
            }).catch((errorInfo)=> reject(errorInfo))
        })
    }

    const openModal = async (type:'add'|'edit'|'delete',entity?:OpenApiTableListItem)=>{

        let title:string = ''
        let content:string|React.ReactNode = ''
        switch (type){
            case 'add':
                title=$t('添加 Open Api')
                content=<OpenApiConfig ref={addOpenApiRef} type={type} />
                break;
            case 'edit':{
                title=$t('配置 Open Api')
                message.loading($t(RESPONSE_TIPS.loading))
                const {code,data,msg} = await fetchData<BasicResponse<{app:OpenApiConfigFieldType}>>('external-app',{method:'GET',eoParams:{id:entity!.id}})
                message.destroy()
                if(code === STATUS_CODE.SUCCESS){
                    content=<OpenApiConfig ref={editOpenApiRef} type={type} entity={data.app}/>
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
                        return addOpenApiRef.current?.save().then((res)=>{if(res === true) manualReloadTable()})
                    case 'edit':
                        return editOpenApiRef.current?.save().then((res)=>{if(res === true) manualReloadTable()})
                    case 'delete':
                        return deleteOpenApi(entity!).then((res)=>{if(res === true) manualReloadTable()})
                }
            },
            width:600,
            okText:$t('确认'),
            cancelText:$t('取消'),
            closable:true,
            icon:<></>,
        })
    }

    const changeOpenApiStatus = (enabled:boolean,entity:OpenApiTableListItem)=>{
        fetchData<BasicResponse<null>>(`external-app/${enabled ? 'disable' :'enable'}`,{method:'PUT',eoParams:{id:entity.id}}).then(response=>{
            const {code,msg} = response
            if(code === STATUS_CODE.SUCCESS){
                message.success(msg || $t(RESPONSE_TIPS.success))
                manualReloadTable()
            }else{
                message.error(msg || $t(RESPONSE_TIPS.error))
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
            message.error(msg || $t(RESPONSE_TIPS.error))
        }
    }


    useEffect(() => {
        setBreadcrumb([{ title:$t('Open Api')}])
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
        addNewBtnTitle={$t("添加消费者")}
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