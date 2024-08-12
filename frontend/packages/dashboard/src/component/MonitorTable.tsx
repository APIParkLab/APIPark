
import { ActionType, ProColumns } from "@ant-design/pro-components"
import { useImperativeHandle, useRef, useState } from "react"
import PageList from "@common/components/aoplatform/PageList"
import TableBtnWithPermission from "@common/components/aoplatform/TableBtnWithPermission"
import { API_TABLE_GLOBAL_COLUMNS_CONFIG,SERVICE_TABLE_GLOBAL_COLUMNS_CONFIG, APPLICATION_TABLE_GLOBAL_COLUMNS_CONFIG } from "@dashboard/const/const"
import {forwardRef} from "react"

const  TableType = {
    api :API_TABLE_GLOBAL_COLUMNS_CONFIG,
    provider :SERVICE_TABLE_GLOBAL_COLUMNS_CONFIG,
    subscribers :APPLICATION_TABLE_GLOBAL_COLUMNS_CONFIG
}

type MonitorTableProps<T> = {
    type:'api'|'subscribers'|'provider'
    id:string
    request:(keyword?:string) => Promise<{
        data: T[];
        success: boolean;
    }>
    onRowClick:(record:T)=>void
    searchPlaceholder?:string
    showPagination?:boolean
    noTop?:boolean
    minVirtualHeight?:number
    className?:string
    inModal?:boolean
}

export interface MonitorTableHandler{
    reload:()=>void
}

const MonitorTable = forwardRef<MonitorTableHandler, MonitorTableProps<unknown>>((props,ref) => {
    const {type,id,request,onRowClick,searchPlaceholder,showPagination=false,noTop,minVirtualHeight,className,inModal=false} = props
    const [searchWord, setSearchWord] = useState<string>('')
    const tableRef = useRef<ActionType>(null)
    const [tableHttpReload, setTableHttpReload] = useState(true);
    const [tableListDataSource, setTableListDataSource] = useState<unknown[]>([]);

    useImperativeHandle(ref,()=>({
        reload: ()=>{tableRef.current?.reload()}
    }))

    const getTableDataSource = ()=>{
        if(!tableHttpReload){
            setTableHttpReload(true)
            return Promise.resolve({
                data: tableListDataSource,
                success: true,
            });
        }
        return request(searchWord).then(response=>{
            const {data,success} = response
            setTableListDataSource(data)
            return  {data, success}
        }).catch(() => {
            return {data:[], success:false}
        })
    }

    const operation:ProColumns<unknown>[] =[
        {
            title: '操作',
            key: 'option',
            width: 98,
            fixed:'right',
            hideInSetting:true,
            valueType: 'option',
            render: (_: React.ReactNode, entity: unknown) => [
            // <TableBtnWithPermission  access="system.dashboard.self.view" key="view" onClick={()=>onRowClick(entity)} btnTitle="查看"/>,
            <TableBtnWithPermission  access="" key="view" onClick={()=>onRowClick(entity)} btnTitle="查看"/>,
            ],
        }
    ]
    
    return (
        <div  className={`not-top-padding-table h-full ${className||''}`}>
        <PageList
            id={id}
            minVirtualHeight={minVirtualHeight ? minVirtualHeight : ( id.includes('top')?438:undefined)}
            besidesTableHeight={inModal ? 64+56+258: undefined}
            ref={tableRef}
            showPagination={showPagination}
            columns = {[...(TableType[type] || []),...operation]}
            request={getTableDataSource}
            dataSource={tableListDataSource}
            // tableClickAccess="system.dashboard.self.view"
            showColSetting={true}
            onRowClick={onRowClick}
            searchPlaceholder={searchPlaceholder}
            onSearchWordChange={(e) => {
                setSearchWord(e.target.value)
            }}
            onChange={() => {
                setTableHttpReload(false)
            }}
            noTop={noTop}
        /></div>)
})

export default MonitorTable;