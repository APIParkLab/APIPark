import { Codebox } from '@common/components/postcat/api/Codebox'
import { BasicResponse, PLACEHOLDER, RESPONSE_TIPS, STATUS_CODE } from '@common/const/const'
import { useFetch } from '@common/hooks/http'
import { $t } from '@common/locales'
import { App, Form, Select, Switch, Tag } from 'antd'
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import { AiProviderLlmsItems, ModelDetailData } from './types'

export type AiSettingModalContentProps = {
  entity?: { id: string | undefined; defaultLlm: string | undefined }
  readOnly: boolean
}

export type AiSettingModalContentHandle = {
  save: () => Promise<boolean | string>
}

const AiSettingModalContent = forwardRef<AiSettingModalContentHandle, AiSettingModalContentProps>((props, ref) => {
  const [form] = Form.useForm()
  const { message } = App.useApp()
  const { entity, readOnly } = props
  const { fetchData } = useFetch()
  const [llmList, setLlmList] = useState<AiProviderLlmsItems[]>()
  const [loading, setLoading] = useState<boolean>(false)
  const [enableState, setEnableState] = useState<boolean>(entity?.status === 'enabled' ?? true)
  const [providers, setProviders] = useState<Array<{ id: string; name: string }>>([])
  const [selectedProvider, setSelectedProvider] = useState<string>(entity?.id || '')

  const getUnconfiguredProviders = () => {
    if (entity) return // Skip if editing existing provider

    fetchData<BasicResponse<{ providers: Array<{ id: string; name: string }> }>>('ai/providers/unconfigured', {
      method: 'GET'
    }).then((response) => {
      const { code, data, msg } = response
      if (code === STATUS_CODE.SUCCESS) {
        setProviders(data.providers)
        if (data.providers.length > 0) {
          setSelectedProvider(data.providers[0].id)
          form.setFieldValue('provider', data.providers[0].id)
        }
      } else {
        message.error(msg || $t(RESPONSE_TIPS.error))
      }
    })
  }

  const getLlmList = () => {
    if (!selectedProvider) return

    setLoading(true)
    fetchData<BasicResponse<{ llms: AiProviderLlmsItems[] }>>(`ai/provider/llms`, {
      method: 'GET',
      eoParams: { provider: selectedProvider }
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
  const initData = async () => {
    if (entity?.id) {
      message.loading($t(RESPONSE_TIPS.loading))
      const { code, data, msg } = await fetchData<BasicResponse<{ provider: ModelDetailData }>>('ai/provider/config', {
        method: 'GET',
        eoParams: { provider: entity.id },
        eoTransformKeys: ['get_apikey_url', 'default_llm']
      })
      message.destroy()
      if (code !== STATUS_CODE.SUCCESS) {
        message.error(msg || $t(RESPONSE_TIPS.error))
        return
      }
      const provider = data.provider
      form.setFieldsValue({
        defaultLlm: provider.defaultLlm,
        config: provider.config ? JSON.stringify(JSON.parse(provider.config), null, 2) : '',
        enable: provider.status === 'enabled'
      })
      return
    }
    form.setFieldsValue({
      defaultLlm: entity?.defaultLlm,
      config: '',
      enable: true
    })
  }

  useEffect(() => {
    getUnconfiguredProviders()
  }, [])

  useEffect(() => {
    getLlmList()
  }, [selectedProvider])

  useEffect(() => {
    initData()
  }, [entity])

  const save: () => Promise<boolean | string> = () => {
    return new Promise(async (resolve, reject) => {
      try {
        form
          .validateFields()
          .then((value) => {
            const finalValue = {
              ...value,
              priority: Math.max(1, value.priority)
            }

            fetchData<BasicResponse<null>>('ai/provider/config', {
              method: entity ? 'PUT' : 'POST',
              eoParams: { provider: selectedProvider },
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
      } catch (error) {
        reject(error)
      }
    })
  }

  const getTooltipText = (isChecked: boolean) => {
    if (!isChecked) {
      return $t('保存后供应商状态变为【停用】，使用本供应商的 API 将临时使用负载优先级最高的正常供应商。')
    }
    return $t('保存后供应商状态变为【正常】，恢复调用本供应商的 AI 能力。')
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
      disabled={readOnly}
    >
      {!entity && (
        <Form.Item label={$t('供应商')} name="provider" rules={[{ required: true, message: $t('请选择供应商') }]}>
          <Select
            placeholder={$t('请选择供应商')}
            onChange={(value) => setSelectedProvider(value)}
            options={providers.map((p) => ({ label: p.name, value: p.id }))}
          />
        </Form.Item>
      )}
      <Form.Item<ModelDetailData> label={$t('默认模型')} name="defaultLlm" rules={[{ required: true }]}>
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

      <Form.Item<ModelDetailData> label={$t('API Key（默认 Key）')} name="config">
        <Codebox
          editorTheme="vs-dark"
          readOnly={readOnly}
          width="100%"
          height="200px"
          language="json"
          enableToolbar={false}
        />
      </Form.Item>
      {entity?.id && (
        <Form.Item className="p-4 bg-white rounded-lg" label={$t('LLM 状态管理')}>
          <div className="flex justify-between items-center">
            <div>
              <span className="text-gray-600">{$t('当前调用状态：')}</span>
              {entity.status === 'enabled' && <Tag color="success">{$t('正常')}</Tag>}
              {entity.status === 'disabled' && <Tag color="warning">{$t('停用')}</Tag>}
              {entity.status === 'abnormal' && <Tag color="error">{$t('异常')}</Tag>}
            </div>
            <Form.Item name="enable" valuePropName="checked" noStyle>
              <Switch
                checkedChildren={$t('启用')}
                unCheckedChildren={$t('停用')}
                onChange={(checked) => {
                  form.setFieldsValue({ enable: checked })
                  setEnableState(checked)
                }}
              />
            </Form.Item>
          </div>
          {(entity.status === 'enabled' && !enableState) || (entity.status !== 'enabled' && enableState) ? (
            <div className="mt-2 text-sm text-gray-500">* {getTooltipText(enableState)}</div>
          ) : null}
        </Form.Item>
      )}
    </Form>
  )
})

export default AiSettingModalContent
