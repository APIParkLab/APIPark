import { QuestionCircleOutlined } from '@ant-design/icons'
import { Codebox } from '@common/components/postcat/api/Codebox'
import { BasicResponse, PLACEHOLDER, RESPONSE_TIPS, STATUS_CODE } from '@common/const/const'
import { useFetch } from '@common/hooks/http'
import { $t } from '@common/locales'
import { App, Form, InputNumber, Select, Switch, Tag, Tooltip } from 'antd'
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import { AiProviderLlmsItems, ModelDetailData } from './types'

export type AiSettingModalContentProps = {
  entity: ModelDetailData & { defaultLlm: string }
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
  const [enableState, setEnableState] = useState<boolean>(entity.status === 'enabled')
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
        priority: entity.priority || 1,
        enable: entity.status === 'enabled'
      })
    } catch (e) {
      form.setFieldsValue({
        defaultLlm: entity.defaultLlm,
        config: '',
        priority: 1,
        enable: true
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
            // eoApiPrefix: 'http://uat.apikit.com:11204/mockApi/aoplatform/api/v1/'
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

  const getTooltipText = (isChecked: boolean) => {
    if (!isChecked) {
      return '保存后供应商状态变为【停用】，使用本供应商的 API 将临时使用负载优先级最高的正常供应商。'
    }
    return '保存后供应商状态变为【正常】，恢复调用本供应商的 AI 能力。'
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

      <Form.Item<ModelDetailData>
        label={
          <span className="flex items-center">
            {$t('负载优先级')}
            <Tooltip
              title={$t('负载优先级决定在原供应商异常或停用后，优先使用哪一个供应商。优先级数字越小，优先级越高。')}
            >
              <QuestionCircleOutlined className="ml-1 text-gray-500" />
            </Tooltip>
          </span>
        }
        name="priority"
        rules={[
          { required: true },
          {
            validator: async (_, value) => {
              if (value <= 0) {
                throw new Error($t('优先级必须大于 0'))
              }
              return Promise.resolve()
            }
          }
        ]}
        initialValue={1}
      >
        <InputNumber className="w-INPUT_NORMAL" min={1} placeholder={$t('请输入优先级')} />
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

      {entity.configured && (
        <Form.Item className="p-4 bg-white rounded-lg" label={$t('LLM 状态管理')}>
          <div className="flex justify-between items-center">
            <div>
              <span className="text-gray-600">当前调用状态：</span>
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
