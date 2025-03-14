import { Codebox } from '@common/components/postcat/api/Codebox'
import { BasicResponse, PLACEHOLDER, RESPONSE_TIPS, STATUS_CODE } from '@common/const/const'
import { useFetch } from '@common/hooks/http'
import { $t } from '@common/locales'
import { App, Form, InputNumber, Select, Switch, Tag, Tooltip } from 'antd'
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { AiProviderLlmsItems, ModelDetailData, AiSettingListItem, AISettingEntityItem } from './types'
import { MemberItem, SimpleTeamItem } from '@common/const/type'
import { useGlobalContext } from '@common/contexts/GlobalStateContext'
import AddModels, { addModelsContentHandle } from './contexts/AddModels'
import AddProvider, { addProviderContentHandle } from './contexts/AddProvider'

export type AiSettingModalContentProps = {
  entity?: AISettingEntityItem
  readOnly: boolean
  modelMode?: 'auto' | 'manual'
  source?: string
  /** 如果是手动选择 AI 模型，那么需要更新 footer 底部的内容，所以需要这个方法去更新外部的 footer */
  updateEntityData: (entity: AISettingEntityItem) => void
}

export type AiSettingModalContentHandle = {
  save: () => Promise<boolean | string>
  deployAIServer: () => Promise<boolean | string>
}

