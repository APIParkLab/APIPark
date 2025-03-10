import { App, Form, Input, Select, Tag } from 'antd'
import { $t } from '@common/locales'
import { BasicResponse, PLACEHOLDER, RESPONSE_TIPS, STATUS_CODE } from '@common/const/const'
import { useFetch } from '@common/hooks/http'
import { forwardRef, useImperativeHandle } from 'react'
import { AISettingEntityItem } from '../types'
type modelFieldType = {
  name: string
}

export type addProviderContentHandle = {
  save: () => Promise<AISettingEntityItem>
}

type addProviderContentProps = {
  provider: string
}

const AddProvider = forwardRef<addProviderContentHandle, addProviderContentProps>((props, ref) => {
  const [form] = Form.useForm()
  const { message } = App.useApp()
  const { fetchData } = useFetch()

  /**
   * 保存
   * @returns
   */
  const save: () => Promise<AISettingEntityItem> = () => {
    return new Promise((resolve, reject) => {
      try {
        form
          .validateFields()
          .then((value) => {
            const finalValue = {
              ...value
            }
            fetchData<BasicResponse<null>>('ai/provider', {
              method: 'POST',
              eoBody: finalValue
            })
              .then((response) => {
                const { code, data, msg } = response
                if (code === STATUS_CODE.SUCCESS) {
                  message.success($t(RESPONSE_TIPS.success) || msg)
                  resolve(data.provider)
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
      name="aiServiceInsideRouterModalConfig"
      autoComplete="off"
    >
      <Form.Item<modelFieldType> label={$t('供应商名称')} name="name" rules={[{ required: true }]}>
        <Input className="w-INPUT_NORMAL" placeholder={$t(PLACEHOLDER.input)} />
      </Form.Item>
      <p className="mt-[20px]">
        <span className="font-bold">{$t('注意：')}</span>
        <span>
          {$t('仅支持使用 OpenAI 输入输出格式和认证方法（APIKey）的供应商。如果不满足此条件，创建后自定义供应商将不可用。')}
        </span>
      </p>
    </Form>
  )
})

export default AddProvider
