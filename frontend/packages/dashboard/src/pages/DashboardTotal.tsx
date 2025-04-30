import { useNavigate } from 'react-router-dom'
import { useFetch } from '@common/hooks/http'
import ScrollableSection from '@common/components/aoplatform/ScrollableSection'
import { TimeRange } from '@common/components/aoplatform/TimeRangeSelector'
import { useEffect, useState } from 'react'
import DateSelectFilter, { TimeOption } from '@core/pages/serviceOverview/filter/DateSelectFilter'
import { getTime } from '@dashboard/utils/dashboard'
import { $t } from '@common/locales/index.ts'
import { LoadingOutlined } from '@ant-design/icons'
import { Card, Spin } from 'antd'
import ServiceBarChar, { BarChartInfo } from '@core/pages/serviceOverview/charts/ServiceBarChar'
import ServiceAreaChart from '@core/pages/serviceOverview/charts/ServiceAreaChart'
import RankingList from '@core/pages/serviceOverview/rankingList/RankingList'
import { BasicResponse, RESPONSE_TIPS, STATUS_CODE } from '@common/const/const'
import { setBarChartInfoData } from '@core/pages/serviceOverview/utils'
import { App } from 'antd'
import { useGlobalContext } from '@common/contexts/GlobalStateContext'

export default function DashboardTotal() {
  /** 获取数据 */
  const { fetchData } = useFetch()
  /** 默认时间 */
  const [defaultTime] = useState<TimeOption>('day')
  /** 当前选中的时间范围 */
  const [timeRange, setTimeRange] = useState<TimeRange | undefined>()
  /** 当前激活的标签 */
  const [activeTab, setActiveTab] = useState('REST')
  /** 面板 loading */
  const [dashboardLoading, setDashboardLoading] = useState(false)
  /** 总数数据 */
  const [barChartInfo, setBarChartInfo] = useState<any>()
  /** 平均值数据 */
  const [perBarChartInfo, setPerBarChartInfo] = useState<any>()
  /** 排名表格数据 */
  const [topRankingList, setTopRankingList] = useState<any>([])
  /** 弹窗组件 */
  const { message } = App.useApp()
  /** 全局状态 */
  const { state } = useGlobalContext()
  /** AI 服务数据 */
  const [aiServiceOverview, setAiServiceOverview] = useState<any>()
  /** REST 服务数据 */
  const [restServiceOverview, setRestServiceOverview] = useState<any>()
  /** 时间选择回调 */
  const selectCallback = (date: TimeRange) => {
    setTimeRange(date)
  }

  /** 获取 AI 服务信息 */
  const getAIServiceOverview = () => {
    return fetchData<BasicResponse<{ overview: any }>>('monitor/overview/chart/ai', {
      method: 'GET',
      eoParams: { start: timeRange?.start, end: timeRange?.end },
      eoTransformKeys: [
        'request_overview',
        'token_overview',
        'avg_token_overview',
        'avg_request_per_subscriber_overview',
        'avg_token_per_subscriber_overview',
        'request_total',
        'token_total',
        'avg_token',
        'min_token',
        'max_token',
        'avg_request_per_subscriber',
        'avg_token_per_subscriber',
        'input_token',
        'output_token',
        'total_token',
        'request_2xx_total',
        'request_4xx_total',
        'request_5xx_total',
        'input_token_total',
        'output_token_total'
      ]
    }).then((response) => {
      const { code, data, msg } = response
      if (code === STATUS_CODE.SUCCESS) {
        // 存储 AI 服务数据
        setAiServiceOverview(data?.overview)
        // 设置 AI 报表数据
        setAiChartInfoData(data?.overview)
      } else {
        message.error(msg || $t(RESPONSE_TIPS.error))
      }
    })
  }

  /** 获取 REST 服务信息 */
  const getRestServiceOverview = () => {
    return fetchData<BasicResponse<{ overview: any }>>('monitor/overview/chart/rest', {
      method: 'GET',
      eoParams: { start: timeRange?.start, end: timeRange?.end },
      eoTransformKeys: [
        'request_overview',
        'traffic_overview',
        'avg_request_per_subscriber_overview',
        'avg_response_time_overview',
        'avg_traffic_per_subscriber_overview',
        'request_total',
        'traffic_total',
        'avg_response_time',
        'max_response_time',
        'min_response_time',
        'avg_request_per_subscriber',
        'avg_traffic_per_subscriber',
        'request_2xx_total',
        'request_4xx_total',
        'request_5xx_total',
        'traffic_2xx_total',
        'traffic_4xx_total',
        'traffic_5xx_total'
      ]
    }).then((response) => {
      const { code, data, msg } = response
      if (code === STATUS_CODE.SUCCESS) {
        // 存储 REST 服务数据
        setRestServiceOverview(data?.overview)
        // 设置 REST 报表数据
        setRestChartInfoData(data?.overview)
      } else {
        message.error(msg || $t(RESPONSE_TIPS.error))
      }
    })
  }

  /**
   * 设置 REST 服务数据
   * */
  const setRestChartInfoData = (serviceOverview: any) => {
    // 设置总数数据
    setBarChartInfo([
      // 服务请求次数
      {
        ...setBarChartInfoData({
          title: $t('请求次数'),
          data: serviceOverview.requestOverview,
          value: serviceOverview.requestTotal,
          date: serviceOverview.date
        }),
        request2xxTotal: serviceOverview.request2xxTotal,
        request4xxTotal: serviceOverview.request4xxTotal,
        request5xxTotal: serviceOverview.request5xxTotal
      },
      // 流量消耗总数
      {
        ...setBarChartInfoData({
          title: $t('网络流量'),
          data: serviceOverview.trafficOverview,
          value: serviceOverview.trafficTotal,
          date: serviceOverview.date
        }),
        traffic2xxTotal: serviceOverview.traffic2xxTotal,
        traffic4xxTotal: serviceOverview.traffic4xxTotal,
        traffic5xxTotal: serviceOverview.traffic5xxTotal
      }
    ])
    // 设置平均值数据
    setPerBarChartInfo([
      // 各个模型使用量
      {
        title: $t('平均响应时间'),
        data: serviceOverview.avgResponseTimeOverview,
        value: serviceOverview.avgResponseTime,
        date: serviceOverview.date,
        min: serviceOverview.minResponseTime,
        max: serviceOverview.maxResponseTime,
        type: 'area'
      },
      // 平均请求
      setBarChartInfoData({
        title: $t('平均每消费者的请求次数'),
        data: serviceOverview.avgRequestPerSubscriberOverview,
        value: serviceOverview.avgRequestPerSubscriber,
        date: serviceOverview.date
      }),
      // 平均流量消耗
      setBarChartInfoData({
        title: $t('平均每消费者的网络流量'),
        data: serviceOverview.avgTrafficPerSubscriberOverview,
        value: serviceOverview.avgTrafficPerSubscriber,
        date: serviceOverview.date
      })
    ])
  }

  /**
   * 设置 AI 服务数据
   * */
  const setAiChartInfoData = (serviceOverview: any) => {
    // 设置总数数据
    setBarChartInfo([
      // 服务请求次数
      {
        ...setBarChartInfoData({
          title: $t('请求次数'),
          data: serviceOverview.requestOverview,
          value: serviceOverview.requestTotal,
          date: serviceOverview.date
        }),
        request2xxTotal: serviceOverview.request2xxTotal,
        request4xxTotal: serviceOverview.request4xxTotal,
        request5xxTotal: serviceOverview.request5xxTotal
      },
      // token 消耗总数
      {
        ...setBarChartInfoData({
          title: $t('Token 消耗'),
          data: serviceOverview.tokenOverview.map((item: { inputToken: number; outputToken: number }) => ({
            inputToken: item.inputToken,
            outputToken: item.outputToken
          })),
          value: serviceOverview.tokenTotal,
          date: serviceOverview.date
        }),
        inputTokenTotal: serviceOverview.inputTokenTotal,
        outputTokenTotal: serviceOverview.outputTokenTotal
      }
    ])
    // 设置平均值数据
    setPerBarChartInfo([
      // 平均 token 消耗
      {
        title: $t('平均 Token 消耗'),
        data: serviceOverview.avgTokenOverview,
        value: serviceOverview.avgToken,
        date: serviceOverview.date,
        min: serviceOverview.minToken,
        max: serviceOverview.maxToken,
        type: 'area'
      },
      // 平均请求
      setBarChartInfoData({
        title: $t('平均每消费者的请求次数'),
        data: serviceOverview.avgRequestPerSubscriberOverview,
        value: serviceOverview.avgRequestPerSubscriber,
        date: serviceOverview.date
      }),
      // 平均 token 消耗
      setBarChartInfoData({
        title: $t('平均每消费者的 Token 消耗'),
        data: serviceOverview.avgTokenPerSubscriberOverview.map(
          (item: { inputToken: number; outputToken: number }) => ({
            inputToken: item.inputToken,
            outputToken: item.outputToken
          })
        ),
        value: serviceOverview.avgTokenPerSubscriber,
        date: serviceOverview.date
      })
    ])
  }

  /** 获取排名列表 */
  const getTopRankingList = () => {
    return fetchData<BasicResponse<{ apis: any; consumers: any }>>(
      `monitor/overview/top10/${activeTab === 'AI' ? 'ai' : 'rest'}`,
      {
        method: 'GET',
        eoParams: { start: timeRange?.start, end: timeRange?.end }
      }
    ).then((response) => {
      const { code, data, msg } = response
      if (code === STATUS_CODE.SUCCESS) {
        // 设置排名表格数据
        setTopRankingList({
          'TOP API': data.apis,
          'TOP Consumer': data.consumers
        })
      } else {
        message.error(msg || $t(RESPONSE_TIPS.error))
      }
    })
  }

  useEffect(() => {
    const { startTime, endTime } = getTime(defaultTime, [])
    setTimeRange({
      start: startTime,
      end: endTime
    })
  }, [])
  useEffect(() => {
    const fetchData = async () => {
      setDashboardLoading(true)
      try {
        const requests = []
        // 根据activeTab添加相应的请求
        if (activeTab === 'AI') {
          requests.push(getAIServiceOverview())
        } else {
          requests.push(getRestServiceOverview())
        }

        // 添加排名列表请求
        requests.push(getTopRankingList())

        // 等待所有请求完成
        await Promise.all(requests)
      } catch (error) {
        console.error('加载数据出错:', error)
        message.error($t('加载数据失败，请重试'))
      } finally {
        // 无论成功失败，最后都设置loading为false
        setDashboardLoading(false)
      }
    }

    if (timeRange) {
      fetchData()
    }
  }, [timeRange, activeTab])
  useEffect(() => {
    if (activeTab === 'AI') {
      aiServiceOverview && setAiChartInfoData(aiServiceOverview)
    } else {
      restServiceOverview && setRestChartInfoData(restServiceOverview)
    }
  }, [state.language])

  return (
    <div className={`h-full overflow-hidden pb-btnybase flex flex-col  bg-[#fff] `}>
      <ScrollableSection>
        <div className="flex items-center flex-wrap content-before bg-MAIN_BG pr-PAGE_INSIDE_X  ">
          <div className="pt-btnybase mr-[10px]">{$t('服务')}：</div>
          <div className="mt-3 tab-nav flex rounded-md overflow-hidden border border-solid border-[#3D46F2] w-[150px] mr-[30px]">
            <div
              className={`tab-item text-center px-5 py-1.5 cursor-pointer w-[50%] text-sm transition-colors ${activeTab === 'REST' ? 'bg-[#3D46F2] text-white' : 'bg-white text-[#3D46F2]'}`}
              onClick={() => setActiveTab('REST')}
            >
              REST
            </div>
            <div
              className={`tab-item text-center px-5 py-1.5 cursor-pointer w-[50%] text-sm transition-colors ${activeTab === 'AI' ? 'bg-[#3D46F2] text-white' : 'bg-white text-[#3D46F2]'}`}
              onClick={() => setActiveTab('AI')}
            >
              AI
            </div>
          </div>
          <DateSelectFilter selectCallback={selectCallback} customClassNames="pt-[12px]" defaultTime={defaultTime} />
        </div>
        <Spin
          className="h-full pb-[20px]"
          wrapperClassName={`flex-1 overflow-auto`}
          indicator={
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ transform: 'scale(1.5)' }}>
                <LoadingOutlined style={{ fontSize: 30 }} spin />
              </div>
            </div>
          }
          spinning={dashboardLoading}
        >
          <div className="mr-[40px]">
            <div className="mt-[20px] flex mb-[10px]">
              {barChartInfo?.map((item: BarChartInfo, index: number) => (
                <Card
                  key={index}
                  className={`flex-1 min-w-[430px] rounded-[10px] ${index > 0 ? 'ml-[10px]' : ''}`}
                  classNames={{
                    body: 'py-[15px] px-[0px]'
                  }}
                >
                  <ServiceBarChar
                    showLegendIndicator={true}
                    key={index}
                    height={400}
                    dataInfo={item}
                    customClassNames="flex-1"
                  ></ServiceBarChar>
                </Card>
              ))}
            </div>
            <div className="flex mb-[10px]">
              {perBarChartInfo?.map((item: any, index: number) => (
                <Card
                  key={index}
                  className={`flex-1 min-w-[284px] rounded-[10px] ${index > 0 ? 'ml-[10px]' : ''}`}
                  classNames={{
                    body: 'py-[15px] px-[0px]'
                  }}
                >
                  {item.type === 'area' ? (
                    <>
                      <ServiceAreaChart
                        key={index}
                        height={270}
                        showAvgLine={true}
                        dataInfo={item}
                        customClassNames="flex-1 relative"
                      ></ServiceAreaChart>
                    </>
                  ) : (
                    <ServiceBarChar
                      key={index}
                      height={270}
                      showAvgLine={true}
                      dataInfo={item}
                      customClassNames="flex-1"
                    ></ServiceBarChar>
                  )}
                </Card>
              ))}
            </div>
            <RankingList
              topRankingList={topRankingList}
              serviceType={activeTab === 'AI' ? 'aiService' : 'restService'}
            />
          </div>
        </Spin>
      </ScrollableSection>
    </div>
  )
}
