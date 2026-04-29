
import { BasicResponse, PLACEHOLDER, RESPONSE_TIPS, STATUS_CODE } from '@common/const/const'
import { useFetch } from '@common/hooks/http'
import { $t } from '@common/locales/index.ts'
import { App, Form, Select, Tag } from 'antd'
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import { LoadBalancingHandle, LoadModelDetailData, LocalLlmType } from './type'
import { ApiResponse } from '../aiSetting/AIFlowChart'
import { AiProviderLlmsItems, ModelListData } from '../aiSetting/types'
import { DefaultOptionType } from 'antd/es/select'
const AddLoadBalancingModel = forwardRef<LoadBalancingHandle>((props, ref: any) => {
  const [form] = Form.useForm()
  const [modelProviderLoading, setModelProviderLoading] = useState(false)
  const [modelProviderData, setModelProviderData] = useState<ModelListData[]>([])
  const [llmList, setLlmList] = useState<DefaultOptionType[]>()
  const [modelType, setModelType] = useState<'online' | 'local'>('online')
  const { message } = App.useApp()
  const [llmListLoading, setLlmListLoading] = useState<boolean>(false)
  const { fetchData } = useFetch()

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
   * 获取 llm 列表
   * @param id
   */
  const getLlmList = (id?: string) => {
    setLlmListLoading(true)
    fetchData<BasicResponse<{ llms: AiProviderLlmsItems[] }>>(`ai/provider/llms`, {
      method: 'GET',
      eoParams: { provider: id },
      eoTransformKeys: ['default_llm']
    })
      .then((response) => {
        const { code, data, msg } = response
        if (code === STATUS_CODE.SUCCESS) {
          setLlmList(data.llms)
          form.setFieldValue('model', data.provider?.defaultLlm)
        } else {
          message.error(msg || $t(RESPONSE_TIPS.error))
        }
      })
      .finally(() => {
        setLlmListLoading(false)
      })
  }

  /**
   * 重置表单数据
   * @param e
   */
  const resetFormData = (e = 'online') => {
    form.setFieldValue('type', e)
    form.setFieldValue('model', '')
    form.setFieldValue('provider', '')
    setModelProviderData([])
    setLlmList([])
    setModelType(e as 'online' | 'local')
  }

  /**
   * 切换模型类型
   * @param e
   */
  const modelTypeChange = (e: string) => {
    resetFormData(e)
    if (e === 'online') {
      setModelProviderLoading(true)
      fetchData<ApiResponse>('simple/ai/providers/configured', {
        method: 'GET',
        eoTransformKeys: ['default_llm']
      })
        .then((response) => {
          const mockApiResponse: ApiResponse = response as ApiResponse
          const providers = mockApiResponse.data.providers || []
          setModelProviderData(providers)
          if (providers.length) {
            const id = providers[0].id
            form.setFieldValue('provider', id)
            getLlmList(id)
          }
        })
        .finally(() => {
          setModelProviderLoading(false)
        })
    } else {
      setLlmListLoading(true)
      fetchData<LocalLlmType[]>('simple/ai/models/local/configured', {
        method: 'GET'
      })
        .then((response) => {
          const models = response.data.models || []
          setLlmList(models)
          if (models.length) {
            const id = models[0].id
            form.setFieldValue('model', id)
          }
        })
        .finally(() => {
          setLlmListLoading(false)
        })
    }
  }

  /**
   * 模型提供商变化
   * @param e
   */
  const modelProviderChange = (e: string) => {
    form.setFieldValue('modelProvider', e)
    getLlmList(e)
  }

  useEffect(() => {
    modelTypeChange('online')
  }, [])

  /**
   * 保存
   */
  const save = () => {
    return new Promise((resolve, reject) => {
      form
        .validateFields()
        .then((values) => {
          fetchData<ApiResponse>('ai/balance', {
            method: 'POST',
            eoBody: values
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
            .catch((error) => {
              reject(error)
            })
        })
        .catch((errorInfo) => {
          reject(errorInfo)
        })
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
      <Form.Item<LoadModelDetailData> label={$t('模型类型')} name="type" rules={[{ required: true }]}>
        <Select
          showSearch
          optionFilterProp="label"
          className="w-INPUT_NORMAL"
          placeholder={$t(PLACEHOLDER.select)}
          options={modelTypeList}
          onChange={(e) => {
            modelTypeChange(e)
          }}
        ></Select>
      </Form.Item>
      {modelType === 'online' && (
        <Form.Item<LoadModelDetailData> label={$t('模型供应商')} name="provider" rules={[{ required: true }]}>
          <Select
            showSearch
            className="w-INPUT_NORMAL"
            filterOption={(input, option) => (option?.searchText ?? '').includes(input.toLowerCase())}
            placeholder={$t(PLACEHOLDER.select)}
            loading={modelProviderLoading}
            options={modelProviderData?.map((x) => ({
              value: x.id,
              label: (
                <div className="flex items-center gap-[10px]">
                  <span>{x.name}</span>
                </div>
              ),
              searchText: x.name.toLowerCase()
            }))}
            onChange={(e) => {
              modelProviderChange(e)
            }}
          ></Select>
        </Form.Item>
      )}
      <Form.Item label={$t('模型')} name="model" className="mt-[16px]" rules={[{ required: true }]}>
        <Select
          showSearch
          className="w-INPUT_NORMAL"
          placeholder={$t(PLACEHOLDER.input)}
          filterOption={(input, option) => (option?.searchText ?? '').includes(input.toLowerCase())}
          loading={llmListLoading}
          options={
            llmList?.map((x) => ({
                value: x.id,
                label: (
                  <div className="flex items-center gap-[10px]">
                    <span>{x.name || x.id}</span>
                    { modelType === 'online' &&x?.scopes?.map((s: any) => <Tag key={s}>{s?.toLocaleUpperCase()}</Tag>)}
                  </div>
                ),
                searchText: x.name.toLowerCase()
              }))
          }
          onChange={(value) => {
            form.setFieldValue('model', value)
          }}
        ></Select>
      </Form.Item>
    </Form>
  )
})

export default AddLoadBalancingModel
