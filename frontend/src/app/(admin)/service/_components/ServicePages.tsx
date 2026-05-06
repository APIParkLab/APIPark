'use client'

import PageList from '@common/components/aoplatform/PageList'
import ServiceInfoCard from '@common/components/aoplatform/serviceInfoCard'
import TableBtnWithPermission from '@common/components/aoplatform/TableBtnWithPermission'
import { TimeRange } from '@common/components/aoplatform/TimeRangeSelector'
import { BasicResponse, RESPONSE_TIPS, STATUS_CODE } from '@common/const/const'
import { SimpleMemberItem, SimpleTeamItem } from '@common/const/type'
import { useGlobalContext } from '@common/contexts/GlobalStateContext'
import { useFetch } from '@common/hooks/http'
import { $t } from '@common/locales'
import { ActionType } from '@ant-design/pro-components'
import { LoadingOutlined } from '@ant-design/icons'
import { App as AppAntd, Card, Menu, MenuProps, Spin, Tag } from 'antd'
import { AI_SERVICE_ROUTER_TABLE_COLUMNS } from '@core/const/ai-service/const'
import { AiServiceRouterTableListItem } from '@core/const/ai-service/type'
import { SERVICE_KIND_OPTIONS, SYSTEM_API_TABLE_COLUMNS, SYSTEM_TABLE_COLUMNS } from '@core/const/system/const'
import { SystemApiTableListItem, SystemTableListItem } from '@core/const/system/type'
import RankingList from '@core/pages/serviceOverview/rankingList/RankingList'
import ServiceAreaChart from '@core/pages/serviceOverview/charts/ServiceAreaChart'
import ServiceBarChar, { BarChartInfo } from '@core/pages/serviceOverview/charts/ServiceBarChar'
import DateSelectFilter, { TimeOption } from '@core/pages/serviceOverview/filter/DateSelectFilter'
import { setBarChartInfoData } from '@core/pages/serviceOverview/utils'
import { LogsFooter } from '@core/pages/system/serviceDeployment/ServiceDeployMentFooter'
import { ServiceDeployment } from '@core/pages/system/serviceDeployment/ServiceDeployment'
import {
  abbreviateFloat,
  formatBytes,
  formatDuration,
  formatNumberWithUnit,
  getTime
} from '@dashboard/utils/dashboard'
import { useRouter } from 'next/navigation'
import { ReactNode, useEffect, useMemo, useRef, useState } from 'react'

export type ServiceSide = 'inside' | 'aiInside'
export type ServiceMenuKey =
  | 'overview'
  | 'route'
  | 'api'
  | 'upstream'
  | 'document'
  | 'servicepolicy'
  | 'publish'
  | 'approval'
  | 'subscriber'
  | 'setting'
  | 'logs'

function ServiceOverviewIndicator({
  indicatorInfo,
  onNavigate
}: {
  indicatorInfo: any
  onNavigate: (path: string) => void
}) {
  const side = indicatorInfo?.serviceKind === 'ai' ? 'aiInside' : 'inside'
  const items = [
    {
      title: indicatorInfo?.enableMcp ? 'APIs / Tools' : 'APIs',
      link: `/service/${indicatorInfo?.teamId}/${side}/${indicatorInfo?.serviceId}/route`,
      content: indicatorInfo?.apiNum ?? 0
    },
    {
      title: $t('订阅数量'),
      link: `/service/${indicatorInfo?.teamId}/${side}/${indicatorInfo?.serviceId}/subscriber`,
      content: indicatorInfo?.subscriberNum ?? 0
    },
    {
      title: 'MCP',
      link: `/service/${indicatorInfo?.teamId}/${side}/${indicatorInfo?.serviceId}/setting`,
      content: indicatorInfo?.enableMcp ? $t('已开启') : $t('开启 MCP')
    }
  ]

  return (
    <div className="flex">
      {items.map((item, index) => (
        <Card
          key={item.title}
          className={`flex-1 rounded-[10px] ${index > 0 ? 'ml-[10px]' : ''}`}
          classNames={{ body: 'py-[20px] px-[18px]' }}
          onClick={() => {
            if (item.link) {
              onNavigate(item.link)
            }
          }}
        >
          <div className="text-[14px] text-[#999999] mb-[10px]" style={{ fontFamily: 'Microsoft YaHei' }}>
            {item.title}
          </div>
          <div
            className={`${index < 2 ? 'text-[32px] font-medium text-[#101010]' : 'text-[14px]'}`}
            style={{ fontFamily: 'Microsoft YaHei' }}
          >
            {item.content}
          </div>
        </Card>
      ))}
    </div>
  )
}

