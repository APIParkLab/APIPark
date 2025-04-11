import { App, Button, Card, Empty, Select } from 'antd'
import { $t } from '@common/locales/index.ts'
import { Icon } from '@iconify/react/dist/iconify.js'
import { useEffect, useRef, useState } from 'react'
import ReactJson from 'react-json-view'
import { IconButton } from '@common/components/postcat/api/IconButton'
import { BasicResponse, RESPONSE_TIPS, STATUS_CODE } from '@common/const/const'
import { useFetch } from '@common/hooks/http'
import { useConnection } from './hook/useConnection'
import { ClientRequest, Tool, ListToolsResultSchema } from '@modelcontextprotocol/sdk/types.js'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { ServiceDetailType } from '@market/const/serviceHub/type'
import useCopyToClipboard from '@common/hooks/copy'

type ConfigList = {
  openApi?: {
    title: string
    configContent: string
    apiKeys: string[]
  }
  mcp: {
    title: string
    configContent: string
    apiKeys: string[]
  }
}

type ApiKeyItem = {
  expired: number
  id: string
  name: string
  value: string
}

const IntegrationAIContainer = ({
  type,
  handleToolsChange,
  customClassName,
  service,
  serviceId,
  currentTab
}: {
  type: 'global' | 'service'
  handleToolsChange: (value: Tool[]) => void
  customClassName?: string
  service?: ServiceDetailType
  serviceId?: string
  currentTab?: string
}) => {
  const [activeTab, setActiveTab] = useState(type === 'service' ? 'openApi' : 'mcp')
  const { message } = App.useApp()
  const [configContent, setConfigContent] = useState<string>('')
  const [apiKey, setApiKey] = useState<string>('')
  const [apiKeyList, setApiKeyList] = useState<{ value: string; label: string }[]>([])
  const [mcpServerUrl, setMcpServerUrl] = useState<string>('')
  const navigator = useNavigate()
  const { copyToClipboard } = useCopyToClipboard()
  const [errors, setErrors] = useState<Record<string, string | null>>({
    resources: null,
    prompts: null,
    tools: null
  })

  const [tabContent, setTabContent] = useState<ConfigList>({
    mcp: {
      title: $t('MCP 配置'),
      configContent: '',
      apiKeys: []
    }
  })
  const { fetchData } = useFetch()

  const initTabsData = () => {
    const params: ConfigList = {
      mcp: {
        title: $t('MCP 配置'),
        configContent: service?.mcpAccessConfig || '',
        apiKeys: []
      }
    }
    if (type === 'service') {
      params.openApi = {
        title: $t('Open API 文档'),
        configContent: service?.openapiAddress || '',
        apiKeys: []
      }
    }
    setTabContent(params)
  }

  /**
   * 复制
   * @param value
   * @returns
   */
  const handleCopy = async (value: string): Promise<void> => {
    if (value) {
      copyToClipboard(value)
      message.success($t(RESPONSE_TIPS.copySuccess))
    }
  }

  const handleChange = (value: string) => {
    setApiKey(value)
  }

  /**
   * 获取全局 MCP 配置
   * @returns
   */
  const getGlobalMcpConfig = () => {
    fetchData<BasicResponse<null>>('global/mcp/config', {
      method: 'GET'
    })
      .then((response) => {
        const { code, msg, data } = response
        if (code === STATUS_CODE.SUCCESS) {
          setTabContent((prevTabContent) => ({
            ...prevTabContent,
            mcp: {
              ...prevTabContent.mcp,
              configContent: data.config || ''
            }
          }))
        } else {
          message.error(msg || $t(RESPONSE_TIPS.error))
        }
      })
      .catch((errorInfo) => {
        message.error(errorInfo || $t(RESPONSE_TIPS.error))
      })
  }

  const addKey = () => {
    navigator('/mcpKey')
  }

  /**
   * 获取 API Key 列表
   */
  const getKeysList = () => {
    fetchData<BasicResponse<null>>(type === 'global' ? 'simple/system/apikeys' : 'my/apikeys', {
      method: 'GET'
    })
      .then((response) => {
        const { code, msg, data } = response
        if (code === STATUS_CODE.SUCCESS) {
          if (data.apikeys && data.apikeys.length > 0) {
            setApiKeyList(
              data.apikeys.map((item: ApiKeyItem) => {
                return {
                  label: item.name,
                  value: item.value
                }
              })
            )
            setApiKey(data.apikeys[0].value)
          }
        } else {
          message.error(msg || $t(RESPONSE_TIPS.error))
        }
      })
      .catch((errorInfo) => {
        message.error(errorInfo || $t(RESPONSE_TIPS.error))
      })
  }

  const clearError = (tabKey: keyof typeof errors) => {
    setErrors((prev) => ({ ...prev, [tabKey]: null }))
  }

  const makeRequest = async <T extends z.ZodType>(request: ClientRequest, schema: T, tabKey?: keyof typeof errors) => {
    try {
      const response = await makeConnectionRequest(request, schema)
      if (tabKey !== undefined) {
        clearError(tabKey)
      }
      return response
    } catch (e) {
      const errorString = (e as Error).message ?? String(e)
      if (tabKey !== undefined) {
        setErrors((prev) => ({
          ...prev,
          [tabKey]: errorString
        }))
      }
      throw e
    }
  }

  const listTools = async () => {
    const response = await makeRequest(
      {
        method: 'tools/list' as const,
        params: {}
      },
      ListToolsResultSchema,
      'tools'
    )
    handleToolsChange(response.tools)
  }

  const {
    connectionStatus,
    serverCapabilities,
    mcpClient,
    requestHistory,
    makeRequest: makeConnectionRequest,
    sendNotification,
    handleCompletion,
    completionsSupported,
    connect: connectMcpServer,
    disconnect: disconnectMcpServer
  } = useConnection({
    transportType: 'sse',
    sseUrl: '',
    proxyServerUrl: mcpServerUrl,
    requestTimeout: 1000
  })
  // 使用 useRef 保存最新的连接状态和断开函数
  const connectionStatusRef = useRef(connectionStatus)
  const disconnectFnRef = useRef(disconnectMcpServer)

  // 当连接状态或断开函数变化时更新 ref
  useEffect(() => {
    connectionStatusRef.current = connectionStatus
    disconnectFnRef.current = disconnectMcpServer
  }, [connectionStatus, disconnectMcpServer])

  const setupComponent = () => {
    initTabsData()
    if (type === 'global') {
      getGlobalMcpConfig()
      setMcpServerUrl('mcp/global/sse')
    } else {
      service?.basic.enableMcp && setMcpServerUrl(`mcp/service/${serviceId}/sse`)
    }
    getKeysList()
  }

  useEffect(() => {
    setupComponent()
  }, [service])
  useEffect(() => {
    if (type === 'service') {
      currentTab === 'MCP' ? setActiveTab('mcp') : setActiveTab('openApi')
    }
  }, [currentTab])
  // 仅在组件加载时执行初始化逻辑
  useEffect(() => {
    // 返回清理函数，只会在组件卸载时执行
    return () => {
      try {
        // 使用 ref 中保存的最新函数强制断开连接
        const disconnectFn = disconnectFnRef.current
        if (disconnectFn) {
          disconnectFn()
        }
      } catch (err) {
        console.error('断开连接时出错:', err)
      }
    }
  }, [type])
  useEffect(() => {
    if (activeTab === 'openApi' && tabContent?.openApi?.configContent) {
      setConfigContent(tabContent?.openApi?.configContent)
    } else if (activeTab === 'mcp' && tabContent?.mcp?.configContent) {
      setConfigContent(tabContent.mcp.configContent?.replace('{your_api_key}', apiKey || '{your_api_key}'))
    }
  }, [service, apiKey, activeTab, tabContent])

  useEffect(() => {
    if (mcpServerUrl) {
      if (connectionStatus === 'connected') {
        disconnectMcpServer()
      }
      connectMcpServer()
    }
  }, [mcpServerUrl])
  useEffect(() => {
    if (connectionStatus === 'connected') {
      listTools()
    }
  }, [connectionStatus])

  return (
    <>
      <Card
        style={{ borderRadius: '10px' }}
        className={`w-[400px] h-fit ${customClassName}`}
        classNames={{
          body: 'p-[10px]'
        }}
      >
        <p>
          <Icon
            icon="icon-park-solid:connection-point-two"
            className="align-text-bottom mr-[5px]"
            width="16"
            height="16"
          />
          {$t('AI 代理集成')}
        </p>
        <div className="tab-container mt-3">
          {type === 'service' && service?.basic.enableMcp && (
            <div className="tab-nav flex rounded-md overflow-hidden border border-solid border-[#3D46F2] w-fit">
              <div
                className={`tab-item px-5 py-1.5 cursor-pointer text-sm transition-colors ${activeTab === 'openApi' ? 'bg-[#3D46F2] text-white' : 'bg-white text-[#3D46F2]'}`}
                onClick={() => setActiveTab('openApi')}
              >
                Open API
              </div>
              <div
                className={`tab-item px-5 py-1.5 cursor-pointer text-sm transition-colors ${activeTab === 'mcp' ? 'bg-[#3D46F2] text-white' : 'bg-white text-[#3D46F2]'}`}
                onClick={() => setActiveTab('mcp')}
              >
                MCP
              </div>
            </div>
          )}
          <div className="tab-content font-semibold mt-[10px]">
            {activeTab === 'openApi' ? tabContent.openApi?.title : tabContent.mcp.title}
          </div>
          {/* 标签页内容区域 */}
          <div className="bg-[#0a0b21] text-white p-4 rounded-md my-2 font-mono text-sm overflow-auto relative">
            {activeTab === 'mcp' ? (
              <ReactJson
                src={
                  configContent
                    ? typeof configContent === 'string'
                      ? (() => {
                          try {
                            return JSON.parse(configContent);
                          } catch (e) {
                            return {};
                          }
                        })()
                      : configContent
                    : {}
                }
                theme="monokai"
                indentWidth={2}
                displayDataTypes={false}
                displayObjectSize={false}
                name={false}
                collapsed={false}
                enableClipboard={false}
                style={{
                  backgroundColor: 'transparent',
                  wordBreak: 'break-word',
                  whiteSpace: 'normal'
                }}
              />
            ) : (
              <>
                <pre className="whitespace-pre-wrap break-words">{configContent || ''}</pre>
              </>
            )}
            <IconButton
              name="copy"
              onClick={() => handleCopy(configContent)}
              sx={{
                position: 'absolute',
                top: '5px',
                right: '5px',
                color: '#999',
                transition: 'none',
                '&.MuiButtonBase-root:hover': {
                  background: 'transparent',
                  color: '#3D46F2',
                  transition: 'none'
                }
              }}
            ></IconButton>
          </div>
        </div>
        {activeTab === 'mcp' && (
          <>
            <div className="tab-content font-semibold my-[10px]">API Key</div>
            {apiKeyList.length ? (
              <>
                <Select value={apiKey} className="w-full" onChange={handleChange} options={apiKeyList} />
                <Card
                  style={{ borderRadius: '5px' }}
                  className="w-full mt-[5px] "
                  classNames={{
                    body: 'p-[5px]'
                  }}
                >
                  <div className="relative h-[25px]">
                    {apiKey}
                    <IconButton
                      name="copy"
                      onClick={() => handleCopy(configContent)}
                      sx={{
                        position: 'absolute',
                        top: '0px',
                        right: '5px',
                        color: '#999',
                        transition: 'none',
                        '&.MuiButtonBase-root:hover': {
                          background: 'transparent',
                          color: '#3D46F2',
                          transition: 'none'
                        }
                      }}
                    ></IconButton>
                  </div>
                </Card>
              </>
            ) : (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={''}>
                <Button onClick={addKey} type="primary">
                  {$t('新增 API Key')}
                </Button>
              </Empty>
            )}
          </>
        )}
      </Card>
    </>
  )
}

export default IntegrationAIContainer
