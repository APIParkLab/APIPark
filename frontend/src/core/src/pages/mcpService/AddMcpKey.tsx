import { App, Form, Input } from 'antd'
import { $t } from '@common/locales'
import { BasicResponse, PLACEHOLDER, RESPONSE_TIPS, STATUS_CODE } from '@common/const/const'
import { useFetch } from '@common/hooks/http'
import { v4 as uuidv4 } from 'uuid'

import { forwardRef, useEffect, useImperativeHandle } from 'react'
type modelFieldType = {
  name: string
  type: string
  model_parameters: string
  access_configuration: string
}

export type addMcpKeysHandle = {
  save: () => Promise<boolean | string>
}

type addMcpKeysProps = {
  name?: string
  value?: string
  type?: string
  apikey?: string
}

const AddMcpKey = forwardRef<addMcpKeysHandle, addMcpKeysProps>((props, ref) => {
  const { name = '', value: editValue = '', type = 'new', apikey = '' } = props
  const [form] = Form.useForm()
  const { message } = App.useApp()
  const { fetchData } = useFetch()

  useEffect(() => {
    form.setFieldsValue({
      name,
      value: editValue
    })
  }, [])
  /**
   * 保存
   * @returns
   */
  const save: () => Promise<boolean | string> = () => {
    return new Promise((resolve, reject) => {
      try {
        form
          .validateFields()
          .then((value) => {
            console.log('value', value)
            const finalValue = {
              ...value,
              value: editValue ? editValue : uuidv4(),
              expired: 0
            }
            fetchData<BasicResponse<any>>('system/apikey', {
              method: type === 'new' ? 'POST' : 'PUT',
              eoBody: finalValue,
              ...(type === 'edit' ? {
                eoParams: { apikey }
              } : {})
            })
              .then((response) => {
                const { code, msg } = response
                if (code === STATUS_CODE.SUCCESS) {
                  message.success($t(RESPONSE_TIPS.success) || msg)
                  resolve(true)
                } else {
                  message.error(msg || $t(RESPONSE_TIPS.error))
                  reject(msg || $t(RESPONSE_TIPS.error))
                }
              })
              .catch((errorInfo) => reject(errorInfo))
          })
          .catch((errorInfo) => reject(errorInfo))
      } catch (error) {
        reject(error)
      }
    })
  }

  useImperativeHandle(ref, () => ({
    save
  }))

  return (
    <Form
      form={form}
      layout="vertical"
      labelAlign="left"
      scrollToFirstError
      className="flex flex-col mx-auto h-full"
      name="mcpKeyModalConfig"
      autoComplete="off"
    >
      <Form.Item<modelFieldType> label={$t('名称')} name="name" rules={[{ required: true }]}>
        <Input autoFocus className="w-INPUT_NORMAL" placeholder={$t(PLACEHOLDER.input)} />
      </Form.Item>
    </Form>
  )
})

export default AddMcpKey
