import { Descriptions, DescriptionsProps, Spin, Tabs, Tooltip, message } from 'antd'
import { useEffect, useMemo, useState } from 'react'
import { $t } from '@common/locales/index.ts'
import React from 'react'
import { ExclamationCircleOutlined, LoadingOutlined } from '@ant-design/icons'
import { useGlobalContext } from '@common/contexts/GlobalStateContext'
import ApiNetWorkDataPreview from './ApiNetWorkDataPreview'
import { LogItem } from './ServiceLogs'
import { useFetch } from '@common/hooks/http'
import { BasicResponse, RESPONSE_TIPS, STATUS_CODE } from '@common/const/const'

// 定义状态码颜色映射枚举
export enum HttpStatusColor {
  SUCCESS = '#7EC26A',
  CLIENT_ERROR = '#F2CF59',
  SERVER_ERROR = '#f80f34'
}

type LogDetailProps = {
  selectedRow?: LogItem
  serviceType: 'aiService' | 'restService'
  serviceId?: string
  teamId?: string
}

type AIServiceDetailType = {
  id: string
  api: {
    id: string
    name: string
  }
  logTime: string
  consumer: {
    id: string
    name: string
  }
  isSystemConsumer: boolean
  status: string
  provider: {
    id: string
    name: string
  }
  model: string
  ip: string
  request: {
    header: string
    body: string
    origin: string
    token: number
  }
  response: {
    header: string
    body: string
    origin: string
    token: string
  }
}

type RestServiceDetailType = {
  id: string
  api: {
    id: string
    name: string
  }
  logTime: string
  consumer: {
    id: string
    name: string
  }
  isSystemConsumer: boolean
  status: string
  ip: string
  request: {
    header: string
    origin: string
  }
  response: {
    header: string
    origin: string
  }
}

