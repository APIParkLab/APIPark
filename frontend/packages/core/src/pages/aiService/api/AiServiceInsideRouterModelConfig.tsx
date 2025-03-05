import { Codebox } from '@common/components/postcat/api/Codebox'
import { BasicResponse, PLACEHOLDER, RESPONSE_TIPS, STATUS_CODE } from '@common/const/const'
import { useFetch } from '@common/hooks/http'
import { $t } from '@common/locales'
import { AiProviderDefaultConfig, AiProviderLlmsItems } from '@core/pages/aiSetting/AiSettingList'
import { LocalLlmType } from '@core/pages/loadBalancing/type'
import { SimpleAiProviderItem } from '@core/pages/system/SystemConfig'
import { Form, message, Select, Tag } from 'antd'
import { DefaultOptionType } from 'antd/es/select'
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'

export type AiServiceRouterModelConfigHandle = {
  save: () => Promise<{ id: string; config: string, type: string, provider: string }>
}

export type AiServiceRouterModelConfigProps = {
  entity: AiServiceRouterModelConfigField
  llmList: AiProviderLlmsItems[]
}

type AiServiceRouterModelConfigField = {
  provider: string
  id: string
  config: string
  type: string
}

const AiServiceRouterModelConfig = forwardRef<AiServiceRouterModelConfigHandle, AiServiceRouterModelConfigProps>(
  (props, ref) => {
    const [form] = Form.useForm()
    const { entity } = props
    const [providerList, setProviderList] = useState<DefaultOptionType[]>([])
    const [llmList, setLlmList] = useState<DefaultOptionType[]>([])
    const [modelType, setModelType] = useState<'online' | 'local'>('online')
    const { fetchData } = useFetch()
    useImperativeHandle(ref, () => ({
      save: form.validateFields
    }))
    const [modelTypeList] = useState([
      {
        label: $t('线上模型'),
        value: 'online'
      },
      {
        label: $t('本地模型'),
        value: 'local'
      }
    ])

    /**
     * 获取本地模型列表
     * @param setDefaultValue 
     */
    const getLocalLlmList = (setDefaultValue?: boolean) => {
      fetchData<LocalLlmType[]>('simple/ai/models/local/configured', {
        method: 'GET',
        eoTransformKeys: ['default_config']
      }).then((response) => {
        const models = response.data.models || []
        setLlmList(
          models.map((x: any) => ({
            ...x,
            config: x.defaultConfig
          }))
        )
        if (setDefaultValue && models.length) {
          const id = models[0].id
          form.setFieldsValue({
            id,
            config: models.find((x) => x.id === id)?.defaultConfig
          })
        }
      })
    }

    /**
     * 切换模型类型
     * @param e
     */
    const modelTypeChange = (e: string) => {
      setModelType(e as 'online' | 'local')
      setLlmList([])
      form.setFieldsValue({
        provider: '',
        id: '',
        config: '',
        type: e
      })
      if (e === 'online') {
        getProviderList(true)
      } else {
        getLocalLlmList(true)
      }
    }

    useEffect(() => {
      setModelType(entity.type as 'online' | 'local')
      if (entity.type === 'online') {
        getProviderList()
        getLlmList(entity.provider, false)
      } else {
        getLocalLlmList()
      }
      form.setFieldsValue(entity)
    }, [])

    const getProviderList = (setDefaultValue?: boolean) => {
      setProviderList([])
      fetchData<BasicResponse<{ providers: SimpleAiProviderItem[] }>>('simple/ai/providers/configured', {
        method: 'GET',
        eoTransformKeys: []
      }).then((response) => {
        const { code, data, msg } = response
        if (code === STATUS_CODE.SUCCESS) {
          setProviderList(
            data.providers
              ?.map((x: SimpleAiProviderItem) => {
                return { ...x, label: x.name, value: x.id }
              })
          )
        if (setDefaultValue && data.providers.length) {
            const id = data.providers[0].id
            form.setFieldValue('provider', id)
            getLlmList(id)
          }
        } else {
          message.error(msg || $t(RESPONSE_TIPS.error))
        }
      })
    }

    const getLlmList = (provider: string, setDefaultValue = true) => {
      fetchData<BasicResponse<{ llms: AiProviderLlmsItems[]; provider: AiProviderDefaultConfig }>>('ai/provider/llms', {
        method: 'GET',
        eoParams: { provider },
        eoTransformKeys: ['default_llm']
      })
        .then((response) => {
          const { code, data, msg } = response
          if (code === STATUS_CODE.SUCCESS) {
            setLlmList(data.llms)
            if (setDefaultValue && data.llms.length) {
              form.setFieldsValue({
                id: data.provider.defaultLlm,
                config: data.llms.find((x) => x.id === data.provider.defaultLlm)?.config
              })
            }
          } else {
            message.error(msg || $t(RESPONSE_TIPS.error))
          }
        })
        .catch((errorInfo) => console.error(errorInfo))
    }

    return (
      <Form
        layout="vertical"
        labelAlign="left"
        scrollToFirstError
        form={form}
        className="mx-auto  flex flex-col  h-full"
        name="aiServiceInsideRouterModalConfig"
        autoComplete="off"
      >
        <Form.Item<AiServiceRouterModelConfigField> label={$t('模型类型')} name="type" rules={[{ required: true }]}>
          <Select
            className="w-INPUT_NORMAL"
            placeholder={$t(PLACEHOLDER.select)}
            options={modelTypeList}
            onChange={(e) => {
              modelTypeChange(e)
            }}
          ></Select>
        </Form.Item>
        {modelType === 'online' && (
          <Form.Item<AiServiceRouterModelConfigField>
            label={$t('模型供应商')}
            name="provider"
            rules={[{ required: true }]}
          >
            <Select
              className="w-INPUT_NORMAL"
              placeholder={$t(PLACEHOLDER.select)}
              options={providerList}
              onChange={(e) => {
                getLlmList(e)
              }}
            ></Select>
          </Form.Item>
        )}

        <Form.Item<AiServiceRouterModelConfigField> label={$t('模型')} name="id" rules={[{ required: true }]}>
          <Select
            className="w-INPUT_NORMAL"
            placeholder={$t(PLACEHOLDER.select)}
            options={
              llmList?.map((x) => ({
                value: x.id,
                label: (
                  <div className="flex items-center gap-[10px]" key={x.id}>
                    <span>{x.id}</span>
                    {modelType === 'online' && x?.scopes?.map((s: any) => <Tag>{s?.toLocaleUpperCase()}</Tag>)}
                  </div>
                )
              }))
            }
            onChange={(e) => {
              form.setFieldValue('config', llmList.find((x) => x.id === e)?.config)
            }}
          ></Select>
        </Form.Item>

        <Form.Item<AiServiceRouterModelConfigField> label={$t('参数')} name="config">
          <Codebox editorTheme="vs-dark" width="100%" height="300px" language="json" enableToolbar={false} />
        </Form.Item>
      </Form>
    )
  }
)

export default AiServiceRouterModelConfig
