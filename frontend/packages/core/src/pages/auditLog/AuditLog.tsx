import {ProColumns, ProProvider, ProTable} from "@ant-design/pro-components";
import  {FC, useContext, useEffect, useRef, useState} from "react";
import {App, Button, Select, Space} from "antd";
import {debounce} from "lodash-es";
import styles from './AuditLog.module.css'
import {useBreadcrumb} from "@common/contexts/BreadcrumbContext.tsx";
import {BasicResponse, STATUS_CODE} from "@common/const/const.ts";
import {useFetch} from "@common/hooks/http.ts";
import {SortOrder} from "antd/es/table/interface";
import {DefaultOptionType} from "antd/es/cascader";
import moment from "moment";
import { SimpleMemberItem } from "@common/const/type.ts";

type AuditLogTableListItem = {
    operator:string;
    operateType:string;
    description:string;
    ip:string;
    operateTime:string
};

const searchTypeList = [{label:'包含',value:1},{label:'不包含',value:0}];

const AUDIT_LOG_COLUMNS_CONFIG: ProColumns<AuditLogTableListItem, 'multipleSelect'>[] = [
    {
        title: '操作时间',
        dataIndex: 'operateTime',
        valueType: 'dateTimeRange',
        order:1,
        copyable: true,
        ellipsis:true,
        fixed:'left',
        width:182
    },
    {
        title: '操作人',
        dataIndex: ['operator','name'],
        key: 'operator',
        order:3,
        valueType: 'multipleSelect'
    },
    {
        title: '操作类型',
        dataIndex: 'operateType',
        key: 'operateType',
        order:2,
        valueType: 'multipleSelect',
    },
    {
        title: '具体描述',
        dataIndex: 'description',
        key: 'description',
        search:false
    },
    {
        title: 'IP',
        dataIndex: 'ip',
        key: 'ip',
        search:false
    }
];



const MultipleSelect: FC<{
    state: {
        type: number;
        fieldName:string;
        options:DefaultOptionType[]
    };
    /** Value 和 onChange 会被自动注入 */
    value?: string;
    onChange?: (value: {[k:string]:unknown},) => void;
}> = (props) => {
    const { state,value,onChange } = props;

    const [innerOptions, setOptions] = useState<DefaultOptionType[]
    >(state.options);

    const [searchType,setSearchType]=useState<1|0>(1)
    const [searchValue,setSearchValue]=useState<string|number|null>(null)
    useEffect(() => {
            setOptions(state.options);
    }, [state.options]);

    const handleSearchTypeChange = (e:1|0)=>{setSearchType(e);onChange?.({include:searchType, value:searchValue})}
    const handleSearchValueChange = (e:string|number|null)=>{
        //console.log(e)
        setSearchValue(e);
        onChange?.({include:searchType, value:e})}

    return (
        <Space>
            <Select
                style={{ width: 80 }}
                onChange={handleSearchTypeChange}
                value={searchType}
                options={searchTypeList}
            />
            <Select
                mode="multiple"
                style={{ width: 120 }}
                onChange={handleSearchValueChange}
                value={searchValue}
                options={innerOptions}
            />
        </Space>
    );
};


