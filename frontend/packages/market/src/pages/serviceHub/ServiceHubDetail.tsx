import { ApiFilled, ApiOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import { BasicResponse, RESPONSE_TIPS, STATUS_CODE } from '@common/const/const.tsx'
import { EntityItem, RouterParams } from '@common/const/type.ts'
import { useBreadcrumb } from '@common/contexts/BreadcrumbContext.tsx'
import { useFetch } from '@common/hooks/http.ts'
import { $t } from '@common/locales/index.ts'
import { Icon } from '@iconify/react/dist/iconify.js'
import { approvalTypeTranslate } from '@market/const/serviceHub/const.tsx'
import { App, Avatar, Button, Card, Descriptions, Divider, Tabs, Tag, Tooltip } from 'antd'
import { DefaultOptionType } from 'antd/es/cascader'
import DOMPurify from 'dompurify'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ApplyServiceHandle, ServiceBasicInfoType, ServiceDetailType } from '../../const/serviceHub/type.ts'
import { ApplyServiceModal } from './ApplyServiceModal.tsx'
import ServiceHubApiDocument from './ServiceHubApiDocument.tsx'
import { SERVICE_KIND_OPTIONS } from '@core/const/system/const.tsx'
import IntegrationAIContainer from '@core/pages/mcpService/IntegrationAIContainer.tsx'
import { Tool } from '@modelcontextprotocol/sdk/types.js'
import McpToolsContainer from '@core/pages/mcpService/McpToolsContainer.tsx'
import { useGlobalContext } from '@common/contexts/GlobalStateContext.tsx'

type TabItemType = {
  key: string
  label: string
  children: React.ReactNode
  icon?: React.ReactNode
}