const LogDetail = ({ selectedRow, serviceType, serviceId, teamId }: LogDetailProps) => {
  /** 顶部描述 */
  const [descriptionItems, setDescriptionItems] = useState<DescriptionsProps['items']>()
  /** 全局状态 */
  const { state } = useGlobalContext()
  /** Request 标签页数据 */
  const [requestInfoData, setRequestInfoData] = useState<{ [key: string]: string | undefined }>()
  /** Response 标签页数据 */
  const [responseInfoData, setResponseInfoData] = useState<{ [key: string]: string | undefined }>()
  /** 面板 loading */
  const [dashboardLoading, setDashboardLoading] = useState(true)
  /**
   * 请求数据
   */
  const { fetchData } = useFetch()

  /**
   * 根据状态码返回对应颜色的文本
   * @param status 状态
   * @returns
   */
  const renderStatusWithColor = (status: string) => {
    // 获取状态码首位数字
    const firstDigit = status.charAt(0)
    let color = ''
    switch (firstDigit) {
      case '2':
        color = HttpStatusColor.SUCCESS
        break
      case '4':
        color = HttpStatusColor.CLIENT_ERROR
        break
      case '5':
        color = HttpStatusColor.SERVER_ERROR
        break
      default:
        break
    }
    return color ? <span style={{ color }}>{status}</span> : status
  }

  /**
   * 获取标签页内容
   */
  const tabItems = useMemo(
    () => [
      {
        key: 'request',
        label: 'Request',
        children: <ApiNetWorkDataPreview configContent={requestInfoData} />
      },
      {
        key: 'response',
        label: 'Response',
        children: <ApiNetWorkDataPreview configContent={responseInfoData} />
      }
    ],
    [state.language, requestInfoData, responseInfoData]
  )

  /**
   * 设置 AI 描述文案
   */
  const getAIServiceDescriptionItemsList = ({
    time,
    api,
    consumer,
    status,
    model,
    ip
  }: {
    time: string
    api: string
    consumer: string
    status: string
    model: string
    ip: string
  }) => {
    setDescriptionItems([
      {
        key: 'time',
        label: $t('时间'),
        children: time
      },
      {
        key: 'api',
        label: $t('API / Tools'),
        children: api
      },
      {
        key: 'consumer',
        label: $t('消费者'),
        children: consumer
      },
      {
        key: 'httpStatus',
        label: $t('HTTP 状态'),
        children: renderStatusWithColor(status)
      },
      {
        key: 'model',
        label: $t('模型'),
        children: model
      },
      {
        key: 'ip',
        label: $t('IP'),
        children: ip
      }
    ])
  }

  /**
   * 设置 REST 描述文案
   */
  const getRestServiceDescriptionItemsList = ({
    time,
    api,
    consumer,
    isSystemConsumer,
    status,
    ip
  }: {
    time: string
    api: string
    consumer: string
    isSystemConsumer?: boolean
    status: string
    ip: string
  }) => {
    setDescriptionItems([
      {
        key: 'time',
        label: $t('时间'),
        children: time
      },
      {
        key: 'api',
        label: $t('API / Tools'),
        children: api
      },
      {
        key: 'consumer',
        label: $t('消费者'),
        children: (
          <>
            <span className="mr-[50px]">{consumer}</span>
            {isSystemConsumer && (
              <span>
                <span>System-level API Key</span>
                <Tooltip title={$t('通过系统级别的 API Key 来调用')}>
                  <span className="ml-[12px] items-center">
                    <ExclamationCircleOutlined className="text-[14px] h-[14px] w-[14px]" />
                  </span>
                </Tooltip>
              </span>
            )}
          </>
        )
      },
      {
        key: 'httpStatus',
        label: $t('HTTP 状态'),
        children: renderStatusWithColor(status)
      },
      {
        key: 'ip',
        label: $t('IP'),
        children: ip
      }
    ])
  }

  /**
   * 获取 AI 服务日志详情
   */
  const getAIServiceLogDetail = () => {
    fetchData<BasicResponse<{ log: AIServiceDetailType }>>('service/log/ai', {
      method: 'GET',
      eoParams: { log: selectedRow?.id, service: serviceId, team: teamId },
      eoTransformKeys: ['is_system_consumer', 'log_time'],
      eoApiPrefix: 'http://uat.apikit.com:11204/mockApi/aoplatform/api/v1/'
    }).then((response) => {
      const { code, data, msg } = response
      if (code === STATUS_CODE.SUCCESS) {
        // const result = data.log
        const result = {
          id: '123',
          api: {
            id: '222',
            name: 'api222'
          },
          logTime: '2023-01-01 00:00:00',
          consumer: {
            id: '333',
            name: 'consumers333'
          },
          isSystemConsumer: false,
          status: '200',
          provider: {
            id: '444',
            name: 'provider444'
          },
          model: 'model1',
          ip: '1.1.1.1',
          request: {
            header:
              '{\n  "mcpServers": {\n    "APIPark/test1234": {\n      "url": "http://swagger-demo.apinto.com/openapi/v1/mcp/service/c8bc25ca-8855-45cd-8bcc-239195b6c346/sse?apikey={your_api_key}"\n    }\n  }\n}',
            body: '{\n  "mcpServers": {\n    "APIPark/44444": {\n      "url": "http://swagger-demo.apinto.com/openapi/v1/mcp/service/c8bc25ca-8855-45cd-8bcc-239195b6c346/sse?apikey={your_api_key}"\n    }\n  }\n}',
            origin: '123',
            token: 0
          },
          response: {
            header:
              '{\n  "mcpServers": {\n    "APIPark/44444": {\n      "url": "http://swagger-demo.apinto.com/openapi/v1/mcp/service/c8bc25ca-8855-45cd-8bcc-239195b6c346/sse?apikey={your_api_key}"\n    }\n  }\n}',
            body: '{\n  "mcpServers": {\n    "APIPark/44444": {\n      "url": "http://swagger-demo.apinto.com/openapi/v1/mcp/service/c8bc25ca-8855-45cd-8bcc-239195b6c346/sse?apikey={your_api_key}"\n    }\n  }\n}',
            origin: '312',
            token: '333'
          }
        }
        getAIServiceDescriptionItemsList({
          time: result.logTime,
          api: result.api.name,
          consumer: result.consumer.name,
          status: result.status,
          model: result.model,
          ip: result.ip
        })
        setRequestInfoData({
          Header: result.request.header,
          Body: result.request.body,
          Origin: result.request.origin
        })
        setResponseInfoData({
          Header: result.response.header,
          Body: result.response.body,
          Origin: result.response.origin
        })
      } else {
        message.error(msg || $t(RESPONSE_TIPS.error))
      }
      setDashboardLoading(false)
    })
  }
  /**
   * 获取 REST 服务日志详情
   */
  const getRestServiceLogDetail = () => {
    fetchData<BasicResponse<{ log: RestServiceDetailType }>>('service/log/rest', {
      method: 'GET',
      eoParams: { log: selectedRow?.id, service: serviceId, team: teamId },
      eoTransformKeys: ['is_system_consumer', 'log_time'],
      eoApiPrefix: 'http://uat.apikit.com:11204/mockApi/aoplatform/api/v1/'
    }).then((response) => {
      const { code, data, msg } = response
      if (code === STATUS_CODE.SUCCESS) {
        const result = {
          id: '123',
          api: {
            id: '222',
            name: 'api222'
          },
          logTime: '2023-01-01 00:00:00',
          consumer: {
            id: '333',
            name: 'consumers333'
          },
          isSystemConsumer: true,
          status: '200',
          ip: '1.1.1.1',
          request: {
            header:
              '{\n  "mcpServers": {\n    "APIPark/test1234": {\n      "url": "http://swagger-demo.apinto.com/openapi/v1/mcp/service/c8bc25ca-8855-45cd-8bcc-239195b6c346/sse?apikey={your_api_key}"\n    }\n  }\n}',
            origin: '123'
          },
          response: {
            header:
              '{\n  "mcpServers": {\n    "APIPark/44444": {\n      "url": "http://swagger-demo.apinto.com/openapi/v1/mcp/service/c8bc25ca-8855-45cd-8bcc-239195b6c346/sse?apikey={your_api_key}"\n    }\n  }\n}',
            origin: '312'
          }
        }
        getRestServiceDescriptionItemsList({
          time: result.logTime,
          api: result.api.name,
          consumer: result.consumer.name,
          status: result.status,
          ip: result.ip,
          isSystemConsumer: result.isSystemConsumer
        })
        setRequestInfoData({
          Header: result.request.header,
          Origin: result.request.origin
        })
        setResponseInfoData({
          Header: result.response.header,
          Origin: result.response.origin
        })
      } else {
        message.error(msg || $t(RESPONSE_TIPS.error))
      }
      setDashboardLoading(false)
    })
  }
  useEffect(() => {
    setDashboardLoading(true)
    serviceType === 'aiService' ? getAIServiceLogDetail() : getRestServiceLogDetail()
  }, [serviceType])

  return (
    <Spin
      className="h-full pb-[20px]"
      wrapperClassName="h-full min-h-[150px]"
      indicator={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ transform: 'scale(1.5)' }}>
            <LoadingOutlined style={{ fontSize: 30 }} spin />
          </div>
        </div>
      }
      spinning={dashboardLoading}
    >
      <Descriptions
        column={1}
        className="[&_.ant-descriptions-item]:p-0 [&_.ant-descriptions-item]:py-[5px]"
        colon={false}
        items={descriptionItems}
        classNames={{
          label: 'w-[250px] text-right pr-[12px]'
        }}
        contentStyle={{ fontWeight: '600' }}
      />
      <div className="mt-[5px]">
        <Tabs
          className="overflow-hidden h-full [&>.ant-tabs-content-holder]:overflow-auto global-policy-tabs"
          items={tabItems}
        />
      </div>
    </Spin>
  )
}

export default LogDetail
