
import { ActionType } from "@ant-design/pro-components"
import { useImperativeHandle, useMemo, useRef, useState } from "react"
import PageList, { PageProColumns } from "@common/components/aoplatform/PageList"
import TableBtnWithPermission from "@common/components/aoplatform/TableBtnWithPermission"
import { API_TABLE_GLOBAL_COLUMNS_CONFIG,SERVICE_TABLE_GLOBAL_COLUMNS_CONFIG, APPLICATION_TABLE_GLOBAL_COLUMNS_CONFIG } from "@dashboard/const/const"
import {forwardRef} from "react"
import { COLUMNS_TITLE } from "@common/const/const"
import { Tooltip } from "antd"
import { $t } from "@common/locales"
import { useGlobalContext } from "@common/contexts/GlobalStateContext"
import { StringifyOptions } from "querystring"

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
    const {state} = useGlobalContext()

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

    const columns = useMemo(()=>[...TableType[type]].map((x)=>({
        ...x,
        title:<Tooltip title={$t(x.title as string)}>{$t(x.title as StringifyOptions)}</Tooltip>
    })),[type, state])

    const operation:PageProColumns<unknown>[] =[
        {
            title: COLUMNS_TITLE.operate,
            key: 'option',
            btnNums:1,
            fixed:'right',
            hideInSetting:true,
            valueType: 'option',
            render: (_: React.ReactNode, entity: unknown) => [
            <TableBtnWithPermission  access="" key="view" btnType="view"  onClick={()=>onRowClick(entity)} btnTitle="查看"/> 
            ],
        }
    ]
    
    return (
        <div  className={`not-top-padding-table h-full ${className||''}`}>
        <PageList
            id={id}
            minVirtualHeight={minVirtualHeight ? minVirtualHeight : ( id.includes('top')?438:undefined)}
            ref={tableRef}
            showPagination={showPagination}
            columns = {[...columns,...operation]}
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