export function ServiceOverviewPage({
  serviceType,
  teamId,
  serviceId
}: {
  serviceType: 'aiService' | 'restService'
  teamId: string
  serviceId: string
}) {
  const { fetchData } = useFetch()
  const { message } = AppAntd.useApp()
  const { state } = useGlobalContext()
  const router = useRouter()
  const [dashboardLoading, setDashboardLoading] = useState(true)
  const [defaultTime] = useState<TimeOption>('day')
  const [timeRange, setTimeRange] = useState<TimeRange | undefined>()
  const [barChartInfo, setBarChartInfo] = useState<any>()
  const [perBarChartInfo, setPerBarChartInfo] = useState<any>()
  const [indicatorInfo, setIndicatorInfo] = useState<any>([])
  const [topRankingList, setTopRankingList] = useState<any>([])
  const [aiServiceOverview, setAiServiceOverview] = useState<any>()
  const [restServiceOverview, setRestServiceOverview] = useState<any>()

  const selectCallback = (date: TimeRange) => {
    setTimeRange(date)
  }

  const setRestChartInfo = (serviceOverview: any) => {
    setIndicatorInfo({
      apiNum: serviceOverview.apiNum,
      subscriberNum: serviceOverview.subscriberNum,
      teamId,
      enableMcp: serviceOverview.enableMcp,
      serviceKind: serviceOverview.serviceKind,
      serviceId
    })
    setBarChartInfo([
      {
        ...setBarChartInfoData({
          title: $t('请求次数'),
          data: serviceOverview.requestOverview,
          value: formatNumberWithUnit(serviceOverview.requestTotal),
          date: serviceOverview.date
        }),
        request2xxTotal: formatNumberWithUnit(serviceOverview.request2xxTotal),
        request4xxTotal: formatNumberWithUnit(serviceOverview.request4xxTotal),
        request5xxTotal: formatNumberWithUnit(serviceOverview.request5xxTotal)
      },
      {
        ...setBarChartInfoData({
          title: $t('网络流量'),
          data: serviceOverview.trafficOverview,
          value: formatBytes(serviceOverview.trafficTotal),
          date: serviceOverview.date
        }),
        traffic2xxTotal: formatBytes(serviceOverview.traffic2xxTotal),
        traffic4xxTotal: formatBytes(serviceOverview.traffic4xxTotal),
        traffic5xxTotal: formatBytes(serviceOverview.traffic5xxTotal)
      }
    ])
    setPerBarChartInfo([
      {
        title: $t('平均响应时间'),
        data: serviceOverview.avgResponseTimeOverview,
        value: formatDuration(serviceOverview.avgResponseTime),
        originValue: serviceOverview.avgResponseTime,
        date: serviceOverview.date,
        max: formatDuration(serviceOverview.maxResponseTime),
        min: formatDuration(serviceOverview.minResponseTime),
        type: 'area',
        showXAxis: false
      },
      {
        ...setBarChartInfoData({
          title: $t('平均每消费者的请求次数'),
          data: serviceOverview.avgRequestPerSubscriberOverview,
          date: serviceOverview.date,
          showXAxis: false
        }),
        max: abbreviateFloat(serviceOverview.maxRequestPerSubscriber),
        min: abbreviateFloat(serviceOverview.minRequestPerSubscriber)
      },
      {
        ...setBarChartInfoData({
          title: $t('平均每消费者的网络流量'),
          data: serviceOverview.avgTrafficPerSubscriberOverview,
          date: serviceOverview.date,
          showXAxis: false
        }),
        max: formatBytes(serviceOverview.maxTrafficPerSubscriber),
        min: formatBytes(serviceOverview.minTrafficPerSubscriber)
      }
    ])
  }

  const setAiChartInfo = (serviceOverview: any) => {
    setIndicatorInfo({
      apiNum: serviceOverview.apiNum,
      subscriberNum: serviceOverview.subscriberNum,
      teamId,
      enableMcp: serviceOverview.enableMcp,
      serviceKind: serviceOverview.serviceKind,
      serviceId
    })
    setBarChartInfo([
      {
        ...setBarChartInfoData({
          title: $t('请求次数'),
          data: serviceOverview.requestOverview,
          value: formatNumberWithUnit(serviceOverview.requestTotal),
          date: serviceOverview.date
        }),
        request2xxTotal: formatNumberWithUnit(serviceOverview.request2xxTotal),
        request4xxTotal: formatNumberWithUnit(serviceOverview.request4xxTotal),
        request5xxTotal: formatNumberWithUnit(serviceOverview.request5xxTotal)
      },
      {
        ...setBarChartInfoData({
          title: $t('Token 消耗'),
          data: serviceOverview.tokenOverview.map((item: { inputToken: number; outputToken: number }) => ({
            inputToken: item.inputToken,
            outputToken: item.outputToken
          })),
          value: formatNumberWithUnit(serviceOverview.tokenTotal),
          date: serviceOverview.date
        }),
        inputTokenTotal: formatNumberWithUnit(serviceOverview.inputTokenTotal),
        outputTokenTotal: formatNumberWithUnit(serviceOverview.outputTokenTotal)
      }
    ])
    setPerBarChartInfo([
      {
        title: $t('平均 Token 消耗'),
        data: serviceOverview.avgTokenOverview,
        value: `${formatNumberWithUnit(serviceOverview.avgToken)} Token/s`,
        originValue: serviceOverview.avgToken,
        date: serviceOverview.date,
        min: `${formatNumberWithUnit(serviceOverview.minToken)} Token/s`,
        max: `${formatNumberWithUnit(serviceOverview.maxToken)} Token/s`,
        type: 'area'
      },
      {
        ...setBarChartInfoData({
          title: $t('平均每消费者的请求次数'),
          data: serviceOverview.avgRequestPerSubscriberOverview,
          date: serviceOverview.date
        }),
        max: abbreviateFloat(serviceOverview.maxRequestPerSubscriber),
        min: abbreviateFloat(serviceOverview.minRequestPerSubscriber)
      },
      {
        ...setBarChartInfoData({
          title: $t('平均每消费者的 Token 消耗'),
          data: serviceOverview.avgTokenPerSubscriberOverview.map((item: { inputToken: number; outputToken: number }) => ({
            inputToken: item.inputToken,
            outputToken: item.outputToken
          })),
          date: serviceOverview.date
        }),
        max: abbreviateFloat(serviceOverview.maxTokenPerSubscriber),
        min: abbreviateFloat(serviceOverview.minTokenPerSubscriber)
      }
    ])
  }

  const getAIServiceOverview = () => {
    fetchData<BasicResponse<{ overview: any }>>('service/overview/monitor/ai', {
      method: 'GET',
      eoParams: { service: serviceId, team: teamId, start: timeRange?.start, end: timeRange?.end },
      eoTransformKeys: [
        'enable_mcp',
        'subscriber_num',
        'api_num',
        'service_kind',
        'avaliable_monitor',
        'request_overview',
        'token_overview',
        'avg_token_overview',
        'avg_request_per_subscriber_overview',
        'avg_token_per_subscriber_overview',
        'request_total',
        'token_total',
        'avg_token',
        'max_token',
        'min_token',
        'avg_request_per_subscriber',
        'avg_token_per_subscriber',
        'input_token',
        'output_token',
        'total_token',
        'request_2xx_total',
        'request_4xx_total',
        'request_5xx_total',
        'input_token_total',
        'output_token_total',
        'max_token_per_subscriber',
        'min_token_per_subscriber',
        'max_request_per_subscriber',
        'min_request_per_subscriber'
      ]
    }).then((response) => {
      const { code, data, msg } = response
      if (code === STATUS_CODE.SUCCESS) {
        setAiServiceOverview(data.overview)
        setAiChartInfo(data.overview)
      } else {
        message.error(msg || $t(RESPONSE_TIPS.error))
      }
      setDashboardLoading(false)
    })
  }

  const getRestServiceOverview = () => {
    fetchData<BasicResponse<{ overview: any }>>('service/overview/monitor/rest', {
      method: 'GET',
      eoParams: { service: serviceId, team: teamId, start: timeRange?.start, end: timeRange?.end },
      eoTransformKeys: [
        'enable_mcp',
        'subscriber_num',
        'api_num',
        'service_kind',
        'avaliable_monitor',
        'request_overview',
        'traffic_overview',
        'avg_request_per_subscriber_overview',
        'avg_response_time_overview',
        'avg_traffic_per_subscriber_overview',
        'request_total',
        'traffic_total',
        'max_response_time',
        'min_response_time',
        'avg_response_time',
        'avg_request_per_subscriber',
        'avg_traffic_per_subscriber',
        'request_2xx_total',
        'request_4xx_total',
        'request_5xx_total',
        'traffic_2xx_total',
        'traffic_4xx_total',
        'traffic_5xx_total',
        'max_request_per_subscriber',
        'min_request_per_subscriber',
        'max_traffic_per_subscriber',
        'min_traffic_per_subscriber'
      ]
    }).then((response) => {
      const { code, data, msg } = response
      if (code === STATUS_CODE.SUCCESS) {
        setRestServiceOverview(data.overview)
        setRestChartInfo(data.overview)
      } else {
        message.error(msg || $t(RESPONSE_TIPS.error))
      }
      setDashboardLoading(false)
    })
  }

  const getTopRankingList = () => {
    fetchData<BasicResponse<any>>('service/monitor/top10', {
      method: 'GET',
      eoParams: { service: serviceId, team: teamId, start: timeRange?.start, end: timeRange?.end }
    }).then((response) => {
      const { code, data, msg } = response
      if (code === STATUS_CODE.SUCCESS) {
        setTopRankingList({
          'TOP API': data.apis,
          'TOP Consumer': data.consumers
        })
      } else {
        message.error(msg || $t(RESPONSE_TIPS.error))
      }
      setDashboardLoading(false)
    })
  }

  useEffect(() => {
    const { startTime, endTime } = getTime(defaultTime, [])
    setTimeRange({ start: startTime, end: endTime })
  }, [defaultTime])

  useEffect(() => {
    if (timeRange) {
      setDashboardLoading(true)
      if (serviceType === 'aiService') {
        getAIServiceOverview()
      } else {
        getRestServiceOverview()
      }
      getTopRankingList()
    }
  }, [timeRange])

  useEffect(() => {
    if (serviceType === 'aiService') {
      if (aiServiceOverview) {
        setAiChartInfo(aiServiceOverview)
      }
    } else if (restServiceOverview) {
      setRestChartInfo(restServiceOverview)
    }
  }, [state.language])

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
      <div className="mr-[30px]">
        <ServiceOverviewIndicator indicatorInfo={indicatorInfo} onNavigate={(path) => router.push(path)} />
        <div className="mt-[20px]">
          <DateSelectFilter selectCallback={selectCallback} defaultTime={defaultTime} />
        </div>
        <div className="mt-[20px] flex mb-[10px]">
          {barChartInfo?.map((item: BarChartInfo, index: number) => (
            <Card
              key={index}
              className={`flex-1 min-w-[430px] rounded-[10px] ${index > 0 ? 'ml-[10px]' : ''}`}
              classNames={{ body: 'py-[15px] px-[0px]' }}
            >
              <ServiceBarChar showLegendIndicator={true} height={400} dataInfo={item} customClassNames="flex-1" />
            </Card>
          ))}
        </div>
        <div className="flex mb-[10px]">
          {perBarChartInfo?.map((item: any, index: number) => (
            <Card
              key={index}
              className={`flex-1 rounded-[10px] min-w-[284px] ${index > 0 ? 'ml-[10px]' : ''}`}
              classNames={{ body: 'py-[15px] px-[0px]' }}
            >
              {item.type === 'area' ? (
                <ServiceAreaChart
                  height={270}
                  dataInfo={item}
                  showAvgLine={true}
                  customClassNames="flex-1 relative"
                />
              ) : (
                <ServiceBarChar height={270} dataInfo={item} hideIndicatorValue={true} customClassNames="flex-1" />
              )}
            </Card>
          ))}
        </div>
        <RankingList topRankingList={topRankingList} serviceType={serviceType} />
      </div>
    </Spin>
  )
}

