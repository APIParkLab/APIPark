import { QuestionCircleOutlined } from '@ant-design/icons'
import { Codebox } from '@common/components/postcat/api/Codebox'
import { BasicResponse, PLACEHOLDER, RESPONSE_TIPS, STATUS_CODE } from '@common/const/const'
import { useFetch } from '@common/hooks/http'
import { $t } from '@common/locales'
import { App, Form, InputNumber, Select, Switch, Tag, Tooltip } from 'antd'
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { AiProviderLlmsItems, ModelDetailData, AiSettingListItem } from './types'
import { MemberItem, SimpleTeamItem } from '@common/const/type'
import { useGlobalContext } from '@common/contexts/GlobalStateContext'

export type AiSettingModalContentProps = {
  entity: ModelDetailData & { defaultLlm: string }
  readOnly: boolean
  modelMode?: 'auto' | 'manual'
  /** 如果是手动选择 AI 模型，那么需要更新 footer 底部的内容，所以需要这个方法去更新外部的 footer */
  updateEntityData: (entity: ModelDetailData & { defaultLlm: string }) => void
}

export type AiSettingModalContentHandle = {
  save: () => Promise<boolean | string>
  deployAIServer: () => Promise<boolean | string>
}

const AiSettingModalContent = forwardRef<AiSettingModalContentHandle, AiSettingModalContentProps>((props, ref) => {
  const [form] = Form.useForm()
  const { message } = App.useApp()
  const { entity, readOnly, modelMode = 'auto', updateEntityData } = props
  const { fetchData } = useFetch()
  const [llmList, setLlmList] = useState<AiProviderLlmsItems[]>()
  const [loading, setLoading] = useState<boolean>(false)
  // AI 模型配置
  const [localEntity, setLocalEntity] = useState(entity)
  const [teamList, setTeamList] = useState<SimpleTeamItem[]>([])
  // AI 模型提供商列表
  const modelProviderListRef = useRef<AiSettingListItem[]>([])
  // 模型模式加载
  const [modelModeLoading, setModelModeLoading] = useState<boolean>(false)
  const [enableState, setEnableState] = useState<boolean>(localEntity?.status === 'enabled')
  const { checkPermission } = useGlobalContext()

  /**
   * 获取 llm 列表
   * @param id
   */
  const getLlmList = (id?: string) => {
    setLoading(true)
    fetchData<BasicResponse<{ llms: AiProviderLlmsItems[] }>>(`ai/provider/llms`, {
      method: 'GET',
      eoParams: { provider: id || localEntity.id }
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

  /**
   * 获取团队选项列表
   * @returns
   */
  const getTeamOptionList = async (): any[] => {
    const response = await fetchData<BasicResponse<{ teams: SimpleTeamItem[] }>>(
      !checkPermission('system.workspace.team.view_all') ? 'simple/teams/mine' : 'simple/teams',
      { method: 'GET', eoTransformKeys: [] }
    )
    const { code, data, msg } = response
    if (code === STATUS_CODE.SUCCESS) {
      const teamOptionList = data.teams?.map((x: MemberItem) => {
        return { ...x, label: x.name, value: x.id }
      })
      setTeamList(teamOptionList)
      if (form.getFieldValue('team') === undefined && data.teams?.length) {
        form.setFieldValue('team', data.teams[0].id)
      }
    } else {
      message.error(msg || $t(RESPONSE_TIPS.error))
      return []
    }
  }

  /**
   * 获取未配置模型提供者列表
   */
  const getModelProviderList = () => {
    setModelModeLoading(true)
    fetchData<BasicResponse<{ providers: AiSettingListItem[] }>>(`ai/providers/unconfigured`, {
      method: 'GET',
      eoTransformKeys: ['default_llm', 'default_llm_logo']
    })
      .then((response) => {
        const { code, data, msg } = response
        if (code === STATUS_CODE.SUCCESS) {
          const providers = data.providers || []
          modelProviderListRef.current = providers
          if (providers.length) {
            const id = providers[0].id
            form.setFieldValue('modelMode', id)
            getModelConfig(id)
          }
        } else {
          message.error(msg || $t(RESPONSE_TIPS.error))
        }
      })
      .finally(() => {
        setModelModeLoading(false)
      })
  }

  /**
   * 获取模型配置
   * @param id
   */
  const getModelConfig = (id: string) => {
    getLlmList(id)
    fetchData<BasicResponse<{ providers: ModelDetailData[] }>>(`ai/provider/config`, {
      method: 'GET',
      eoParams: { provider: id },
      eoTransformKeys: ['get_apikey_url']
    })
      .then((response) => {
        const { code, data, msg } = response
        if (code === STATUS_CODE.SUCCESS) {
          const modelEntity = {
            ...data.provider,
            defaultLlm: modelProviderListRef.current.find((x) => x.id === id)?.defaultLlm
          }
          setLocalEntity(modelEntity)
          setFormFieldsValue(modelEntity)
          updateEntityData(modelEntity)
        } else {
          message.error(msg || $t(RESPONSE_TIPS.error))
        }
      })
      .finally(() => {
        setModelModeLoading(false)
      })
  }

  /**
   * 设置表单字段值
   * @param fieldsValue
   */
  const setFormFieldsValue = (fieldsValue: any) => {
    try {
      form.setFieldsValue({
        defaultLlm: fieldsValue.defaultLlm,
        config: fieldsValue!.config ? JSON.stringify(JSON.parse(fieldsValue!.config), null, 2) : '',
        priority: fieldsValue.priority || 1,
        enable: fieldsValue.status === 'enabled'
      })
    } catch (e) {
      form.setFieldsValue({
        defaultLlm: localEntity.defaultLlm,
        config: '',
        priority: 1,
        enable: true
      })
    }
  }
  useEffect(() => {
    // 如果是直接在 AI 模型配置,则获取默认模型列表和团队列表
    if (modelMode === 'auto') {
      getLlmList()
      setFormFieldsValue(localEntity)
    } else {
      getModelProviderList()
      getTeamOptionList()
    }
  }, [])

  /**
   * 部署 AI 服务
   */
  const deployAIServer: () => Promise<boolean | string> = () => {
    return new Promise((resolve, reject) => {
      form
        .validateFields()
        .then((value) => {
          const finalValue = {
            config: value.config,
            model: value.defaultLlm,
            team: value.team,
            provider: localEntity?.id
          }
          console.log(finalValue)
          fetchData<BasicResponse<null>>('quick/service/ai', {
            method: 'POST',
            eoBody: finalValue
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

  /**
   * 保存
   * @returns 
   */
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
            eoParams: { provider: localEntity?.id },
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
      return $t('保存后供应商状态变为【停用】，使用本供应商的 API 将临时使用负载优先级最高的正常供应商。')
    }
    return $t('保存后供应商状态变为【正常】，恢复调用本供应商的 AI 能力。')
  }

  useImperativeHandle(ref, () => ({
    save,
    deployAIServer
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
      {modelMode === 'manual' && (
        <Form.Item<ModelDetailData> label={$t('模型供应商')} name="modelMode" rules={[{ required: true }]}>
          <Select
            className="w-INPUT_NORMAL"
            placeholder={$t(PLACEHOLDER.select)}
            loading={modelModeLoading}
            options={modelProviderListRef.current?.map((x) => ({
              value: x.id,
              label: (
                <div className="flex items-center gap-[10px]">
                  <span>{x.name}</span>
                </div>
              )
            }))}
            onChange={(e) => {
              getModelConfig(e)
            }}
          ></Select>
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
      {modelMode === 'auto' && (
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
      )}
      {modelMode === 'manual' && (
        <Form.Item label={$t('所属团队')} name="team" className="mt-[16px]" rules={[{ required: true }]}>
          <Select className="w-INPUT_NORMAL" placeholder={$t(PLACEHOLDER.input)} options={teamList} onChange={(value) => {
          form.setFieldValue('team', value)
        }}></Select>
        </Form.Item>
      )}

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

      {localEntity?.configured && (
        <Form.Item className="p-4 bg-white rounded-lg" label={$t('LLM 状态管理')}>
          <div className="flex justify-between items-center">
            <div>
              <span className="text-gray-600">{$t('当前调用状态：')}</span>
              {localEntity.status === 'enabled' && <Tag color="success">{$t('正常')}</Tag>}
              {localEntity.status === 'disabled' && <Tag color="warning">{$t('停用')}</Tag>}
              {localEntity.status === 'abnormal' && <Tag color="error">{$t('异常')}</Tag>}
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
          {(localEntity.status === 'enabled' && !enableState) || (localEntity.status !== 'enabled' && enableState) ? (
            <div className="mt-2 text-sm text-gray-500">* {getTooltipText(enableState)}</div>
          ) : null}
        </Form.Item>
      )}
    </Form>
  )
})

export default AiSettingModalContent
