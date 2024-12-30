import { Codebox } from '@common/components/postcat/api/Codebox'
import { BasicResponse, PLACEHOLDER, RESPONSE_TIPS, STATUS_CODE } from '@common/const/const'
import { useFetch } from '@common/hooks/http'
import { $t } from '@common/locales'
import { App, Form, InputNumber, Select, Tag } from 'antd'
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import { AiProviderConfig, AiProviderLlmsItems } from './AiSettingList'

export type AiSettingModalContentProps = {
  entity: AiProviderConfig & { defaultLlm: string }
  readOnly: boolean
}

export type AiSettingModalContentHandle = {
  save: () => Promise<boolean | string>
}

type AiSettingModalContentField = {
  config: string
  defaultLlm: string
  priority: number
}

const AiSettingModalContent = forwardRef<AiSettingModalContentHandle, AiSettingModalContentProps>((props, ref) => {
  const [form] = Form.useForm()
  const { message } = App.useApp()
  const { entity, readOnly } = props
  const { fetchData } = useFetch()
  const [llmList, setLlmList] = useState<AiProviderLlmsItems[]>()
  const [loading, setLoading] = useState<boolean>(false)

  const getLlmList = () => {
    setLoading(true)
    fetchData<BasicResponse<{ llms: AiProviderLlmsItems[] }>>(`ai/provider/llms`, {
      method: 'GET',
      eoParams: { provider: entity.id }
    })
      .then((response) => {
        const { code, data, msg } = response
        if (code === STATUS_CODE.SUCCESS) {
          setLlmList(data.llms)
        } else {
          message.error(msg || $t(RESPONSE_TIPS.error))
        }
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    getLlmList()
    try {
      form.setFieldsValue({
        defaultLlm: entity.defaultLlm,
        config: entity!.config ? JSON.stringify(JSON.parse(entity!.config), null, 2) : '',
        priority: entity.priority || 1
      })
    } catch (e) {
      form.setFieldsValue({
        defaultLlm: entity.defaultLlm,
        config: '',
        priority: 1
      })
    }
  }, [])

  const save: () => Promise<boolean | string> = () => {
    return new Promise((resolve, reject) => {
      form
        .validateFields()
        .then((value) => {
          const finalValue = {
            ...value,
            priority: Math.max(1, value.priority)
          }

          fetchData<BasicResponse<null>>('ai/provider/config', {
            method: 'PUT',
            eoParams: { provider: entity?.id },
            eoBody: finalValue,
            eoTransformKeys: ['defaultLlm']
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
    })
  }

  useImperativeHandle(ref, () => ({
    save
  }))

  return (
    <Form
      layout="vertical"
      labelAlign="left"
      scrollToFirstError
      form={form}
      className="flex flex-col mx-auto h-full"
      name="aiServiceInsideRouterModalConfig"
      autoComplete="off"
    >
      <Form.Item<AiSettingModalContentField> label={$t('默认模型')} name="defaultLlm" rules={[{ required: true }]}>
        <Select
          className="w-INPUT_NORMAL"
          placeholder={$t(PLACEHOLDER.select)}
          loading={loading}
          options={llmList?.map((x) => ({
            value: x.id,
            label: (
              <div className="flex items-center gap-[10px]">
                <span>{x.id}</span>
                {x?.scopes?.map((s) => <Tag key={s}>{s?.toLocaleUpperCase()}</Tag>)}
              </div>
            )
          }))}
        ></Select>
      </Form.Item>

      <Form.Item<AiSettingModalContentField>
        label={$t('优先级')}
        name="priority"
        rules={[
          { required: true },
          {
            validator: async (_, value) => {
              if (value <= 0) {
                throw new Error($t('优先级必须大于0'))
              }
              return Promise.resolve()
            }
          }
        ]}
        initialValue={1}
      >
        <InputNumber className="w-INPUT_NORMAL" min={1} placeholder={$t('请输入优先级')} />
      </Form.Item>

      <Form.Item<AiSettingModalContentField> label={$t('参数')} name="config">
        <Codebox
          editorTheme="vs-dark"
          readOnly={readOnly}
          width="100%"
          height="300px"
          language="json"
          enableToolbar={false}
        />
      </Form.Item>
    </Form>
  )
})

export default AiSettingModalContent