const ServiceHubDetail = () => {
  const { serviceId } = useParams<RouterParams>()
  const { setBreadcrumb } = useBreadcrumb()
  const [serviceBasicInfo, setServiceBasicInfo] = useState<ServiceBasicInfoType>()
  const [serviceName, setServiceName] = useState<string>()
  const [serviceDesc, setServiceDesc] = useState<string>()
  const [serviceDoc, setServiceDoc] = useState<string>()
  const { fetchData } = useFetch()
  const applyRef = useRef<ApplyServiceHandle>(null)
  const { modal, message } = App.useApp()
  const [mySystemOptionList, setMySystemOptionList] = useState<DefaultOptionType[]>()
  const [service, setService] = useState<ServiceDetailType>()
  const [serviceMetrics, setServiceMetrics] = useState<{ title: string; icon: React.ReactNode; value: string }[]>([])
  const [serviceTags, setServiceTags] = useState<
    { color: string; textColor: string; title: string; content: React.ReactNode }[]
  >([])
  const [tools, setTools] = useState<Tool[]>([])
  const [tabItem, setTabItem] = useState<TabItemType[]>([])
  const [currentTab, setCurrentTab] = useState('')
  const { state } = useGlobalContext()
  const navigate = useNavigate()

  const modifyApiDoc = (apiDoc: string, apiPrefix: string) => {
    if (!apiDoc) return ''
    if (!apiPrefix) return apiDoc

    try {
      const openApiSpec = JSON.parse(apiDoc)
      // 遍历并修改paths，给每个路径添加前缀
      const modifiedPaths: Record<string, unknown> = {}
      for (const [path, pathItem] of Object.entries(openApiSpec.paths)) {
        modifiedPaths[apiPrefix + path] = pathItem
      }
      openApiSpec.paths = modifiedPaths
      return JSON.stringify(openApiSpec)
    } catch (err) {
      // 针对YAML格式或特殊格式的文本，直接进行字符串处理
      try {
        if (apiDoc.includes('paths:') && apiDoc.includes('openapi:')) {
          // 在paths:后面的路径前添加前缀
          // 找到paths:行的位置
          const pathsIndex = apiDoc.indexOf('paths:')
          if (pathsIndex !== -1) {
            try {
              // 在paths:之后的每个路径(以/开头的行)添加前缀
              let result = apiDoc.substring(0, pathsIndex + 6) // 包含'paths:'
              const rest = apiDoc.substring(pathsIndex + 6)

              // 添加servers部分
              if (!apiDoc.includes('servers:')) {
                const serverConfig = `info:
    title: API Space API
    version: 1.0.0
openapi: 3.0.1
servers:
  - url: ${apiPrefix}
    description: 默认服务器
`
                result = serverConfig + result.substring(result.indexOf('paths:'))
              }

              // 处理路径
              const lines = rest.split('\n')

              for (let i = 0; i < lines.length; i++) {
                const line = lines[i]
                const trimmedLine = line.trim()

                // 检测是否是路径行
                if (trimmedLine.match(/^\//)) {
                  // 这是一个路径行
                  const indentation = line.substring(0, line.indexOf('/'))
                  const pathWithoutIndent = line.substring(line.indexOf('/'))
                  lines[i] = indentation + apiPrefix + pathWithoutIndent
                }
              }

              return result + lines.join('\n')
            } catch (yamlProcessingError) {
              console.warn('处理YAML格式的API文档时出错', yamlProcessingError)
              // 处理失败时返回原始文档
              return apiDoc
            }
          }
        }
      } catch (outerError) {
        console.warn('拼接api前缀失败', outerError)
        return apiDoc
      }
    }
    return apiDoc
  }

  const getServiceBasicInfo = () => {
    fetchData<BasicResponse<{ service: ServiceDetailType }>>('catalogue/service', {
      method: 'GET',
      eoParams: { service: serviceId },
      eoTransformKeys: [
        'app_num',
        'api_num',
        'update_time',
        'api_doc',
        'invoke_address',
        'approval_type',
        'service_kind',
        'site_prefix',
        'enable_mcp',
        'mcp_server_address',
        'mcp_access_config',
        'openapi_address',
        'invoke_count'
      ]
    }).then((response) => {
      const { code, data, msg } = response
      if (code === STATUS_CODE.SUCCESS) {
        setService({
          ...data.service,
          apiDoc: modifyApiDoc(data.service.apiDoc, data.service.basic?.invokeAddress)
        })
        setServiceBasicInfo(data.service.basic)
        setServiceName(data.service.name)
        setServiceDesc(data.service.description)
        setServiceDoc(DOMPurify.sanitize(data.service.document))
        setServiceMetricsList(data.service.basic)
        setTabItemList(data.service.basic)
      } else {
        message.error(msg || $t(RESPONSE_TIPS.error))
      }
    })
  }

  const handleTabChange = (value: any) => {
    setCurrentTab(value)
  }

  const setServiceMetricsList = (serviceBasicInfo: ServiceBasicInfoType) => {
    // 设置服务指标数据
    setServiceMetrics([
      {
        title: 'API 数量',
        icon: <ApiOutlined className="mr-[1px] text-[14px] h-[14px] w-[14px]" />,
        value: serviceBasicInfo.apiNum.toString()
      },
      {
        title: '接入消费者数量',
        icon: <Icon icon="tabler:api-app" width="14" height="14" />,
        value: serviceBasicInfo.appNum.toString()
      },
      {
        title: '30天内调用次数',
        icon: <Icon icon="iconoir:graph-up" width="14" height="14" />,
        value: formatInvokeCount(serviceBasicInfo.invokeCount ?? 0)
      }
    ])
    // 设置服务标签数据
    const tags = [
      {
        color: '#7371fc1b',
        textColor: 'text-theme',
        title: serviceBasicInfo?.catalogue?.name || '-',
        content: serviceBasicInfo?.catalogue?.name || '-'
      },
      {
        color: '#fbe5e5',
        textColor: 'text-[#000]',
        title: serviceBasicInfo?.serviceKind || '-',
        content: SERVICE_KIND_OPTIONS.find((x) => x.value === serviceBasicInfo?.serviceKind)?.label || '-'
      }
    ]

    // 如果启用了MCP，添加MCP标签
    if (serviceBasicInfo?.enableMcp) {
      tags.push({
        color: '#ffc107',
        textColor: 'text-[#000]',
        title: 'MCP',
        content: 'MCP'
      })
    }

    setServiceTags(tags)
  }

  useEffect(() => {
    if (!serviceId) {
      console.warn('缺少serviceId')
      return
    }
    serviceId && getServiceBasicInfo()
  }, [serviceId])

  useEffect(() => {
    getMySelectList()
    setBreadcrumb([{ title: <Link to={`/serviceHub/list`}>{$t('服务市场')}</Link> }, { title: $t('服务详情') }])
  }, [])

  const getMySelectList = () => {
    setMySystemOptionList([])
    fetchData<BasicResponse<{ app: EntityItem[] }>>('apps/can_subscribe', { method: 'GET' }).then((response) => {
      const { code, data, msg } = response
      if (code === STATUS_CODE.SUCCESS) {
        setMySystemOptionList(
          data.app?.map((x: EntityItem) => {
            return {
              label: x.name,
              value: x.id
            }
          })
        )
      } else {
        message.error(msg || $t(RESPONSE_TIPS.error))
      }
    })
  }

  const openModal = (type: 'apply') => {
    modal.confirm({
      title: $t('申请服务'),
      content: (
        <ApplyServiceModal
          ref={applyRef}
          entity={{ ...serviceBasicInfo!, name: serviceName!, id: serviceId! }}
          mySystemOptionList={mySystemOptionList!}
        />
      ),
      onOk: () => {
        return applyRef.current?.apply().then((res) => {
          // if(res === true) setApplied(true)
        })
      },
      okText: $t('确认'),
      cancelText: $t('取消'),
      closable: true,
      icon: <></>,
      width: 600
    })
  }

  const handleToolsChange = (value: Tool[]) => {
    setTools(value)
  }
  // 格式化调用次数，添加K和M单位
  const formatInvokeCount = (count: number | null | undefined): string => {
    if (count === null || count === undefined) return '-'
    if (count >= 1000000) {
      const value = Math.floor(count / 100000) / 10
      return `${value}M`
    }
    if (count >= 1000) {
      const value = Math.floor(count / 100) / 10
      return `${value}K`
    }
    return count.toString()
  }

  /**
   * 定义一个更新标签项的函数，在serviceBasicInfo或tools变化时调用
   */
  const updateTabItems = useCallback(() => {
    if (!serviceBasicInfo) return
    const descriptionItem = [
      {
        label: $t('供应方'),
        value: serviceBasicInfo?.team?.name || '-',
        className: 'pb-[10px]'
      },
      {
        label: $t('版本'),
        value: serviceBasicInfo?.version || '-',
        className: 'pb-[10px]'
      },
      {
        label: $t('更新时间'),
        value: serviceBasicInfo?.updateTime || '-',
        className: 'pb-[10px]',
        isTimeString: true
      },
      {
        label: $t('审核'),
        value: serviceBasicInfo?.approvalType ? $t(approvalTypeTranslate[serviceBasicInfo?.approvalType] || '-') : '-',
        className: 'pb-[0px]'
      }
    ]
    const items: TabItemType[] = [
      {
        key: 'introduction',
        label: $t('介绍'),
        children: (
          <>
            <Card
              style={{
                borderRadius: '10px'
              }}
              className="w-full h-[calc(100vh-420px)] overflow-auto"
              classNames={{
                body: 'p-[10px]'
              }}
            >
              <Card
                style={{
                  borderRadius: '10px'
                }}
                className={`w-full`}
                classNames={{
                  body: 'p-[15px] h-auto bg-[#f8f8f8]'
                }}
              >
                <Descriptions column={1}>
                  {descriptionItem.map((item, index) => (
                    <Descriptions.Item key={index} label={item.label} className={item.className}>
                      {item.isTimeString ? (
                        <span className="truncate" title={item.value}>
                          {item.value}
                        </span>
                      ) : (
                        item.value
                      )}
                    </Descriptions.Item>
                  ))}
                </Descriptions>
              </Card>
              <div
                className="p-btnbase preview-document mb-PAGE_INSIDE_B"
                dangerouslySetInnerHTML={{ __html: serviceDoc || '' }}
              ></div>
            </Card>
          </>
        ),
        icon: <Icon icon="ic:baseline-space-dashboard" width="14" height="14" />
      },
      {
        key: 'api-document',
        label: $t('API'),
        children: (
          <Card
            style={{
              borderRadius: '10px'
            }}
            className="w-full h-[calc(100vh-420px)] overflow-auto"
            classNames={{
              body: 'p-[10px] pt-[0px]'
            }}
          >
            <ServiceHubApiDocument service={service!} />
          </Card>
        ),
        icon: <ApiFilled />
      }
    ]
    if (serviceBasicInfo.enableMcp) {
      items.push({
        key: 'MCP',
        label: 'MCP',
        children: <McpToolsContainer tools={tools} customClassName="h-[calc(100vh-420px)] overflow-auto" />,
        icon: <Icon icon="ph:network-x-fill" width="15" height="15" />
      })
    }
    setTabItem(items)
  }, [serviceBasicInfo, serviceDoc, service, tools, state.language])

  /**
   * 当初始化serviceBasicInfo时调用的函数
   * @param _serviceBasicInfo
   */
  const setTabItemList = (_serviceBasicInfo: ServiceBasicInfoType) => {
    // 只调用更新函数，更新将由useEffect处理
    updateTabItems()
  }
  useEffect(() => {
    if (serviceBasicInfo) {
      updateTabItems()
    }
  }, [tools, updateTabItems, serviceBasicInfo])

  return (
    <div className="pr-[40px]">
      <header>
        <Button type="text" onClick={() => navigate(`/serviceHub/list`)}>
          <ArrowLeftOutlined className="max-h-[14px]" />
          {$t('返回')}
        </Button>
      </header>
      <Card
        style={{
          borderRadius: '10px',
          background: 'linear-gradient(35deg, rgb(246, 246, 260) 0%, rgb(255, 255, 255) 40%)'
        }}
        className={`w-full mt-[20px]`}
        classNames={{
          body: 'p-[15px] h-[180px]'
        }}
      >
        <div className="service-info">
          <div className="flex items-center">
            <div>
              <Avatar
                shape="square"
                size={50}
                className={`rounded-[12px] border-none rounded-[12px] ${serviceBasicInfo?.logo ? 'bg-[linear-gradient(135deg,white,#f0f0f0)]' : 'bg-theme'}`}
                src={
                  serviceBasicInfo?.logo ? (
                    <img
                      src={serviceBasicInfo?.logo}
                      alt="Logo"
                      style={{ maxWidth: '200px', width: '45px', height: '45px', objectFit: 'unset' }}
                    />
                  ) : undefined
                }
                icon={serviceBasicInfo?.logo ? '' : <Icon icon="tabler:api-app" />}
              >
                {' '}
              </Avatar>
            </div>
            <div className="pl-[20px] w-[calc(100%-50px)] overflow-hidden">
              <p className="text-[14px] h-[20px] leading-[20px] truncate font-bold w-full flex items-center gap-[4px]">
                {serviceName}
              </p>
              <div className="mt-[5px] h-[20px] flex items-center font-normal">
                {serviceTags.map((tag, index) => (
                  <Tag
                    key={index}
                    color={tag.color}
                    className={`${tag.textColor} font-normal border-0 mr-[12px] max-w-[150px] truncate`}
                    bordered={false}
                    title={tag.title}
                  >
                    {tag.content}
                  </Tag>
                ))}
                {serviceMetrics.map((item, index) => (
                  <Tooltip key={index} title={$t(item.title)}>
                    <span className="mr-[12px] flex items-center">
                      <span className="h-[14px] mr-[4px] flex items-center">{item.icon}</span>
                      <span className="font-normal text-[14px]">{item.value}</span>
                    </span>
                  </Tooltip>
                ))}
              </div>
            </div>
          </div>
          <span className="line-clamp-2 mt-[15px] text-[12px] text-[#666]" title={serviceDesc}>
            {serviceDesc || $t('暂无服务描述')}
          </span>
        </div>
        <div className="absolute bottom-[15px]">
          <Button type="primary" onClick={() => openModal('apply')}>
            {$t('申请')}
          </Button>
        </div>
      </Card>
      <div className="flex">
        <Tabs
          className="p-btnbase pr-0 overflow-hidden [&>.ant-tabs-content-holder]:overflow-auto w-full flex-1 mr-[10px]"
          onChange={handleTabChange}
          items={tabItem}
        />
        <IntegrationAIContainer
          service={service}
          currentTab={currentTab}
          serviceId={serviceId}
          customClassName="mt-[70px] max-h-[calc(100vh-420px)] overflow-auto"
          type={'service'}
          handleToolsChange={handleToolsChange}
        ></IntegrationAIContainer>
      </div>
    </div>
  )
}

export default ServiceHubDetail