export default function AuditLog(){
    const { message } = App.useApp()
    const values = useContext(ProProvider);
    const parentRef = useRef<HTMLDivElement>(null);
    const [tableHeight, setTableHeight] = useState(window.innerHeight);
    const { setBreadcrumb } = useBreadcrumb()
    const [tableListDataSource, setTableListDataSource] = useState<AuditLogTableListItem[]>([]);
    const {fetchData} = useFetch()
    const [columns, setColumns] = useState<ProColumns<AuditLogTableListItem, 'multipleSelect'>[]>(AUDIT_LOG_COLUMNS_CONFIG)
    const [operatorTypeList, setOperatorTypeList] = useState<DefaultOptionType[]>([])
    const [operatorList, setOperatorList] = useState<DefaultOptionType[]>([])

    const getOperatorTypeList = async ()=>{
        setOperatorTypeList([])
        const {code,data,msg} = await fetchData<BasicResponse<{operateTypes:Array<{id:string,name:string}>}>>('audit/operate_types',{method:'GET',eoTransformKeys:['operate_types']})
            if(code === STATUS_CODE.SUCCESS){
                setOperatorTypeList(data.operateTypes?.map((x:{id:string,name:string})=>({label:x.name, value:x.id})))
            }else{
                message.error(msg || '操作失败')
            }
    }

    const getMemberList = async ()=>{
        setOperatorList([])
        const {code,data,msg}  = await fetchData<BasicResponse<{ members: SimpleMemberItem[] }>>('simple/member',{method:'GET'})
        if(code === STATUS_CODE.SUCCESS){
            setOperatorList(data.members?.map((x:SimpleMemberItem)=>{return {
                label:x.name, value:x.id
            }}))
        }else{
            message.error(msg || '操作失败')
        }
    }

    const handleOperatorList = ()=>{
        setColumns((prevData)=>
            prevData?.map((x)=>{
                if(x.dataIndex === 'operator'){
                    x.renderFormItem = (item, { type, defaultRender, ...rest }, form) => {
                        const stateType = form.getFieldValue('operator');
                        return (
                            <MultipleSelect
                                {...rest}
                                state={{
                                    type: stateType,
                                    fieldName:'operator',
                                    options:operatorList
                                }}
                            />
                        );
                    }
                }
                return x
            }))
    }

    const handleOperatorTypeList = async ()=>{
        setColumns((prevData)=>
            prevData?.map((x)=>{
            if(x.dataIndex === 'operateType'){
                x.renderFormItem= (item, { type, defaultRender, ...rest }, form) => {
                    const stateType = form.getFieldValue('operator');
                    return (
                        <MultipleSelect
                            {...rest}
                            state={{
                                type: stateType,
                                fieldName:'operateType',
                                options:operatorTypeList
                            }}
                        />
                    );
                }
            }
            return x
        }))
    }

    useEffect(() => {
        setBreadcrumb([
            {
                title:'审计日志'
            },
        ])
        const handleResize = () => {
            if (parentRef.current) {
                const res = parentRef.current.getBoundingClientRect();
                const height = res.height - 52  - 40;// 减去顶部按钮、底部分页、表头高度
                //console.log(height, res?.height);
                height && setTableHeight(height);
            }
        };
        const debouncedHandleResize = debounce(handleResize, 200);
        const resizeObserver = new ResizeObserver(debouncedHandleResize);
        if (parentRef.current) {
            resizeObserver.observe(parentRef.current);
        }
        getOperatorTypeList().then(()=>{
            handleOperatorTypeList()
        })
        getMemberList().then(()=>{
            handleOperatorList()
        })
        return () => {
            resizeObserver.disconnect();
        };
    }, []);

    const getAuditLogList =(params:unknown, sorter?:Record<string, SortOrder>,filter?:Record<string, (string | number)[] | null>): Promise<{ data: AuditLogTableListItem[], success: boolean }>=> {
        const eoParams = {
            ...(params.operateTime?.length > 0 ? {
                startTime:moment(params.operateTime[0],'YYYY-MM-DD HH:mm:ss').valueOf() / 1000,
                endTime:moment(params.operateTime[0],'YYYY-MM-DD HH:mm:ss').valueOf() / 1000
            }:{}),
            ...(params.operator?.value?.length > 0 ? {
                    operator:JSON.stringify(params.operator.include ? params.operator.value :operatorList.filter(item=>!params.operator.value.includes(item.value))?.map(x=>x.value))
            }:{}),
            ...(params.operateType?.value?.length > 0 ? {
                operateType:JSON.stringify(params.operateType.include ? params.operateType.value :operatorTypeList.filter(item=>!params.operatorTypeList.value.includes(item.value))?.map(x=>x.value))
            }:{}),
        }
        return fetchData<BasicResponse<{items:AuditLogTableListItem}>>('audit/logs',{method:'GET',eoParams,eoTransformKeys:['startTime','endTime','operateType','operate_type','operate_time']}).then(response=>{
            const {code,data,msg} = response
            //console.log(code,data.items)
            if(code === STATUS_CODE.SUCCESS){
                setTableListDataSource(data.items)
                return  {data:data.items, success: true}
            }else{
                message.error(msg || '操作失败')
                return {data:[], success:false}
            }
        }).catch(() => {
            return {data:[], success:false}
        })
    }
    const getOutputLog = (params:unknown)=>{
        const eoParams = {
            ...(params.operateTime?.length > 0 ? {
                startTime:moment(params.operateTime[0]).valueOf() / 1000,
                endTime:moment(params.operateTime[0]).valueOf() / 1000
            }:{}),
            ...(params.operator?.value?.length > 0 ? {
                operator:JSON.stringify(params.operator.include ? params.operator.value :operatorList.filter(item=>!params.operator.value.includes(item.value))?.map(x=>x.value))
            }:{}),
            ...(params.operateType?.value?.length > 0 ? {
                operateType:JSON.stringify(params.operateType.include ? params.operateType.value :operatorTypeList.filter(item=>!params.operatorTypeList.value.includes(item.value))?.map(x=>x.value))
            }:{}),
        }
         fetchData<BasicResponse<{items:AuditLogTableListItem}>>('audit/logs/export',{method:'GET',eoParams,eoTransformKeys:['startTime','endTime','operateType','operate_type','operate_time']}).then(response=>{

             if (!response.ok) {
                 throw new Error(`Network response was not ok: ${response.status}`);
             }
             // 从 response 中获取文件名
             const contentDisposition = response.headers.get('Content-Disposition');
             const filenameMatch = contentDisposition && contentDisposition.match(/filename="(.+?)"/);
             const filename = filenameMatch ? filenameMatch[1] : '审计日志';
             const downloadLink = document.createElement('a');
             downloadLink.href = window.URL.createObjectURL(new Blob([response.blob()]));
             downloadLink.setAttribute('download', filename);
             document.body.appendChild(downloadLink);
             downloadLink.click();
             document.body.removeChild(downloadLink);
        })
    }
    return (
            <ProTable<AuditLogTableListItem, Record<string, unknown>, 'multipleSelect'>
                className={styles['audit-log-table']}
                columns={columns}
                request={(params, sort,filter) => getAuditLogList(params,sort,filter)}
                rowKey="id"
                options={{
                    reload: false,
                    density: false,
                    setting: false,
                }}
                tableAlertRender={false}
                size="middle"
                scroll={{ y: tableHeight }}
                search={{
                    defaultCollapsed: false,
                    optionRender: (searchConfig, formProps, dom) => [
                        ...dom.reverse(),
                        <Button
                            type="primary"
                            key="out"
                            onClick={() => {
                                const values = searchConfig?.form?.getFieldsValue();
                                //console.log(values,moment(values.operateTime[0]).valueOf());
                                getOutputLog(values)
                            }}
                        >
                            导出日志
                        </Button>,
                    ],
                }}
            />)
}