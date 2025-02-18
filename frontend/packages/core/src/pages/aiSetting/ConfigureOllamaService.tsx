import { forwardRef, useEffect, useImperativeHandle } from 'react'
import { App, Divider, Form, Space, Switch, Tag, Input } from 'antd'
import { BasicResponse, RESPONSE_TIPS, STATUS_CODE } from '@common/const/const'
import { $t } from '@common/locales'
import WithPermission from '@common/components/aoplatform/WithPermission'
import { useFetch } from '@common/hooks/http'

export type ConfigureOllamaServiceHandle = {
  save: () => Promise<boolean | string>
}

const ConfigureOllamaService = forwardRef<ConfigureOllamaServiceHandle, any>((props, ref) => {
  const { address = '' } = props
  const [form] = Form.useForm()
  const { fetchData } = useFetch()
  const { message } = App.useApp()

  useEffect(() => {
    form.setFieldsValue({ address })
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
            fetchData<BasicResponse<null>>('model/local/source/ollama', {
              method: 'PUT',
              eoParams: { address: value.address },
              transformParams: false
            })
              .then((response) => {
                const { code, msg } = response
                if (code === STATUS_CODE.SUCCESS) {
                  message.success(msg || $t(RESPONSE_TIPS.success))
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
    <WithPermission access="">
      <Form
        layout="vertical"
        labelAlign="left"
        scrollToFirstError
        form={form}
        className="mx-auto "
        name="partitionInsideCert"
        autoComplete="off"
      >
        <Form.Item
          name="address"
          rules={[{ required: true, whitespace: true }]}
          className="p-4 bg-white rounded-lg"
          label={$t('Ollama 地址')}
        >
          <Input
            placeholder={$t('输入例如：https://www.apipark.com')}
            value={address}
            onChange={(e) => form.setFieldValue('address', e.target.value)}
          />
        </Form.Item>
      </Form>
    </WithPermission>
  )
})

export default ConfigureOllamaService
