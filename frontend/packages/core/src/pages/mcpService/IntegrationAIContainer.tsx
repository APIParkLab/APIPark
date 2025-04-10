import { App, Card, Select } from 'antd'
import { $t } from '@common/locales/index.ts'
import { Icon } from '@iconify/react/dist/iconify.js'
import { useEffect, useState } from 'react'
import ReactJson from 'react-json-view'
import { IconButton } from '@common/components/postcat/api/IconButton'
import { BasicResponse, RESPONSE_TIPS, STATUS_CODE } from '@common/const/const'
import { useFetch } from '@common/hooks/http'
import { useConnection } from './hook/useConnection'
import { ClientRequest, Tool, ListToolsResultSchema } from '@modelcontextprotocol/sdk/types.js'
import { z } from "zod";

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

const IntegrationAIContainer = ({ type, handleToolsChange }: { type: 'global' | 'service'; handleToolsChange: (value: Tool[]) => void }) => {
  const [activeTab, setActiveTab] = useState('mcp')
  const { message } = App.useApp()
  const [configContent, setConfigContent] = useState<string>('')
  const [apiKey, setApiKey] = useState<string>('')
  const [apiKeyList, setApiKeyList] = useState<{ value: string; label: string }[]>([])
  const [mcpServerUrl, setMcpServerUrl] = useState<string>('')
  const [errors, setErrors] = useState<Record<string, string | null>>({
    resources: null,
    prompts: null,
    tools: null,
  });
  
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
        configContent: '',
        apiKeys: []
      }
    }
    if (type === 'global') {
      params.openApi = {
        title: $t('Open API 文档'),
        configContent: '',
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
      await navigator.clipboard.writeText(value)
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

  /**
   * 获取 API Key 列表
   */
  const getKeysList = () => {
    fetchData<BasicResponse<null>>(type === 'global' ? 'simple/system/apikeys' : '', {
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
    setErrors((prev) => ({ ...prev, [tabKey]: null }));
  };

  const makeRequest = async <T extends z.ZodType>(
    request: ClientRequest,
    schema: T,
    tabKey?: keyof typeof errors,
  ) => {
    try {
      const response = await makeConnectionRequest(request, schema);
      if (tabKey !== undefined) {
        clearError(tabKey);
      }
      return response;
    } catch (e) {
      const errorString = (e as Error).message ?? String(e);
      if (tabKey !== undefined) {
        setErrors((prev) => ({
          ...prev,
          [tabKey]: errorString,
        }));
      }
      throw e;
    }
  };

  const listTools = async () => {
    const response = await makeRequest(
      {
        method: "tools/list" as const,
        params: {},
      },
      ListToolsResultSchema,
      "tools",
    );
    handleToolsChange(response.tools)
  };

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
    disconnect: disconnectMcpServer,
  } = useConnection({
    transportType: 'sse',
    sseUrl: '',
    proxyServerUrl: mcpServerUrl,
    requestTimeout: 1000,
  });

  useEffect(() => {
    if (type === 'global') {
      getGlobalMcpConfig()
      setMcpServerUrl('mcp/global/sse')
    }
    initTabsData()
    getKeysList()
  }, [])
  useEffect(() => {
    if (apiKey) {
      if (activeTab === 'openApi' && tabContent?.openApi?.configContent) {
        setConfigContent(tabContent?.openApi?.configContent?.replace('{your_api_key}', apiKey) || '')
      } else if (activeTab === 'mcp' && tabContent?.mcp?.configContent) {
        setConfigContent(tabContent.mcp.configContent?.replace('{your_api_key}', apiKey) || '')
      }
    }
  }, [apiKey, activeTab, tabContent])

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
        className="w-[400px] h-fit"
        classNames={{
          body: 'p-[10px]'
        }}
      >
        <p onClick={listTools}>
          <Icon
            icon="icon-park-solid:connection-point-two"
            className="align-text-bottom mr-[5px]"
            width="16"
            height="16"
          />
          {$t('AI 代理集成')}
        </p>
        <div className="tab-container mt-3">
          {type === 'service' && (
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
            <ReactJson
              src={configContent ? JSON.parse(configContent) : {}}
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
        )}
      </Card>
    </>
  )
}

export default IntegrationAIContainer
