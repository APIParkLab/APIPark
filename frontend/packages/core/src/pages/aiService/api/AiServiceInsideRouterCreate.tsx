import { LoadingOutlined } from '@ant-design/icons'
import { EditableFormInstance } from '@ant-design/pro-components'
import { DrawerWithFooter } from '@common/components/aoplatform/DrawerWithFooter'
import EditableTableNotAutoGen from '@common/components/aoplatform/EditableTableNotAutoGen.tsx'
import InsidePage from '@common/components/aoplatform/InsidePage.tsx'
import PromptEditorResizable from '@common/components/aoplatform/prompt-editor/PromptEditorResizable.tsx'
import WithPermission from '@common/components/aoplatform/WithPermission'
import { BasicResponse, PLACEHOLDER, RESPONSE_TIPS, STATUS_CODE } from '@common/const/const.tsx'
import { useGlobalContext } from '@common/contexts/GlobalStateContext'
import { useFetch } from '@common/hooks/http.ts'
import { $t } from '@common/locales/index.ts'
import { validateUrlSlash } from '@common/utils/validate'
import { RouterParams } from '@core/components/aoplatform/RenderRoutes.tsx'
import { AI_SERVICE_VARIABLES_TABLE_COLUMNS } from '@core/const/ai-service/const.tsx'
import { VariableItems } from '@core/const/ai-service/type.ts'
import { API_PATH_MATCH_RULES } from '@core/const/system/const'
import { useAiServiceContext } from '@core/contexts/AiServiceContext.tsx'
import { Icon } from '@iconify/react/dist/iconify.js'
import { App, Button, Form, Input, InputNumber, Row, Space, Spin, Switch, Tag } from 'antd'
import { MutableRefObject, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AiServiceRouterModelConfig, { AiServiceRouterModelConfigHandle } from './AiServiceInsideRouterModelConfig'
import { AiProviderDefaultConfig, AiProviderLlmsItems } from '@core/pages/aiSetting/types'

type AiServiceRouterField = {
  name: string
  path: string
  prompt: string
  variables: Array<{ key: string; description: string; require: true }>
  description: string
  timeout: number
  retry: number
  disabled: boolean
}

type AiServiceRouterConfig = {
  name: string
  path: string
  aiPrompt: {
    prompt: string
    variables: Array<{ key: string; description: string; require: true }>
  }
  aiModel: {
    id: string
    config: string
  }
  description: string
  timeout: number
  retry: number
}

const AiServiceInsideRouterCreate = () => {
  const navigator = useNavigate()
  const { message } = App.useApp()
  const { serviceId, teamId, routeId, type } = useParams<RouterParams>()
  const [form] = Form.useForm()
  const { fetchData } = useFetch()
  const [loading, setLoading] = useState<boolean>(false)
  const { apiPrefix, prefixForce, aiServiceInfo } = useAiServiceContext()
  const [variablesTable, setVariablesTable] = useState<VariableItems[]>([])
  const [drawerType, setDrawerType] = useState<'edit' | undefined>()
  const [open, setOpen] = useState(false)
  const drawerAddFormRef = useRef<AiServiceRouterModelConfigHandle>(null)
  const [defaultLlm, setDefaultLlm] = useState<AiProviderDefaultConfig & { config: string }>()
  const [llmList, setLlmList] = useState<AiProviderLlmsItems[]>([])
  const [variablesTableRef, setVariablesTableRef] = useState<MutableRefObject<EditableFormInstance<T> | undefined>>()
  const { state } = useGlobalContext()
  const [resultPath, setResultPath] = useState<string>('')

  const onFinish = () => {
    return variablesTableRef?.current
      ?.validateFields()
      .then(() => {
        return form.validateFields().then((formValue) => {
          const { name, path, description, variables, prompt, timeout, retry, pathMatch, disabled } = formValue
          const body = {
            name,
            path: `${prefixForce ? apiPrefix + '/' : ''}${path.trim()}${pathMatch === 'prefix' ? '/*' : ''}`,
            description,
            timeout,
            retry,
            aiPrompt: { variables: variables, prompt: prompt },
            aiModel: { id: defaultLlm?.id, provider: defaultLlm?.provider, config: defaultLlm?.config, type: defaultLlm?.type },
            disabled
          }
          return fetchData<BasicResponse<null>>('service/ai-router', {
            method: routeId ? 'PUT' : 'POST',
            eoBody: body,
            eoParams: { service: serviceId, team: teamId, ...(routeId ? { router: routeId } : {}) },
            eoTransformKeys: ['aiPrompt', 'aiModel']
          })
            .then((response) => {
              const { code, msg } = response
              if (code === STATUS_CODE.SUCCESS) {
                message.success(msg || $t(RESPONSE_TIPS.success))
                navigator(`/service/${teamId}/aiInside/${serviceId}/route`)
                return Promise.resolve(true)
              } else {
                message.error(msg || $t(RESPONSE_TIPS.error))
                return Promise.reject(msg || $t(RESPONSE_TIPS.error))
              }
            })
            .catch((errInfo) => Promise.reject(errInfo))
        })
      })
      .catch((errInfo) => Promise.reject(errInfo))
  }
  const isAIApiPreview = type === 'apiDetail'
  const backUrl = isAIApiPreview ? `/aiApis/list` : `/service/${teamId}/aiInside/${serviceId}/route`
  const openDrawer = (type: 'edit') => {
    setDrawerType(type)
  }

  useEffect(() => {
    drawerType !== undefined ? setOpen(true) : setOpen(false)
  }, [drawerType])

  const getPath = (path: string) => {
    let newPath = path
    let pathMatch = 'full'
    if (prefixForce && path?.startsWith(apiPrefix + '/')) {
      newPath = path.slice((apiPrefix?.length || 0) + 1)
    }
    if (newPath.endsWith('/*')) {
      newPath = newPath.slice(0, -2)
      pathMatch = 'prefix'
    }
    return { newPath, pathMatch }
  }

  useEffect(() => {
    if (resultPath) {
      const { newPath, pathMatch } = getPath(resultPath)
      form.setFieldsValue({ path: newPath, pathMatch })
    }
  }, [apiPrefix, resultPath])

  const getRouterConfig = () => {
    setLoading(true)
    fetchData<BasicResponse<{ api: AiServiceRouterConfig }>>('service/ai-router', {
      method: 'GET',
      eoParams: { service: serviceId, team: teamId, router: routeId },
      eoTransformKeys: ['ai_model', 'ai_prompt']
    })
      .then((response) => {
        const { code, data, msg } = response
        if (code === STATUS_CODE.SUCCESS) {
          const { path, aiPrompt, aiModel } = data.api
          const { newPath, pathMatch } = getPath(path)
          form.setFieldsValue({
            ...data.api,
            ...aiPrompt,
            path: newPath,
            pathMatch
          })
          setResultPath(path)
          setVariablesTable(aiPrompt.variables as VariableItems[])
          setDefaultLlm(
            (prev) =>
              ({
                ...prev,
                provider: aiModel?.provider,
                id: aiModel?.id,
                config: aiModel.config,
                type: aiModel?.type,
                name: aiModel?.name
              }) as AiProviderDefaultConfig & { config: string }
          )
          getDefaultModelConfig({
            provider: aiModel?.provider,
            id: aiModel?.id,
            replaceDefaultLlm: false,
            setIcon: true,
            type: aiModel?.type
          })
        } else {
          message.error(msg || $t(RESPONSE_TIPS.error))
        }
      })
      .catch((errorInfo) => console.error(errorInfo))
      .finally(() => setLoading(false))
  }

  const getDefaultModelConfig = ({
    provider,
    id,
    replaceDefaultLlm = true,
    setIcon = true,
    type
  }: {
    provider?: string
    id?: string
    replaceDefaultLlm?: boolean
    setIcon?: boolean
    type?: string
  } = {}) => {
    // 如果编辑状态下 是本地 或者，新增状态下是本地
    if (type === 'local' || (!type && aiServiceInfo?.providerType === 'local')) {
      fetchData<BasicResponse<{ llms: AiProviderLlmsItems[]; provider: AiProviderDefaultConfig }>>('simple/ai/models/local/configured', {
        method: 'GET',
        eoTransformKeys: ['default_config']
      })
        .then((response) => {
          const { code, data, msg } = response
          if (code === STATUS_CODE.SUCCESS) {
            setLlmList(data.models)
            const localId = id || aiServiceInfo?.model
            
            if (replaceDefaultLlm) {
              setDefaultLlm((prev) => {
                const llmSetting = data.models?.find(
                  (x: AiProviderLlmsItems) => x.id === (prev?.id ?? localId)
                )
                return {
                  ...prev,
                  defaultLlm: localId,
                  provider: localId,
                  name: aiServiceInfo?.name,
                  config: llmSetting?.defaultConfig || '',
                  ...(llmSetting ?? {}),
                  type: 'local',
                } as AiProviderDefaultConfig & { config: string }
              })
            }
            if (setIcon) {
              setDefaultLlm((prev) => {
                const llmSetting = data.models?.find(
                  (x: AiProviderLlmsItems) => x.id === (prev?.id ?? localId)
                )
                return {
                  ...prev,
                  logo: llmSetting?.logo,
                  scopes: llmSetting?.scopes
                } as AiProviderDefaultConfig & { config: string }
              })
            }
          } else {
            message.error(msg || $t(RESPONSE_TIPS.error))
          }
        })
        .catch((errorInfo) => console.error(errorInfo))
    } else {
      fetchData<BasicResponse<{ llms: AiProviderLlmsItems[]; provider: AiProviderDefaultConfig }>>('ai/provider/llms', {
        method: 'GET',
        eoParams: { provider: provider ?? aiServiceInfo?.provider?.id },
        eoTransformKeys: ['default_llm']
      })
        .then((response) => {
          const { code, data, msg } = response
          if (code === STATUS_CODE.SUCCESS) {
            setLlmList(data.llms)
            if (replaceDefaultLlm) {
              setDefaultLlm((prev) => {
                const llmSetting = data.llms?.find(
                  (x: AiProviderLlmsItems) => x.id === (prev?.id ?? data.provider.defaultLlm)
                )
                return {
                  ...prev,
                  defaultLlm: data.provider.defaultLlm,
                  provider: data.provider.id,
                  name: data.provider.name,
                  config: llmSetting?.config || '',
                  ...(llmSetting ?? {}),
                  type: 'online',
                } as AiProviderDefaultConfig & { config: string }
              })
            }
            if (setIcon) {
              setDefaultLlm((prev) => {
                const llmSetting = data.llms?.find(
                  (x: AiProviderLlmsItems) => x.id === (prev?.id ?? data.provider.defaultLlm)
                )
                return {
                  ...prev,
                  logo: llmSetting?.logo,
                  scopes: llmSetting?.scopes
                } as AiProviderDefaultConfig & { config: string }
              })
            }
          } else {
            message.error(msg || $t(RESPONSE_TIPS.error))
          }
        })
        .catch((errorInfo) => console.error(errorInfo))
    }
    
  }

  useEffect(() => {
    !routeId && aiServiceInfo?.provider && getDefaultModelConfig()
  }, [aiServiceInfo])

  useEffect(() => {
    if (routeId) {
      getRouterConfig()
    } else {
      form.setFieldsValue({
        prefix: apiPrefix,
        variables: [{ key: 'Query', value: '', require: true }],
        prompt: '{{Query}}',
        retry: 0,
        timeout: 300000,
        pathMatch: 'prefix'
      })
    }
    return form.setFieldsValue({})
  }, [])

  const addVariable = () => {
    if (isAIApiPreview) return
    form.setFieldsValue({
      variables: [...form.getFieldValue('variables'), { key: '', value: '', require: true }]
    })
  }

  const handleVariablesChange = (newKeys: string[]) => {
    const variables = form.getFieldValue('variables') || []
    const variablesKeys = variables?.map(({ key }: { key: string }) => key)
    for (const key of newKeys) {
      if (!variablesKeys || variablesKeys.indexOf(key) === -1) {
        variables.push({ key, value: '', require: true })
      }
    }
    form.setFieldsValue({
      variables: [...variables]
    })
    setVariablesTable(variables as VariableItems[])
  }

  const handleValuesChange = (changedValues: Record<string, unknown>) => {
    if (changedValues.variables) {
      setVariablesTable(changedValues.variables as VariableItems[])
    }
  }

  const handlerSubmit: () => Promise<boolean> | undefined = () => {
    return drawerAddFormRef.current?.save()?.then((res: { id: string; config: string, type: string, provider: string }) => {
      getDefaultModelConfig({
        provider: res.provider,
        id: res.id,
        type: res.type,
        replaceDefaultLlm: false,
        setIcon: true
      })
      setDefaultLlm(
        (prev) =>
          ({
            ...prev,
            provider: res.provider,
            id: res.id,
            type: res.type,
            config: res.config,
            logo: llmList?.find((x: AiProviderLlmsItems) => x.id === res.id)?.logo
          }) as AiProviderDefaultConfig & { config: string }
      )
      return true
    })
  }

  const onClose = () => {
    setDrawerType(undefined)
  }

  const apiPathMatchRulesOptions = useMemo(
    () => API_PATH_MATCH_RULES.map((x) => ({ label: $t(x.label), value: x.value })),
    [state.language]
  )

  return (
    <InsidePage
      pageTitle={$t('AI 路由设置') || '-'}
      showBorder={false}
      scrollPage={false}
      className="overflow-y-auto"
      backUrl={backUrl}
      customBtn={
        <div className="flex items-center gap-btnbase">
          <Button
            icon={<Icon icon="ic:baseline-tune" height={18} width={18} />}
            iconPosition="end"
            disabled={isAIApiPreview}
            onClick={() => openDrawer('edit')}
          >
            <div className="flex items-center gap-[10px]">
              <span
                className="flex items-center  h-[24px] ai-setting-svg-container "
                dangerouslySetInnerHTML={{ __html: defaultLlm?.logo || '' }}
              ></span>
              <span>{defaultLlm?.name || defaultLlm?.id || defaultLlm?.defaultLlm}</span>
              {defaultLlm?.scopes?.map((x) => <Tag>{x?.toLocaleUpperCase()}</Tag>)}
            </div>
          </Button>
          {!isAIApiPreview && (
            <Button type="primary" onClick={onFinish}>
              {$t('保存')}
            </Button>
          )}
        </div>
      }
    >
      <Spin
        indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}
        spinning={loading}
        wrapperClassName=" pb-PAGE_INSIDE_B pr-PAGE_INSIDE_X"
      >
        <WithPermission disabled={isAIApiPreview}>
          <Form
            layout="vertical"
            labelAlign="left"
            scrollToFirstError
            form={form}
            className="flex flex-col mx-auto h-full"
            name="AiServiceInsideRouterCreate"
            onValuesChange={handleValuesChange}
            onFinish={onFinish}
            autoComplete="off"
          >
            <div className="">
              <Row className="flex justify-between items-center w-full gap-btnbase">
                <Form.Item<AiServiceRouterField>
                  className="flex-1"
                  label={$t('路由名称')}
                  name="name"
                  rules={[{ required: true, whitespace: true }]}
                >
                  <Input className="w-INPUT_NORMAL" placeholder={$t(PLACEHOLDER.input)} />
                </Form.Item>

                <Form.Item className="flex-1" label={$t('请求路径')}>
                  <Space.Compact block>
                    <Form.Item<AiServiceRouterField>
                      name="path"
                      rules={[
                        { required: true, whitespace: true },
                        {
                          validator: validateUrlSlash
                        }
                      ]}
                      noStyle
                    >
                      <Input
                        prefix={prefixForce ? `${apiPrefix}/` : '/'}
                        placeholder={$t(PLACEHOLDER.input)}
                        onChange={(e) => {
                          if ((e.target.value as string).endsWith('/*')) {
                            form.setFieldValue('path', e.target.value.slice(0, -2))
                            form.setFieldValue('pathMatch', 'prefix')
                          }
                        }}
                      />
                    </Form.Item>
                  </Space.Compact>
                </Form.Item>
              </Row>

              <Form.Item<AiServiceRouterField> label={$t('提示词')} name="prompt">
                <PromptEditorResizable
                  disabled={isAIApiPreview}
                  variablesChange={handleVariablesChange}
                  promptVariables={variablesTable}
                />
              </Form.Item>

              <Form.Item<AiServiceRouterField>
                label={
                  <div className="flex justify-between items-center w-full">
                    <span>{$t('变量')}</span>
                    <a
                      className={`flex items-center gap-[4px] ${isAIApiPreview ? 'cursor-not-allowed' : ''}`}
                      onClick={addVariable}
                    >
                      <Icon icon="ic:baseline-add" width={16} height={16} />
                      New
                    </a>
                  </div>
                }
                name="variables"
                className="[&>.ant-row>.ant-col>label]:w-full"
              >
                <EditableTableNotAutoGen<VariableItems & { _id: string }>
                  getFromRef={setVariablesTableRef}
                  configFields={AI_SERVICE_VARIABLES_TABLE_COLUMNS}
                />
              </Form.Item>

              <Form.Item<AiServiceRouterField> label={$t('描述')} name="description">
                <Input.TextArea className="w-INPUT_NORMAL" placeholder={$t('输入这个接口的描述')} />
              </Form.Item>

              <Row className="flex justify-between items-center w-full gap-btnbase">
                <Form.Item<AiServiceRouterField>
                  className="flex-1"
                  label={$t('请求超时时间')}
                  name={'timeout'}
                  rules={[{ required: true }]}
                >
                  <InputNumber className="w-INPUT_NORMAL" suffix="ms" min={1} placeholder={$t(PLACEHOLDER.input)} />
                </Form.Item>
                <Form.Item<AiServiceRouterField>
                  className="flex-1"
                  label={$t('重试次数')}
                  name={'retry'}
                  rules={[{ required: true }]}
                >
                  <InputNumber className="w-INPUT_NORMAL" min={0} placeholder={$t(PLACEHOLDER.input)} />
                </Form.Item>
              </Row>
              <Form.Item<AiServiceRouterField>
                label={$t('拦截接口')}
                name="disabled"
                extra={$t('开启拦截后，网关会拦截所有该路径的请求。')}
              >
                <Switch />
              </Form.Item>
            </div>
          </Form>
        </WithPermission>
      </Spin>
      <DrawerWithFooter title={$t('模型配置')} open={open} onClose={onClose} onSubmit={() => handlerSubmit()}>
        <AiServiceRouterModelConfig ref={drawerAddFormRef} llmList={llmList} entity={defaultLlm!} />
      </DrawerWithFooter>
    </InsidePage>
  )
}
export default AiServiceInsideRouterCreate
