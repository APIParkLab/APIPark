
import {Button, Dropdown, Input, MenuProps, TablePaginationConfig} from 'antd';
import {ChangeEvent, RefAttributes, forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState} from 'react';
import type {ActionType, ParamsType, ProColumns, ProTableProps} from '@ant-design/pro-components';
import {
  DragSortTable,
  ProTable,
} from '@ant-design/pro-components';
import './PageList.module.css'
import {SearchOutlined} from "@ant-design/icons";
import { debounce } from 'lodash-es'
import WithPermission from '@common/components/aoplatform/WithPermission';
import { FilterValue, SorterResult, TableCurrentDataSource } from 'antd/es/table/interface';
import { useGlobalContext } from '../../contexts/GlobalStateContext';
import { PERMISSION_DEFINITION } from '@common/const/permissions';
import { withMinimumDelay } from '@common/utils/ux';

export type PageProColumns<T = any, ValueType = 'text'> = ProColumns<T , ValueType> & {btnNums? : number}

interface PageListProps<T> extends ProTableProps<T, unknown>, RefAttributes<ActionType>  {
  id?:string
  columns: PageProColumns<T,'text'>[]
  request?:(params: (ParamsType & {pageSize?: number | undefined, current?: number | undefined, keyword?: string | undefined}), sorter: unknown, filter: unknown)=>Promise<{data:T[], success:boolean}>
  dropMenu?:MenuProps
  searchPlaceholder?:string
  showPagination?:boolean
  primaryKey?:string
  addNewBtnTitle?:string
  addNewBtnAccess?:string
  tableClickAccess?:string
  onAddNewBtnClick?:()=>void
  beforeSearchNode?:React.ReactNode[]
  onSearchWordChange?:(e:ChangeEvent<HTMLInputElement>) => void
  afterNewBtn?:React.ReactNode[]
  dragSortKey?:string
  onDragSortEnd?:(beforeIndex: number, afterIndex: number, newDataSource: T[]) => void | Promise<void>
  tableTitle?:string
  dataSource?:T[]
  onRowClick?:(record:T)=>void
  showColSetting?:boolean
  minVirtualHeight?:number
  besidesTableHeight?:number
  noTop?:boolean
  tableClass?:string
  tableTitleClass?:string
  addNewBtnWrapperClass?:string
  delayLoading?:boolean
  noScroll?:boolean
  /* 前端分页的表格，需要传入该字段以支持后端搜索 */
  manualReloadTable?:()=>void
}



