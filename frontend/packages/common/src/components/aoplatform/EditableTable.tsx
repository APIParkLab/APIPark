import { EditableProTable, ProColumns } from "@ant-design/pro-components";
import { Button } from "antd";
import { useState, useEffect } from "react";
import { v4 as uuidv4} from 'uuid';
import WithPermission from "./WithPermission";
  
interface EditableTableProps<T> {
    configFields: ProColumns<T>[];
    value?: T[]; // 外部传入的值
    className?: string;
    onChange?: (newConfigItems: T[]) => void; // 当配置项变化时，外部传入的回调函数
    // tableProps?: TableProps<T>;
    disabled?:boolean
    extendsId?:string[] // 自增一行时，需要和上一行数据一致的字段，比如集群id
}

const EditableTable = <T extends { _id: string }>({
                                                                configFields,
                                                                value, // value 现在是外部传入的配置项数组
                                                                onChange, // onChange 现在是当配置项数组变化时的回调函数
                                                                // tableProps,
                                                                disabled,
                                                                className,
                                                                extendsId,
                                                            }: EditableTableProps<T>) => {
    // const [form] = Form.useForm<FormInstance>();
    // const [isModalVisible, setIsModalVisible] = useState(false);
    const [configurations, setConfigurations] = useState<(T | {_id:string})[]>(value ||[{_id:'1234'}]);
    // const [editingConfig, setEditingConfig] = useState<T | null>(null);

    const [editableKeys, setEditableRowKeys] = useState<React.Key[]>(() =>
    value?.map((item) => item._id) || ['1234']
  );

    useEffect(() => {
        setConfigurations(value?.map((x)=>x._id ? x : {...x,_id:uuidv4()}) || [{_id:uuidv4()}]);
    }, [value]);

    const getNotEmptyValue = (value:unknown)=>{
        return value
    }

    return (
        <EditableProTable<T>
            className={className}
            columns={configFields}
            rowKey="_id"
            value={configurations as T[]}
            size="small"
            bordered={true}
            recordCreatorProps={false}
            editable={ {
                type: 'multiple',
                editableKeys:disabled ? [] : configurations?.map(x=>x._id),
                actionRender: (row, config) => {
                    return [
                        <WithPermission access=""  key="addPermission" ><Button type="text" className="h-[22px] border-none p-0 flex items-center bg-transparent "
                            key="add"
                            onClick={() => {
                                const newId = uuidv4();
                                setConfigurations((prev)=>{
                                    const tmpPreData = [...prev];
                                    const newId = uuidv4()
                                    const lastRecord:{[k:string]:unknown} = tmpPreData[tmpPreData.length - 1];
                                    const newRecord :{[k:string]:unknown, _id:string}= { _id: newId };
                                    
                                    // 当extendsId的长度大于0时，根据extendsId指定的字段从最后一个record中复制值
                                    if(extendsId && extendsId.length > 0) {
                                        extendsId.forEach(field => {
                                            newRecord[field] = lastRecord[field];
                                        });
                                    }
                                    tmpPreData.splice(Number(config.index) + 1, 0,newRecord);
                                    onChange?.(getNotEmptyValue(tmpPreData));
                                    return tmpPreData});
                                setEditableRowKeys((prev)=>([...prev,newId]))
                            }}
                            >
                            增加
                        </Button></WithPermission>,
                        (config.index !== configurations.length - 1 )&& <WithPermission access=""><Button type="text" className="h-[22px] border-none p-0 flex items-center bg-transparent "
                            key="edit"
                            onClick={() => {
                                setConfigurations((prev)=>{
                                    const tmpPreData = [...prev];
                                    tmpPreData.splice(Number(config.index), 1);
                                    onChange?.(tmpPreData);
                                    return tmpPreData});
                                setEditableRowKeys((prev)=>(prev.filter(x=>x !== config._id)))
                            }}
                        >
                            删除
                        </Button></WithPermission>,
                    ];
                },
                onValuesChange: (record, recordList) => {
                    if(record._id === recordList[recordList.length - 1]._id){
                        const newId = uuidv4()
                        const lastRecord:{[k:string]:unknown} = recordList[recordList.length - 1];
                        const newRecord :{[k:string]:unknown, _id:string}= { _id: newId };
                        
                        // 当extendsId的长度大于0时，根据extendsId指定的字段从最后一个record中复制值
                        if(extendsId && extendsId.length > 0) {
                            extendsId.forEach(field => {
                                newRecord[field] = lastRecord[field];
                            });
                        }
                
                        recordList = ([...recordList, newRecord as T]);
                        setEditableRowKeys((prev)=>[...prev, newId])
                    }
                    setConfigurations(recordList);
                    onChange?.(recordList);
                },
                onChange: setEditableRowKeys,
            }}
      />
    )
    }

export default EditableTable;