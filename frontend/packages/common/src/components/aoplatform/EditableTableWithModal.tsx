import  {useEffect, useState} from 'react';
import { Button, Modal, Form, Table, FormInstance, TableProps, Divider } from 'antd';
import { v4 as uuidv4 } from 'uuid';
import { ColumnsType } from 'antd/es/table';
import WithPermission from './WithPermission';

export interface ConfigField<T> {
    title: string;
    key: keyof T;
    component: React.ReactNode;
    renderText?: (value: unknown, record: T) => React.ReactNode;
    required?: boolean;
    ellipsis?:boolean
}

interface EditableTableWithModalProps<T> {
    configFields: ConfigField<T>[];
    value?: T[]; // 外部传入的值
    className?: string;
    onChange?: (newConfigItems: T[]) => void; // 当配置项变化时，外部传入的回调函数
    tableProps?: TableProps<T>;
    disabled?:boolean
}

const EditableTableWithModal = <T extends { _id?: string }>({
                                                                configFields,
                                                                value, // value 现在是外部传入的配置项数组
                                                                onChange, // onChange 现在是当配置项数组变化时的回调函数
                                                                tableProps,
                                                                disabled,
                                                                className
                                                            }: EditableTableWithModalProps<T>) => {
    const [form] = Form.useForm<FormInstance>();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [configurations, setConfigurations] = useState<T[]>(value ||[]);
    const [editingConfig, setEditingConfig] = useState<T | null>(null);

    const showModal = (config?: T) => {
        if (config) {
            form.setFieldsValue(config as Record<string, unknown>);
            setEditingConfig(config);
        } else {
            form.resetFields();
            setEditingConfig(null);
        }
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const handleDelete = (_id: string) => {
        const newConfigurations = configurations.filter(config => config._id !== _id);
        setConfigurations(newConfigurations);
        onChange?.(newConfigurations);
    };

    const handleOk = () => {
        form.validateFields()
            .then(values => {
                let newConfigurations = [...configurations];
                if (editingConfig && editingConfig._id) {
                    newConfigurations = newConfigurations?.map(config =>
                        config._id === editingConfig._id ? { ...config, ...values } : config
                    );
                } else {
                    const newConfig = { _id: uuidv4(), ...values } as Record<string, unknown>;
                    newConfigurations.push(newConfig as T);
                }
                setConfigurations(newConfigurations);
                onChange?.(newConfigurations);
                setIsModalVisible(false);
            })
            .catch(info => {
                console.log('Validate Failed:', info);
            });
    };

    useEffect(() => {
            setConfigurations(value?.map((x)=>x._id ? x : {...x,_id:uuidv4()}) || []);
    }, [value]);

    const columns: ColumnsType<T> = configFields.map(({ title, key, renderText }) => ({
        title,
        dataIndex: key as string,
        key: key as string,
        render: renderText ? (value, record) => renderText(value, record) : undefined,
        ellipsis:true
    }));

    !disabled && columns.push({
        title: '操作',
        key: 'action',
        width:117,
        render: (_: unknown, record: T) => (
            <>
            <div className="flex items-center">
                <Button key="edit" disabled={disabled} onClick={()=>{showModal(record)}} className={`h-[22px] border-none p-0 flex items-center bg-transparent`}>编辑</Button>
                <Divider key="div1" type="vertical" />
                <Button  key="delete" disabled={disabled} onClick={()=>{handleDelete(record._id || '')}} className={`h-[22px] border-none p-0 flex items-center bg-transparent`} >删除</Button>
                </div>
            </>
        ),
    });
    
    const formItems = configFields.map(({ title,key, component, required }) => {
        return (
                <Form.Item
                    label={title as string}
                    name={key as string}
                    rules={[{ required, message: `必填项`}]}
                >
                    {component}
                </Form.Item>
            )
        }
    );

    return (
        <>
            {!disabled && <Button className="" disabled={disabled} onClick={() => showModal()}>添加配置</Button>}
            {configurations.length > 0 &&
                <Table
                    className={`mt-btnybase border-solid border-[1px] border-BORDER border-b-0 rounded ${className}`} {...tableProps} dataSource={configurations} size="small" columns={columns} rowKey="_id" pagination={false}/>}
            <Modal
                title={editingConfig ? '编辑配置' : '添加配置'}
                open={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
                width={600}
                maskClosable={false}
                
            >
                <WithPermission access=""><Form form={form}  name="editableTableWithModal"
                    layout="vertical"
                    scrollToFirstError
                    //   labelCol={{ span: 7 }}
                    //   wrapperCol={{ span: 17}}
                      autoComplete="off">
                    {formItems}
                </Form></WithPermission>
            </Modal>
        </>
    );
};

export default EditableTableWithModal;
