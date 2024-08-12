
import { Input,Table} from "antd";
import {forwardRef, KeyboardEventHandler, Ref, useCallback, useEffect, useImperativeHandle, useRef, useState} from "react";
import styles from './TransferTable.module.css'
import {CloseOutlined, SearchOutlined} from "@ant-design/icons";
import {debounce} from "lodash-es";
import {ColumnsType} from "antd/es/table";

export type TransferTableProps<T> = {
    request?:(k?:string)=>Promise<{data:T[],success:boolean}>
    columns: ColumnsType<T>
    primaryKey:string
    onSelect:(selectedData:T[])=>void
    tableType?:'member'|'api'
    disabledData:string[]
    searchPlaceholder?:string
}

export type TransferTableHandle<T> = {
    selectedData: () => T[];
    selectedRowKeys: () => React.Key[];
}

const TransferTable = forwardRef<TransferTableHandle<{[k:string]:unknown}>, TransferTableProps<{[k:string]:unknown}>>(
    <T extends {[k:string]:unknown}>(props: TransferTableProps<T>, ref:Ref<TransferTableHandle<T>>) => {
    const {request,columns,primaryKey,onSelect,tableType,disabledData = [],searchPlaceholder} = props
    const tblRef: Parameters<typeof Table>[0]['ref'] = useRef(null);
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>(disabledData);
    const [selectedData, setSelectedData] = useState<Array<T>>([])
    const [dataSource, setDataSource] = useState<T[]>([])
    const [searchWord, ] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(false)
    const parentRef = useRef<HTMLDivElement>(null);
    const [tableHeight, setTableHeight] = useState(window.innerHeight * 80 / 100 );
    const [tableShow, setTableShow] = useState(false);

    useImperativeHandle(ref, () =>({
        selectedData: () => selectedData,
        selectedRowKeys: () => selectedRowKeys,}))

    const handlerLeftTableClick = (record:T & {[k:string]:string})=>{
        if(disabledData.indexOf(record[primaryKey||'id' as string] )!== -1) return

        const tmpSelectedRowKeys = [...selectedRowKeys];
        if (tmpSelectedRowKeys.indexOf(record[primaryKey||'id' as string]) !== -1) {
            tmpSelectedRowKeys.splice(tmpSelectedRowKeys.indexOf(record[primaryKey||'id' as string]), 1);
        } else {
            tmpSelectedRowKeys.push(record[primaryKey||'id' as string]);
        }
        setSelectedRowKeys(tmpSelectedRowKeys);
        let tmpSelectedData = [...selectedData]
        if(tmpSelectedData.filter((x: T)=>x[primaryKey || 'id'] === record[primaryKey||'id' as string]).length > 0){
            tmpSelectedData = tmpSelectedData.filter((x: T)=>x[primaryKey || 'id'] !== record[primaryKey||'id' as string])
        }else{
            tmpSelectedData.push(record)
        }
        setSelectedData(tmpSelectedData)
    }

    // const handlerRightTableClick = (record:T & {[k:string]:string})=>{
    //     const tmpSelectedRowKeys = [...selectedRowKeys];
    //     if (tmpSelectedRowKeys.indexOf(record[primaryKey||'id' as string]) >= 0) {
    //         tmpSelectedRowKeys.splice(tmpSelectedRowKeys.indexOf(record[primaryKey||'id' as string]), 1);
    //     } 
    //     setSelectedRowKeys(tmpSelectedRowKeys);
    //     let tmpSelectedData = [...selectedData]
    //     tmpSelectedData = tmpSelectedData.filter((x: {[k:string]:string})=>x[primaryKey || 'id'] !== record[primaryKey||'id' as string])
    //     setSelectedData(tmpSelectedData)
    // }

    const onSelectChange = (newSelectedRowKeys: React.Key[], selectedRow:T[]) => {
        setSelectedRowKeys(newSelectedRowKeys);
        setSelectedData(selectedRow.filter((x:T)=>disabledData.indexOf(x[primaryKey || 'id'] as string) === -1))
    };
    const removeItem = (item:T )=>{
        setSelectedRowKeys(selectedRowKeys.filter((x)=>{return x!==item[primaryKey || 'id']}))
        setSelectedData((prevData)=>prevData.filter((x:T)=>(x[primaryKey || 'id'] !== item[primaryKey || 'id'])))
    }

        useEffect(() => {
            onSelect && onSelect(selectedData)
        }, [selectedData]);

    const operations = [
        {
            title: '操作',
            key: 'option',
            width: 40,
            valueType: 'option',
            render: (_: React.ReactNode, entity: T) => [
                <CloseOutlined  className="p-0 w-full h-full hover:bg-bar-theme" onClick={()=>removeItem(entity as T)}/>
            ],
        }
    ]

    const onSearchWordChange = (e: KeyboardEventHandler<HTMLInputElement>)=>{
        getDataSource(e.target.value)
    }

    const getDataSource = (curSearchWord?:string)=>{
        setLoading(true)
        request && request(curSearchWord ?? searchWord).then((res)=>{
            const {data,success} = res
            setDataSource(success? data : [])
        }).finally(()=>{setLoading(false)})
    }

    const debouncedSearch = useCallback(
        debounce(onSearchWordChange, 600),[]
    )

        
  useEffect(() => {
    getDataSource()
    const handleResize = () => {
      if (parentRef.current) {
        const res = parentRef.current.getBoundingClientRect();
        setTableHeight(res.height - 32 - 12 * 2 -42  -2)
        setTimeout(()=>setTableShow(true),100)
        // setTableWidth(res.width / 2 - 20  - 2 - 40)
        // const height =  res.height -( noTop ? 0 :52) - (dragSortKey ? 0 : 53) - 40;// 减去顶部按钮、底部分页、表头高度
        // height && setTableHeight(height);
      }
    };

    const debouncedHandleResize = debounce(handleResize, 200);

    // 创建一个 ResizeObserver 来监听高度变化
    const resizeObserver = new ResizeObserver(debouncedHandleResize);

    // 开始监听
    if (parentRef.current ) {
      resizeObserver.observe(parentRef.current);
    }

    // 清理函数
    return () => {
      resizeObserver.disconnect();
    };
  }, []);
    return (
        <div ref={parentRef}  className={styles['transfer-table-'+`${tableType === 'member'? 'member':'api'}`] + ` flex flex-1  w-[550px] min-h-[404px] overflow-hidden`}>
            <div className="flex flex-col border-[1px] border-solid border-BORDER w-[calc(50%-10px)]">
                <Input className=" m-btnbase w-[calc(100%-24px)]" onChange={ debouncedSearch} onPressEnter={onSearchWordChange} allowClear placeholder={searchPlaceholder || "请输入"}  prefix={<SearchOutlined className="cursor-pointer" onClick={()=>{onSearchWordChange}}/>} />
                {tableShow  && <Table
                    columns={columns}
                    virtual
                    size="small"
                    scroll={{ x:100 ,y:tableHeight}}
                    rowKey={primaryKey || 'id'}
                    dataSource={dataSource}
                    pagination={false}
                    loading={loading}
                    ref={tblRef}
                    rowSelection={
                        {
                            selectedRowKeys,
                            onChange: onSelectChange,
                            columnWidth: 40,
                            getCheckboxProps: (record: {[k:string]:string}) => ({
                            disabled: disabledData.length > 0 && disabledData?.indexOf(record[primaryKey || 'id'] as string) !== -1, // Column configuration not to be checked
                            name: record[primaryKey || 'id'],

                            }),
                        }
                    }
                    onRow={(record) => ({
                    onClick: () => {
                        handlerLeftTableClick(record);
                    }
                    })}
                />}
            </div>
            <div className= {`flex flex-col  w-[calc(50%-10px)] ml-[20px]  border-[1px] border-solid border-BORDER`}>
                <div className="leading-[32px] mt-btnybase mb-[54px]">
                    <span className="ml-[20px]">已选{tableType === 'member' ? '成员' : ' API'} <span className="mr-[4px]">({selectedData.length})</span></span>
                </div>
                <Table
                    virtual
                    scroll={{x:200,y:tableHeight}}
                    size="small"
                    columns={[...columns?.map((col)=>({...col,className:(col.className || ' ') + 'pl-[20px]'})),...operations]}
                    showHeader={false}
                    rowKey={primaryKey}
                    dataSource={selectedData}
                    pagination={false}
                    ref={tblRef}
                    loading={loading}
                />
            </div>
        </div>);
})
export default TransferTable