export function ServiceRouteListPage({
  teamId,
  serviceId,
  side
}: {
  teamId: string
  serviceId: string
  side: ServiceSide
}) {
  const router = useRouter()
  const { fetchData } = useFetch()
  const { modal, message } = AppAntd.useApp()
  const pageListRef = useRef<ActionType>(null)
  const { state } = useGlobalContext()
  const [searchWord, setSearchWord] = useState('')
  const [tableHttpReload, setTableHttpReload] = useState(true)
  const [tableListDataSource, setTableListDataSource] = useState<Array<SystemApiTableListItem | AiServiceRouterTableListItem>>([])
  const [memberValueEnum, setMemberValueEnum] = useState<SimpleMemberItem[]>([])
  const isAiService = side === 'aiInside'

  const manualReloadTable = () => {
    setTableHttpReload(true)
    pageListRef.current?.reload()
  }

  const getMemberList = async () => {
    setMemberValueEnum([])
    const { code, data, msg } = await fetchData<BasicResponse<{ members: SimpleMemberItem[] }>>('simple/member', {
      method: 'GET'
    })
    if (code === STATUS_CODE.SUCCESS) {
      setMemberValueEnum(data.members)
    } else {
      message.error(msg || $t(RESPONSE_TIPS.error))
    }
  }

  useEffect(() => {
    getMemberList()
    manualReloadTable()
  }, [serviceId, side])

  const getRoutesList = (): Promise<{ data: Array<SystemApiTableListItem | AiServiceRouterTableListItem>; success: boolean }> => {
    if (!tableHttpReload) {
      setTableHttpReload(true)
      return Promise.resolve({ data: tableListDataSource, success: true })
    }

    return fetchData<BasicResponse<any>>(isAiService ? 'service/ai-routers' : 'service/routers', {
      method: 'GET',
      eoParams: { service: serviceId, team: teamId, keyword: searchWord },
      eoTransformKeys: ['request_path', 'create_time', 'update_time', 'disable']
    })
      .then((response) => {
        const { code, data, msg } = response
        if (code === STATUS_CODE.SUCCESS) {
          const items = isAiService ? data.apis : data.routers
          setTableListDataSource(items)
          setTableHttpReload(false)
          return { data: items, success: true }
        }

        message.error(msg || $t(RESPONSE_TIPS.error))
        return { data: [], success: false }
      })
      .catch(() => ({ data: [], success: false }))
  }

  const deleteRoute = (entity: SystemApiTableListItem | AiServiceRouterTableListItem) => {
    return new Promise((resolve, reject) => {
      fetchData<BasicResponse<null>>(isAiService ? 'service/ai-router' : 'service/router', {
        method: 'DELETE',
        eoParams: { service: serviceId, team: teamId, router: entity.id }
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
  }

  const openDeleteModal = (entity: SystemApiTableListItem | AiServiceRouterTableListItem) => {
    modal.confirm({
      title: $t('删除'),
      content: $t('确认删除该数据？'),
      onOk: () =>
        deleteRoute(entity).then((res) => {
          if (res === true) {
            manualReloadTable()
          }
        }),
      width: 600,
      okText: $t('确认'),
      cancelText: $t('取消'),
      closable: true,
      icon: <></>
    })
  }

  const routeColumns = useMemo(() => {
    const baseColumns = (isAiService ? AI_SERVICE_ROUTER_TABLE_COLUMNS : SYSTEM_API_TABLE_COLUMNS).map((column) => {
      const nextColumn = { ...column }
      const dataIndex = nextColumn.dataIndex as string[] | string | undefined

      if (nextColumn.filters && Array.isArray(dataIndex) && dataIndex.includes('creator')) {
        const valueEnum: Record<string, { text: string }> = {}
        memberValueEnum.forEach((item) => {
          valueEnum[item.name] = { text: item.name }
        })
        nextColumn.valueEnum = valueEnum
      }

      if (nextColumn.filters && Array.isArray(dataIndex) && (dataIndex.includes('disable') || dataIndex.includes('disabled'))) {
        nextColumn.valueEnum = {
          true: { text: <span className="text-red-500">{$t('拦截')}</span> },
          false: { text: <span className="text-green-500">{$t('放行')}</span> }
        }
      }

      return {
        ...nextColumn,
        title: typeof nextColumn.title === 'string' ? $t(nextColumn.title) : nextColumn.title
      }
    })

    return [
      ...baseColumns,
      {
        title: '操作',
        key: 'option',
        btnNums: 2,
        fixed: 'right' as const,
        valueType: 'option' as const,
        render: (_: ReactNode, entity: SystemApiTableListItem | AiServiceRouterTableListItem) => [
          <TableBtnWithPermission
            access="team.service.router.edit"
            key="edit"
            btnType="edit"
            onClick={() => {
              router.push(`/service/${teamId}/${side}/${serviceId}/route/${entity.id}`)
            }}
            btnTitle="编辑"
          />,
          <TableBtnWithPermission
            access="team.service.router.delete"
            key="delete"
            btnType="delete"
            onClick={() => {
              openDeleteModal(entity)
            }}
            btnTitle="删除"
          />
        ]
      }
    ]
  }, [isAiService, memberValueEnum, state.language, router, teamId, side, serviceId])

  return (
    <PageList
      id={`service_route_${side}`}
      ref={pageListRef}
      columns={routeColumns as any}
      request={() => getRoutesList()}
      dataSource={tableListDataSource}
      addNewBtnTitle={$t('添加路由')}
      searchPlaceholder={$t('输入 URL 查找路由')}
      onAddNewBtnClick={() => {
        router.push(`/service/${teamId}/${side}/${serviceId}/route/create`)
      }}
      addNewBtnAccess="team.service.router.add"
      tableClickAccess="team.service.router.view"
      manualReloadTable={manualReloadTable}
      onSearchWordChange={(e) => {
        setSearchWord(e.target.value)
      }}
      onChange={() => {
        setTableHttpReload(false)
      }}
      onRowClick={(row: SystemApiTableListItem | AiServiceRouterTableListItem) =>
        router.push(`/service/${teamId}/${side}/${serviceId}/route/${row.id}`)
      }
      tableClass="mr-PAGE_INSIDE_X"
    />
  )
}

export function ServiceListPage() {
  const router = useRouter()
  const { message, modal } = AppAntd.useApp()
  const { fetchData } = useFetch()
  const pageListRef = useRef<ActionType>(null)
  const { checkPermission, accessInit, getGlobalAccessData, state } = useGlobalContext()
  const [tableSearchWord, setTableSearchWord] = useState('')
  const [teamList, setTeamList] = useState<{ [k: string]: { text: string } }>()
  const [tableListDataSource, setTableListDataSource] = useState<SystemTableListItem[]>([])
  const [tableHttpReload, setTableHttpReload] = useState(true)
  const [memberValueEnum, setMemberValueEnum] = useState<{ [k: string]: { text: string } }>({})
  const [stateColumnMap] = useState<{ [k: string]: { text: string; className?: string } }>({
    normal: { text: '正常' },
    deploying: { text: '部署中', className: 'text-[#2196f3]' },
    error: { text: '异常', className: 'text-[#ff4d4f]' },
    public: { text: '公共服务' },
    private: { text: '私有服务' }
  })

  const getSystemList = () => {
    if (!accessInit) {
      getGlobalAccessData()?.then?.(() => {
        getSystemList()
      })
      return Promise.resolve({ data: [], success: false })
    }

    if (!tableHttpReload) {
      setTableHttpReload(true)
      return Promise.resolve({ data: tableListDataSource, success: true })
    }

    return fetchData<BasicResponse<{ services: SystemTableListItem[] }>>(
      !checkPermission('system.workspace.service.view_all') ? 'my_services' : 'services',
      {
        method: 'GET',
        eoParams: { keyword: tableSearchWord },
        eoTransformKeys: ['api_num', 'service_num', 'create_time']
      }
    )
      .then((response) => {
        const { code, data, msg } = response
        if (code === STATUS_CODE.SUCCESS) {
          setTableListDataSource(data.services)
          setTableHttpReload(false)
          return { data: data.services, success: true }
        }

        message.error(msg || $t(RESPONSE_TIPS.error))
        return { data: [], success: false }
      })
      .catch(() => ({ data: [], success: false }))
  }

  const getTeamsList = () => {
    if (!accessInit) {
      getGlobalAccessData()?.then?.(() => {
        getTeamsList()
      })
      return
    }

    fetchData<BasicResponse<{ teams: SimpleTeamItem[] }>>(
      !checkPermission('system.workspace.team.view_all') ? 'simple/teams/mine' : 'simple/teams',
      { method: 'GET', eoTransformKeys: [] }
    ).then((response) => {
      const { code, data, msg } = response
      if (code === STATUS_CODE.SUCCESS) {
        const valueEnum: Record<string, { text: string }> = {}
        data.teams?.forEach((x: SimpleMemberItem) => {
          valueEnum[x.name] = { text: x.name }
        })
        setTeamList(valueEnum)
        return
      }

      message.error(msg || $t(RESPONSE_TIPS.error))
    })
  }

  const getMemberList = async () => {
    setMemberValueEnum({})
    const { code, data, msg } = await fetchData<BasicResponse<{ members: SimpleMemberItem[] }>>('simple/member', {
      method: 'GET'
    })

    if (code === STATUS_CODE.SUCCESS) {
      const valueEnum: Record<string, { text: string }> = {}
      data.members?.forEach((x: SimpleMemberItem) => {
        valueEnum[x.name] = { text: x.name }
      })
      setMemberValueEnum(valueEnum)
      return
    }

    message.error(msg || $t(RESPONSE_TIPS.error))
  }

  const manualReloadTable = () => {
    setTableHttpReload(true)
    pageListRef.current?.reload()
  }

  const openLogsModal = (record: SystemTableListItem) => {
    const closeModal = (reload = true) => {
      modalInstance.destroy()
      if (reload) {
        manualReloadTable()
      }
    }

    const updateFooter = () => {
      record.state = 'error'
      modalInstance.update({})
    }

    let cancelCb: () => void = () => {}
    const cancel = (cb: () => void) => {
      cancelCb = cb
    }

    const modalInstance = modal.confirm({
      title: $t('部署过程'),
      content: <ServiceDeployment record={record} closeModal={closeModal} updateFooter={updateFooter} cancelCb={cancel} />,
      footer: () => <LogsFooter record={record} closeModal={closeModal} />,
      afterClose: () => {
        cancelCb()
      },
      width: 600,
      okText: $t('确认'),
      cancelText: $t('取消'),
      closable: true,
      icon: <></>
    })
  }

  useEffect(() => {
    getTeamsList()
    getMemberList()
  }, [])

  const columns = useMemo(() => {
    return SYSTEM_TABLE_COLUMNS.map((column) => {
      const nextColumn = { ...column }
      const dataIndex = nextColumn.dataIndex as string | string[] | undefined

      if (nextColumn.filters && Array.isArray(dataIndex) && dataIndex.includes('master')) {
        nextColumn.valueEnum = memberValueEnum
      }

      if (nextColumn.filters && Array.isArray(dataIndex) && dataIndex.includes('team')) {
        nextColumn.valueEnum = teamList
      }

      if (nextColumn.dataIndex === 'service_kind') {
        nextColumn.render = (_dom: ReactNode, record: SystemTableListItem & { enable_mcp?: boolean }) => (
          <span className="text-[13px]">
            <Tag
              color={`#${record.service_kind === 'ai' ? 'EADEFF' : 'DEFFE7'}`}
              className="text-[#000] font-normal border-0 mr-[10px] max-w-[150px] truncate"
              bordered={false}
              title={record.service_kind || '-'}
            >
              {SERVICE_KIND_OPTIONS.find((item) => item.value === record.service_kind)?.label || '-'}
            </Tag>
            {record.enable_mcp && (
              <Tag
                color="#FFF0C1"
                className="text-[#000] font-normal border-0 mr-[12px] max-w-[150px] truncate"
                bordered={false}
                title="MCP"
              >
                MCP
              </Tag>
            )}
          </span>
        )
      }

      if (nextColumn.dataIndex === 'state') {
        nextColumn.render = (_dom: ReactNode, record: SystemTableListItem) => (
          <span
            className={`text-[13px] ${stateColumnMap[record.state]?.className || ''}`}
            onClick={(event) => {
              if (['deploying', 'error'].includes(record.state)) {
                event.stopPropagation()
                openLogsModal(record)
              }
            }}
          >
            {$t(stateColumnMap[record.state]?.text || '-')}
          </span>
        )
      }

      return {
        ...nextColumn,
        title: typeof nextColumn.title === 'string' ? $t(nextColumn.title) : nextColumn.title
      }
    })
  }, [memberValueEnum, teamList, state.language])

  return (
    <div className="flex flex-col flex-1 h-full overflow-hidden">
      <div className="border-[0px] mr-PAGE_INSIDE_X mb-[30px]">
        <div className="flex justify-between mb-[20px] items-center">
          <div className="flex items-center gap-TAG_LEFT">
            <div className="text-theme text-[26px]">{$t('服务')}</div>
          </div>
        </div>
        <div>
          {$t(
            '服务提供了高性能 API 网关，并且可以无缝接入多种大型 AI 模型，并将这些 AI 能力打包成 API 进行调用，从而大幅简化了 AI 模型的使用门槛。同时，我们的平台提供了完善的 API 管理功能，支持 API 的创建、监控、访问控制等，保障开发者可以高效、安全地开发和管理 API 服务。'
          )}
        </div>
      </div>

      <div className="h-full pr-PAGE_INSIDE_X pb-PAGE_INSIDE_B overflow-hidden">
        <PageList
          id="global_system"
          ref={pageListRef}
          columns={columns}
          request={() => getSystemList()}
          searchPlaceholder={$t('输入名称、ID、所属团队、负责人查找服务')}
          manualReloadTable={manualReloadTable}
          onChange={() => {
            setTableHttpReload(false)
          }}
          onSearchWordChange={(event) => {
            setTableSearchWord(event.target.value)
          }}
          onRowClick={(row: SystemTableListItem) => {
            router.push(`/service/${row.team.id}/${row.service_kind === 'ai' ? 'aiInside' : 'inside'}/${row.id}/overview`)
          }}
        />
      </div>
    </div>
  )
}

export function ServiceDetailLayout({
  teamId,
  serviceId,
  side,
  activeKey,
  children
}: {
  teamId: string
  serviceId: string
  side: ServiceSide
  activeKey: ServiceMenuKey
  children: ReactNode
}) {
  const router = useRouter()
  const { state, checkPermission } = useGlobalContext()

  const menuItems = useMemo<MenuProps['items']>(() => {
    const items: Array<{ key: ServiceMenuKey; label: string; access?: string }> = side === 'aiInside'
      ? [
          { key: 'overview', label: $t('总览') },
          { key: 'route', label: $t('API 路由'), access: 'team.service.router.view' },
          { key: 'api', label: $t('API 文档'), access: 'team.service.api_doc.view' },
          { key: 'document', label: $t('使用说明'), access: 'team.service.service_intro.view' },
          { key: 'servicepolicy', label: $t('服务策略'), access: 'team.service.policy.view' },
          { key: 'publish', label: $t('发布'), access: 'team.service.release.view' },
          { key: 'approval', label: $t('订阅审核'), access: 'team.service.subscription.view' },
          { key: 'subscriber', label: $t('订阅方管理'), access: 'team.service.subscription.view' },
          { key: 'setting', label: $t('设置') },
          { key: 'logs', label: $t('日志') }
        ]
      : [
          { key: 'overview', label: $t('总览') },
          { key: 'route', label: $t('API 路由'), access: 'team.service.router.view' },
          { key: 'api', label: $t('API 文档'), access: 'team.service.api_doc.view' },
          { key: 'upstream', label: $t('上游'), access: 'team.service.upstream.view' },
          { key: 'document', label: $t('使用说明'), access: 'team.service.service_intro.view' },
          { key: 'servicepolicy', label: $t('服务策略'), access: 'team.service.policy.view' },
          { key: 'publish', label: $t('发布'), access: 'team.service.release.view' },
          { key: 'approval', label: $t('订阅审核'), access: 'team.service.subscription.view' },
          { key: 'subscriber', label: $t('订阅方管理'), access: 'team.service.subscription.view' },
          { key: 'setting', label: $t('设置') },
          { key: 'logs', label: $t('日志') }
        ]

    return items
      .filter((item) => (item.access ? checkPermission(item.access as any) : true))
      .map((item) => ({
        key: item.key,
        label: item.label
      }))
  }, [side, state.language, checkPermission])

  return (
    <div className="flex flex-col flex-1 h-full overflow-hidden">
      <div className="mr-PAGE_INSIDE_X mb-[20px]">
        <ServiceInfoCard serviceId={serviceId} teamId={teamId} />
      </div>
      <div className="flex flex-1 h-full overflow-hidden">
        <Menu
          className="overflow-y-auto h-full"
          style={{ width: 220 }}
          selectedKeys={[activeKey]}
          mode="inline"
          items={menuItems}
          onClick={({ key }) => {
            router.push(`/service/${teamId}/${side}/${serviceId}/${key}`)
          }}
        />
        <div className="w-full h-full flex flex-1 flex-col overflow-auto bg-MAIN_BG pt-[20px] pl-[20px] pb-PAGE_INSIDE_B">
          {children}
        </div>
      </div>
    </div>
  )
}
