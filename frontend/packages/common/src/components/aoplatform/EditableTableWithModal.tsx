import { useEffect, useMemo, useState } from 'react'
import { Button, Modal, Form, Table, FormInstance, TableProps, Divider } from 'antd'
import { v4 as uuidv4 } from 'uuid'
import WithPermission from './WithPermission'
import { $t } from '@common/locales'
import { COLUMNS_TITLE } from '@common/const/const'
import { useGlobalContext } from '@common/contexts/GlobalStateContext'
import TableBtnWithPermission from './TableBtnWithPermission'

export interface ConfigField<T> {
  title: string
  key: keyof T
  component: React.ReactNode
  renderText?: (value: unknown, record: T) => string
  required?: boolean
  ellipsis?: boolean
  unRender?: (form: FormInstance) => boolean
}

interface EditableTableWithModalProps<T> {
  configFields: ConfigField<T>[]
  value?: T[] // 外部传入的值
  className?: string
  onChange?: (newConfigItems: T[]) => void // 当配置项变化时，外部传入的回调函数
  tableProps?: TableProps<T>
  disabled?: boolean
}

const EditableTableWithModal = <T extends { _id?: string }>({
  configFields,
  value, // value 现在是外部传入的配置项数组
  onChange, // onChange 现在是当配置项数组变化时的回调函数
  tableProps,
  disabled,
  className
}: EditableTableWithModalProps<T>) => {
  const [form] = Form.useForm<FormInstance>()
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [configurations, setConfigurations] = useState<T[]>(value || [])
  const [editingConfig, setEditingConfig] = useState<T | null>(null)
  const { state } = useGlobalContext()
  const [formsValue, setFormsValue] = useState<FormInstance<unknown>>()

  const showModal = (config?: T) => {
    if (config) {
      form.setFieldsValue(config as Record<string, unknown>)
      setEditingConfig(config)
    } else {
      form.resetFields()
      setEditingConfig(null)
    }
    setIsModalVisible(true)
  }

  const handleCancel = () => {
    setIsModalVisible(false)
  }

  const handleDelete = (_id: string) => {
    const newConfigurations = configurations.filter((config) => config._id !== _id)
    setConfigurations(newConfigurations)
    onChange?.(newConfigurations)
  }

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        let newConfigurations = [...configurations]
        if (editingConfig && editingConfig._id) {
          newConfigurations = newConfigurations?.map((config) =>
            config._id === editingConfig._id ? { ...config, ...values } : config
          )
        } else {
          const newConfig = { _id: uuidv4(), ...values } as Record<string, unknown>
          newConfigurations.push(newConfig as T)
        }
        setConfigurations(newConfigurations)
        onChange?.(newConfigurations)
        setIsModalVisible(false)
      })
      .catch((info) => {
        console.log('Validate Failed:', info)
      })
  }

  useEffect(() => {
    setConfigurations(value?.map((x) => (x._id ? x : { ...x, _id: uuidv4() })) || [])
  }, [value])

  const columns = useMemo(
    () => [
      ...configFields.map(({ title, key, renderText }) => ({
        title: $t(title),
        dataIndex: key as string,
        key: key as string,
        render: renderText ? (value, record) => $t(renderText(value, record) || '') : undefined,
        ellipsis: true
      })),
      ...(disabled
        ? []
        : [
            {
              title: COLUMNS_TITLE.operate,
              key: 'action',
              btnNums: 2,
              render: (_: unknown, record: T) => (
                <>
                  <div className="flex items-center">
                    <TableBtnWithPermission
                      key="add"
                      disabled={disabled}
                      btnType="edit"
                      onClick={() => {
                        showModal(record)
                      }}
                      btnTitle="编辑"
                    />
                    <Divider key="div1" type="vertical" />
                    <TableBtnWithPermission
                      key="delete"
                      disabled={disabled}
                      btnType="delete"
                      onClick={() => {
                        handleDelete(record._id || '')
                      }}
                      btnTitle="删除"
                    />
                  </div>
                </>
              )
            }
          ])
    ],
    [state.language, disabled, configFields]
  )

  const formItems = useMemo(() => {
    return configFields.map(({ title, key, component, required, unRender }) => {
      return unRender && unRender(formsValue) ? null : (
        <Form.Item label={$t(title as string)} name={key as string} rules={[{ required }]}>
          {component}
        </Form.Item>
      )
    })
  }, [formsValue])

  return (
    <>
      {!disabled && (
        <Button className="" disabled={disabled} onClick={() => showModal()}>
          {$t('添加配置')}
        </Button>
      )}
      {configurations.length > 0 && (
        <Table
          className={`mt-btnybase border-solid border-[1px] border-BORDER border-b-0 rounded ${className}`}
          {...tableProps}
          dataSource={configurations}
          size="small"
          columns={columns}
          rowKey="_id"
          pagination={false}
        />
      )}
      <Modal
        title={editingConfig ? $t('编辑配置') : $t('添加配置')}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        width={600}
        maskClosable={false}
      >
        <WithPermission access="">
          <Form
            form={form}
            name="editableTableWithModal"
            layout="vertical"
            scrollToFirstError
            onFieldsChange={() => {
              setFormsValue(form.getFieldsValue())
            }}
            //   labelCol={{ span: 7 }}
            //   wrapperCol={{ span: 17}}
            autoComplete="off"
          >
            {formItems}
          </Form>
        </WithPermission>
      </Modal>
    </>
  )
}

export default EditableTableWithModal
