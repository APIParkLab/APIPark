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
import { IntegrationAIContainer, IntegrationAIContainerRef } from '@core/pages/mcpService/IntegrationAIContainer.tsx'
import { Tool } from '@modelcontextprotocol/sdk/types.js'
import McpToolsContainer from '@core/pages/mcpService/McpToolsContainer.tsx'
import { useGlobalContext } from '@common/contexts/GlobalStateContext.tsx'
import TopBreadcrumb from '@common/components/aoplatform/Breadcrumb.tsx'
import ServiceInfoCard from '@common/components/aoplatform/serviceInfoCard.tsx'

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
  const [serviceDoc, setServiceDoc] = useState<string>()
  const { fetchData } = useFetch()
  const applyRef = useRef<ApplyServiceHandle>(null)
  const { modal, message } = App.useApp()
  const [mySystemOptionList, setMySystemOptionList] = useState<DefaultOptionType[]>()
  const [service, setService] = useState<ServiceDetailType>()
  const [tools, setTools] = useState<Tool[]>([])
  const [tabItem, setTabItem] = useState<TabItemType[]>([])
  const [currentTab, setCurrentTab] = useState('')
  const { state } = useGlobalContext()
  const integrationAIContainerRef = useRef<IntegrationAIContainerRef>(null)
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
        setServiceDoc(DOMPurify.sanitize(data.service.document))
        setTabItemList(data.service.basic)
      } else {
        message.error(msg || $t(RESPONSE_TIPS.error))
      }
    })
  }

  const handleTabChange = (value: any) => {
    setCurrentTab(value)
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
  }, [])
  useEffect(() => {
    setBreadcrumb([
      {
        title: $t('API 门户'),
        onClick: () => navigate(`/portal/list`)
      },
      { title: service?.name || '-' },
      { title: $t('服务详情') }
    ])
  }, [state.language, service])

  const getMySelectList = () => {
    setMySystemOptionList([])
    fetchData<BasicResponse<{ app: EntityItem[] }>>('apps/can_subscribe', {
      method: 'GET',
      eoParams: { service: serviceId },
      eoTransformKeys: ['is_subscribed']
    }).then((response) => {
      const { code, data, msg } = response
      if (code === STATUS_CODE.SUCCESS) {
        setMySystemOptionList(
          data.app
            ?.sort((a: EntityItem, b: EntityItem) => {
              // 已订阅的排在后面
              if (a.isSubscribed && !b.isSubscribed) return 1
              if (!a.isSubscribed && b.isSubscribed) return -1
              return 0
            })
            .map((x: EntityItem) => {
              return {
                label: x.name,
                value: x.id,
                disabled: x.isSubscribed // 已订阅的设为禁用
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
          entity={{ ...serviceBasicInfo!, name: service?.name || '', id: serviceId! }}
          mySystemOptionList={mySystemOptionList!}
        />
      ),
      onOk: () => {
        return applyRef.current?.apply().then((res) => {
          if (res === true) {
            integrationAIContainerRef.current?.getServiceKeysList()
            getMySelectList()
          }
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
        <TopBreadcrumb handleBackCallback={() => navigate(`/portal/list`)} />
      </header>
      <ServiceInfoCard
        serviceBasicInfo={{
          ...serviceBasicInfo,
          serviceName: service?.name || '',
          serviceDesc: service?.description || ''
        }}
        customClassName="mt-[20px]"
        actionSlot={
          <>
            <Button type="primary" onClick={() => openModal('apply')}>
              {$t('申请')}
            </Button>
          </>
        }
      />
      <div className="flex">
        <Tabs
          className="p-btnbase pr-0 overflow-hidden [&>.ant-tabs-content-holder]:overflow-auto w-full flex-1 mr-[10px]"
          onChange={handleTabChange}
          items={tabItem}
        />
        <IntegrationAIContainer
          ref={integrationAIContainerRef}
          service={service}
          currentTab={currentTab}
          serviceId={serviceId}
          customClassName="mt-[70px] max-h-[calc(100vh-420px)] overflow-auto"
          type={'service'}
          openModal={openModal}
          handleToolsChange={handleToolsChange}
        ></IntegrationAIContainer>
      </div>
    </div>
  )
}

export default ServiceHubDetail
