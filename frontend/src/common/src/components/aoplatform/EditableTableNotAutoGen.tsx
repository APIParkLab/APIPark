import { EditableFormInstance, EditableProTable } from '@ant-design/pro-components'
import { useState, useEffect, useMemo, useRef, MutableRefObject } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { PageProColumns } from './PageList'
import TableBtnWithPermission from './TableBtnWithPermission'
import { $t } from '@common/locales'
import { useGlobalContext } from '@common/contexts/GlobalStateContext'
import { Form } from 'antd'
import { debounce } from 'lodash-es'

interface EditableTableProps<T> {
  configFields: PageProColumns<T>[]
  value?: T[] // 外部传入的值
  className?: string
  onChange?: (newConfigItems: T[]) => void // 当配置项变化时，外部传入的回调函数
  // tableProps?: TableProps<T>;
  disabled?: boolean
  getFromRef?: (form: MutableRefObject<EditableFormInstance<T> | undefined>) => void
}

const EditableTableNotAutoGen = <T extends { _id: string }>({
  configFields,
  value, // value 现在是外部传入的配置项数组
  onChange, // onChange 现在是当配置项数组变化时的回调函数
  // tableProps,
  disabled,
  className,
  getFromRef
}: EditableTableProps<T>) => {
  const [configurations, setConfigurations] = useState<(T | { _id: string })[]>(value || [{ _id: '1234' }])
  const { state } = useGlobalContext()
  const form = useRef<EditableFormInstance<T>>()
  const [tableForm] = Form.useForm()
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>(() => value?.map((item) => item._id) || ['1234'])

  useEffect(() => {
    getFromRef?.(form)
  }, [form])

  useEffect(() => {
    const newValue = value?.map((x) => (x._id ? x : { ...x, _id: uuidv4() })) || [{ _id: uuidv4() }]
    setConfigurations(newValue)
    setTimeout(() => validateForm(), 1000)
  }, [value])

  const validateForm = async () => {
    await tableForm.validateFields()
  }

  const translatedColumns = useMemo(
    () =>
      configFields.map((x) => ({
        ...x,
        title: $t(x.title as string),
        formItemProps: {
          ...(x.formItemProps || {}),
          rules: [
            ...(x.formItemProps?.rules || []).map((r: Record<string, string>) => {
              if (r.message) {
                r.message = $t(r.message)
              }
              return r
            })
          ]
        }
      })),
    [state.language, configFields]
  )

  const debouncedOnChange = useMemo(
    () =>
      debounce((value) => {
        onChange?.(value)
      }, 500),
    [onChange]
  )

  return (
    <EditableProTable<T>
      className={className}
      columns={translatedColumns}
      onChange={debouncedOnChange}
      controlled={true}
      rowKey="_id"
      value={configurations as T[]}
      size="small"
      editableFormRef={form}
      bordered={true}
      recordCreatorProps={false}
      editable={{
        type: 'multiple',
        form: tableForm,
        // errorType:'default',
        editableKeys: disabled ? [] : configurations?.map((x) => x._id),
        actionRender: (row, config) => {
          return [
            <TableBtnWithPermission
              key="delete"
              btnType="delete"
              btnTitle="删除"
              onClick={() => {
                setConfigurations((prev) => {
                  const tmpPreData = [...prev]
                  tmpPreData.splice(Number(config.index), 1)
                  onChange?.(tmpPreData)
                  return tmpPreData
                })
                setEditableRowKeys((prev) => prev.filter((x) => x !== config._id))
              }}
            />
          ]
        },
        onChange: setEditableRowKeys
      }}
    />
  )
}

export default EditableTableNotAutoGen