const PageList = <T extends Record<string, unknown>>(props: React.PropsWithChildren<PageListProps<T>>,ref: React.Ref<ActionType>) => {
  const {id,columns,request,dropMenu,searchPlaceholder,showPagination=true,primaryKey='id',addNewBtnTitle,addNewBtnAccess,tableClickAccess,tableClass,onAddNewBtnClick,beforeSearchNode,onSearchWordChange,manualReloadTable,afterNewBtn,dragSortKey,onDragSortEnd,tableTitle,rowSelection,onChange,dataSource,onRowClick,showColSetting=false,minVirtualHeight,noTop,addNewBtnWrapperClass,tableTitleClass,delayLoading = true,besidesTableHeight, noScroll} = props
  const parentRef = useRef<HTMLDivElement>(null);
  const [tableHeight, setTableHeight] = useState(minVirtualHeight || window.innerHeight);
  const [tableWidth, setTableWidth] = useState<number|undefined>(undefined);
  const actionRef = useRef<ActionType>();
  const [allowTableClick,setAllowTableClick] = useState<boolean>(false)
  const {accessData,checkPermission} = useGlobalContext()
  const [minTableWidth, setMinTableWidth] = useState<number>(0)

  // 使用useImperativeHandle来自定义暴露给父组件的实例值
  useImperativeHandle(ref, () => actionRef.current!);
  
  const lastAccess = useMemo(()=>{
    if(!tableClickAccess) return true
    return checkPermission(tableClickAccess as keyof typeof PERMISSION_DEFINITION[0]) 
},[allowTableClick, accessData])

  useEffect(()=>{
    tableClickAccess ? setAllowTableClick(lastAccess) :  setAllowTableClick(true)
  },[accessData])
  
  const resizeObserverRef = useRef<ResizeObserver |null >(null);

  useEffect(() => {
    const handleResize = () => {
      if (parentRef.current && !noScroll) {
        const res = parentRef.current.getBoundingClientRect();
        const height = res.height - ((noTop ? 0 : 59) + 54  + (showPagination && !dragSortKey ? 52 : 0) +( besidesTableHeight ?? 0) + 1); // 减去顶部按钮、底部分页、表头高度
        setTableWidth(minTableWidth - 5> res.width ? minTableWidth : undefined);
        height && setTableHeight(minVirtualHeight === undefined ? height : (height > minVirtualHeight ? height : minVirtualHeight));
      }
    };

    const debouncedHandleResize = debounce(handleResize, 200);

    if (!resizeObserverRef.current && !noScroll) {
      // 创建一个 ResizeObserver 来监听高度变化，只创建一次
      resizeObserverRef.current = new ResizeObserver(debouncedHandleResize);
      // 开始监听
      if (parentRef.current && !minVirtualHeight) {
        resizeObserverRef.current.observe(parentRef.current);
      }
    }

    // 在 minTableWidth 变化时手动触发 handleResize
    handleResize();

    // 清理函数
    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      }
    };
  }, [minTableWidth, parentRef, noTop, showPagination, dragSortKey, minVirtualHeight]); // 将相关依赖项作为 useEffect 的依赖项


  

  const newColumns = useMemo(()=>{
    let width:number = 0
    const res = columns?.map(
      (x, index)=>{
        const sorter = localStorage.getItem(`${id}_sorter`)
        const filters = localStorage.getItem(`${id}_filters`)
        x.copyable = x.copyable ?? (index === 0 || x.dataIndex === 'id' || x.dataIndex === 'email')
        if(sorter && x.sorter){
          const sorterObj =  JSON.parse(sorter)
          const xName = Array.isArray(x.dataIndex) ? x.dataIndex.join(','):x.dataIndex
          x.defaultSortOrder = sorterObj?.columnKey === xName ? sorterObj?.order : undefined
          // x.showSorterTooltip = {target:'sorter-icon'}
        }
        if(filters && x.filters){
          const filtersObj = JSON.parse(filters)
          const xName = Array.isArray(x.dataIndex) ? x.dataIndex.join(','):x.dataIndex
          x.defaultFilteredValue = filtersObj?.[xName as string]
        }
        if((index === columns.length -1 || x.key === 'option') && x.btnNums){
          const optionWidth = 24 + 18 * x.btnNums + (x.btnNums - 1) * 21
          x.width = Math.max(optionWidth, 54)
        }
        width += Number(x.width ?? ((x.filters || x.sorter) ? 120 : 100))
        return x})
        setMinTableWidth(width)
    return res
  },[columns])

  const headerTitle = ()=>{
    return (
        <>{
          tableTitle ? <span className={`text-[30px] leading-[42px] my-mbase pl-[20px] ${tableTitleClass}`}>{tableTitle}</span> : (
           addNewBtnTitle ?  <WithPermission access={addNewBtnAccess} ><Button type="primary"  className={`mr-btnrbase my-btnbase ${addNewBtnWrapperClass}`} onClick={onAddNewBtnClick}>{addNewBtnTitle}</Button></WithPermission> : undefined
          )

        }
        {afterNewBtn ? afterNewBtn as React.ReactNode[] :undefined}
    </>
  )
  }

  const requestWithDelay = (params: ParamsType & { pageSize?: number | undefined; current?: number | undefined; keyword?: string | undefined;}, sort: unknown, filter: unknown) => {
    return withMinimumDelay(() => request!(params, sort, filter), delayLoading === false? 0 : undefined);
  };

  return (
    <div ref={parentRef} className={`eo_page_list bg-MAIN_BG ${dragSortKey ? 'eo_page_drag':''} ${tableClass ?? ''}`}style={{ height: '100%' }}>
      {dragSortKey? <DragSortTable<T>
          actionRef={actionRef}
          columns={newColumns}
          rowKey={primaryKey}
          search={false}
          pagination={false}
          request={request}
          dragSortKey={dragSortKey}
          onDragSortEnd={onDragSortEnd}
          scroll={noScroll ? undefined :{ y: tableHeight }}
          options={{
            reload: false,
            density: false,
            setting: false,
          }}
          headerTitle={
              headerTitle()
            }
      /> : <ProTable<T>
          actionRef={actionRef}
          columns={newColumns}
          virtual
          scroll={noScroll ? undefined : {x:tableWidth,y: tableHeight }}
          size="middle"
          rowSelection={rowSelection}
          tableAlertRender={false}
          tableAlertOptionRender={false}
          request={request ? requestWithDelay : undefined}
          toolBarRender={() => [
            dropMenu ? (<Dropdown
                key="menu"
                menu={dropMenu}
            >
              <Button>
                筛选
              </Button>
            </Dropdown>):null,
          ]}
          toolbar={{
            actions:[...[beforeSearchNode],...[searchPlaceholder?<Input className="my-btnbase ml-btnbase" onChange={ onSearchWordChange ?  (e) => debounce(onSearchWordChange, 100)(e) : undefined  } onPressEnter={()=>manualReloadTable ? manualReloadTable():actionRef.current?.reload?.()} allowClear placeholder={searchPlaceholder}  prefix={<SearchOutlined className="cursor-pointer" onClick={()=>{actionRef.current?.reload?.()}}/>}/>:null]],
          }}
          options={{
            reload: false,
            density: false,
            setting: showColSetting ? {
              draggable:false,
              showListItemOption:false
            } :false,
          }}
          showSorterTooltip={false}
          columnsState={{persistenceType:'localStorage',persistenceKey:id}}
          pagination={showPagination ? {
            showSizeChanger: true,
            showQuickJumper: true,
            size:'default'
          }:false}
          rowKey={primaryKey}
          onChange={(pagination: TablePaginationConfig, filters: Record<string, FilterValue | null>, sorter: SorterResult<T> | SorterResult<T>[],extra:TableCurrentDataSource<T>) =>{
            localStorage.setItem(`${id}_filters`,JSON.stringify(filters))
            !Array.isArray(sorter) && localStorage.setItem(`${id}_sorter`,JSON.stringify({columnKey:sorter?.columnKey, order: sorter?.order}))
            onChange?.(pagination,filters,sorter,extra)}}
          dataSource={dataSource}
          search={false}
          headerTitle={
            headerTitle()
          }
          onRow={onRowClick && allowTableClick ? (record) => ({
            onClick: () => {
              onRowClick(record);
            }
          }):undefined}
          rowClassName={()=>onRowClick && allowTableClick ?"cursor-pointer":''}
    />}
    </div>
  );
};

export default forwardRef(PageList) as <T extends Record<string,unknown>>(props: React.PropsWithChildren<PageListProps<T>> & { ref?: React.Ref<ActionType> }) => ReturnType<typeof PageList>;