const AiSettingModalContent = forwardRef<AiSettingModalContentHandle, AiSettingModalContentProps>((props, ref) => {
  const [form] = Form.useForm()
  const { message, modal } = App.useApp()
  const { entity, readOnly, modelMode = 'auto', updateEntityData, source } = props
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
  // 添加模型弹窗
  const addModelModalRef = useRef<addModelsContentHandle>()
  // 添加供应商弹窗
  const addProviderModalRef = useRef<addProviderContentHandle>()
  // 记录最后的 llm id，因为如果手动加了 model，那么需要刷新
  const [lastLlmID, setLastLlmID] = useState<string | undefined>('')

  /**
   * 获取 llm 列表
   * @param id
   */
  const getLlmList = (id?: string) => {
    setLoading(true)
    const providerID = id || localEntity?.id
    setLastLlmID(providerID)
    fetchData<BasicResponse<{ llms: AiProviderLlmsItems[] }>>(`ai/provider/llms`, {
      method: 'GET',
      eoParams: { provider: providerID }
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
  const getModelProviderList = (setModelValue = true, defaultId?: string | number) => {
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
          if ((setModelValue && providers.length) || defaultId) {
            const id = defaultId || providers[0].id
            form.setFieldValue('modelMode', id)
            getModelConfig(id, defaultId)
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
  const getModelConfig = (id: string, defaultId?: string | number) => {
    getLlmList(id)
    fetchData<BasicResponse<{ providers: ModelDetailData[] }>>(`ai/provider/config`, {
      method: 'GET',
      eoParams: { provider: id },
      eoTransformKeys: ['get_apikey_url', 'default_llm']
    })
      .then((response) => {
        const { code, data, msg } = response
        if (code === STATUS_CODE.SUCCESS) {
          const modelEntity = {
            ...data.provider,
            isNewProvider: !!defaultId
          }
          setLocalEntity(modelEntity)
          setFormFieldsValue(modelEntity)
          updateEntityData?.(modelEntity)
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
        enable: fieldsValue.status === 'enabled'
      })
    } catch (e) {
      form.setFieldsValue({
        defaultLlm: localEntity?.defaultLlm,
        config: '',
        enable: true
      })
    }
  }
  useEffect(() => {
    if (localEntity?.id) {
      getModelConfig(localEntity.id)
      setFormFieldsValue(localEntity)
    } else {
      getModelProviderList()
      source && getTeamOptionList()
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
      try {
        form
          .validateFields()
          .then((value) => {
            const finalValue = {
              ...value
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

  /**
   * 添加模型
   */
  const addModel = () => {
    const providerName = localEntity?.name || form.getFieldValue('modelMode')
    const showAccessConfig = localEntity?.model_config?.access_configuration_status || false
    const accessConfig = localEntity?.model_config?.access_configuration_demo || ''
    modal.confirm({
      title: $t('添加 (0) 模型', [providerName]),
      content: (
        <AddModels
          ref={addModelModalRef}
          showAccessConfig={showAccessConfig}
          accessConfig={accessConfig}
          providerID={localEntity?.id}
        ></AddModels>
      ),
      onOk: () => {
        return addModelModalRef.current?.save().then((res) => {
          if (res) {
            getLlmList(lastLlmID)
            form.setFieldValue('defaultLlm', res)
          }
        })
      },
      width: 600,
      okText: $t('确认'),
      cancelText: $t('取消'),
      closable: true,
      icon: <></>
    })
  }

  /**
   * 添加自定义供应商
   */
  const addProvider = () => {
    modal.confirm({
      title: $t('添加自定义供应商'),
      content: <AddProvider ref={addProviderModalRef}></AddProvider>,
      onOk: () => {
        return addProviderModalRef.current?.save().then((res) => {
          if (res) {
            getModelProviderList(false, res.id)
          }
        })
      },
      width: 600,
      okText: $t('确认'),
      cancelText: $t('取消'),
      closable: true,
      icon: <></>
    })
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
      {modelMode === 'manual' && !localEntity?.isNewProvider && (
        <Form.Item<ModelDetailData> label={$t('模型供应商')}>
          <span className="absolute top-[-28px] right-0 text-theme cursor-pointer" onClick={addProvider}>
            + {$t('添加自定义供应商')}
          </span>
          <Form.Item<ModelDetailData> name="modelMode" rules={[{ required: true }]}>
            <Select
              showSearch
              className="w-INPUT_NORMAL"
              filterOption={(input, option) => (option?.searchText ?? '').includes(input.toLowerCase())}
              placeholder={$t(PLACEHOLDER.select)}
              loading={modelModeLoading}
              options={modelProviderListRef.current?.map((x) => ({
                value: x.id,
                label: (
                  <div className="flex items-center gap-[10px]">
                    <span>{x.name}</span>
                  </div>
                ),
                searchText: x.name.toLowerCase()
              }))}
              onChange={(e) => {
                getModelConfig(e)
              }}
            ></Select>
          </Form.Item>
        </Form.Item>
      )}
      <Form.Item<ModelDetailData> label={$t('默认模型')}>
        <span className="absolute top-[-28px] right-0 text-theme cursor-pointer" onClick={addModel}>
          + {$t('添加模型')}
        </span>
        <Form.Item<ModelDetailData> name="defaultLlm" rules={[{ required: true }]}>
          <Select
            showSearch
            className="w-INPUT_NORMAL"
            filterOption={(input, option) => (option?.searchText ?? '').includes(input.toLowerCase())}
            placeholder={$t(PLACEHOLDER.select)}
            loading={loading}
            options={llmList?.map((x) => ({
              value: x.id,
              label: (
                <div className="flex items-center gap-[10px]">
                  <span>{x.name || x.id}</span>
                  {x?.scopes?.map((s) => <Tag key={s}>{s?.toLocaleUpperCase()}</Tag>)}
                </div>
              ),
              searchText: x.name.toLowerCase()
            }))}
          ></Select>
        </Form.Item>
      </Form.Item>
      {source === 'guide' && (
        <Form.Item label={$t('所属团队')} name="team" className="mt-[16px]" rules={[{ required: true }]}>
          <Select
            className="w-INPUT_NORMAL"
            placeholder={$t(PLACEHOLDER.input)}
            options={teamList}
            onChange={(value) => {
              form.setFieldValue('team', value)
            }}
          ></Select>
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
      {source !== 'guide' && (
        <Form.Item className="p-4 bg-white rounded-lg" label={$t('LLM 状态管理')}>
          <div className="flex justify-between items-center">
            <div>
              <span className="text-gray-600">{$t('当前调用状态：')}</span>
              {localEntity?.status === 'enabled' && <Tag color="success">{$t('正常')}</Tag>}
              {localEntity?.status === 'disabled' && <Tag color="warning">{$t('停用')}</Tag>}
              {localEntity?.status === 'abnormal' && <Tag color="error">{$t('异常')}</Tag>}
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
          {(localEntity?.status === 'enabled' && !enableState) || (localEntity?.status !== 'enabled' && enableState) ? (
            <div className="mt-2 text-sm text-gray-500">* {getTooltipText(enableState)}</div>
          ) : null}
        </Form.Item>
      )}
    </Form>
  )
})

export default AiSettingModalContent
