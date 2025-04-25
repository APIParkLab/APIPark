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
  const [defaultTime] = useState<TimeOption>('sevenDays')
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
        'avg_request_per_subscriber',
        'avg_token_per_subscriber'
      ],
      eoApiPrefix: 'http://uat.apikit.com:11204/mockApi/aoplatform/api/v1/'
    }).then((response) => {
      const { code, data, msg } = response
      if (code === STATUS_CODE.SUCCESS) {
        const serviceOverview = {
          requestOverview: [
            {
              '2xx': 1.0,
              '4xx': 2.0,
              '5xx': 3.0,
              fsdf: 4.0
            },
            {
              '2xx': 2.0,
              '4xx': 3.0,
              '5xx': 4.0,
              fsdf: 5.0
            },
            {
              '2xx': 3.0,
              '4xx': 4.0,
              '5xx': 5.0,
              fsdf: 6.0
            },
            {
              '2xx': 4.0,
              '4xx': 5.0,
              '5xx': 6.0,
              fsdf: 7.0
            },
            {
              '2xx': 5.0,
              '4xx': 6.0,
              '5xx': 7.0,
              fsdf: 8.0
            },
            {
              '2xx': 6.0,
              '4xx': 7.0,
              '5xx': 8.0,
              fsdf: 9.0
            }
          ],
          tokenOverview: [
            {
              '2xx': 1.0,
              '4xx': 2.0,
              '5xx': 3.0
            },
            {
              '2xx': 2.0,
              '4xx': 3.0,
              '5xx': 4.0
            },
            {
              '2xx': 3.0,
              '4xx': 4.0,
              '5xx': 5.0
            },
            {
              '2xx': 4.0,
              '4xx': 5.0,
              '5xx': 6.0
            },
            {
              '2xx': 5.0,
              '4xx': 6.0,
              '5xx': 7.0
            },
            {
              '2xx': 6.0,
              '4xx': 7.0,
              '5xx': 8.0
            }
          ],
          avgTokenOverview: [11, 231, 343, 1414, 25, 362],
          avgRequestPerSubscriberOverview: [1, 2, 3, 4, 5, 6],
          avgTokenPerSubscriberOverview: [4, 5, 1, 11, 4, 9],
          requestTotal: '12 GB',
          tokenTotal: '14 GB',
          avgToken: '1 k',
          avgRequestPerSubscriber: '2 k',
          avgTokenPerSubscriber: '3 k',
          date: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        }
        // 存储 AI 服务数据
        setAiServiceOverview(serviceOverview)
        // 设置 AI 报表数据
        setAiChartInfoData(serviceOverview)
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
        'avg_request_per_subscriber',
        'avg_traffic_per_subscriber'
      ],
      eoApiPrefix: 'http://uat.apikit.com:11204/mockApi/aoplatform/api/v1/'
    }).then((response) => {
      const { code, data, msg } = response
      if (code === STATUS_CODE.SUCCESS) {
        const serviceOverview = {
          requestOverview: [
            {
              '2xx': 33.0,
              '4xx': 44.0,
              '5xx': 5.0,
              fsdf: 6.0
            },
            {
              '2xx': 123.0,
              '4xx': 324.0,
              '5xx': 112.0,
              fsdf: 44.0
            },
            {
              '2xx': 234.0,
              '4xx': 436.0,
              '5xx': 123.0,
              fsdf: 4.0
            },
            {
              '2xx': 4.0,
              '4xx': 234.0,
              '5xx': 1233.0,
              fsdf: 7.0
            },
            {
              '2xx': 5.0,
              '4xx': 233.0,
              '5xx': 7123.0,
              fsdf: 8.0
            },
            {
              '2xx': 444.0,
              '4xx': 7.0,
              '5xx': 8.0,
              fsdf: 9.0
            }
          ],
          trafficOverview: [
            {
              '2xx': 1123.0,
              '4xx': 23.0,
              '5xx': 3.0
            },
            {
              '2xx': 112.0,
              '4xx': 233.0,
              '5xx': 44.0
            },
            {
              '2xx': 3.0,
              '4xx': 1234.0,
              '5xx': 445.0
            },
            {
              '2xx': 14.0,
              '4xx': 2345.0,
              '5xx': 6.0
            },
            {
              '2xx': 132.0,
              '4xx': 346.0,
              '5xx': 37.0
            },
            {
              '2xx': 613.0,
              '4xx': 47.0,
              '5xx': 81.0
            }
          ],
          avgRequestPerSubscriberOverview: [345, 23, 12, 123, 43, 2],
          avgResponseTimeOverview: [123, 232, 443, 54, 125, 61],
          avgTrafficPerSubscriberOverview: [44, 235, 11, 114, 234, 239],
          requestTotal: '11 GB',
          trafficTotal: '22 GB',
          avgResponseTime: '33 k',
          avgRequestPerSubscriber: '44 k',
          avgTrafficPerSubscriber: '55 k',
          date: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        }
        // 设置 REST 服务数据
        setRestServiceOverview(serviceOverview)
        // 存储 REST 报表数据
        setRestChartInfoData(serviceOverview)
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
      setBarChartInfoData({
        title: $t('请求数'),
        data: serviceOverview.requestOverview,
        value: serviceOverview.requestTotal,
        date: serviceOverview.date
      }),
      // 流量消耗总数
      setBarChartInfoData({
        title: $t('流量'),
        data: serviceOverview.trafficOverview,
        value: serviceOverview.trafficTotal,
        date: serviceOverview.date
      })
    ])
    // 设置平均值数据
    setPerBarChartInfo([
      // 各个模型使用量
      {
        title: $t('平均响应时间'),
        data: serviceOverview.avgResponseTimeOverview,
        value: serviceOverview.avgResponseTime,
        date: serviceOverview.date,
        type: 'area'
      },
      // 平均请求
      setBarChartInfoData({
        title: $t('平均请求数'),
        data: serviceOverview.avgRequestPerSubscriberOverview,
        value: serviceOverview.avgRequestPerSubscriber,
        date: serviceOverview.date
      }),
      // 平均流量消耗
      setBarChartInfoData({
        title: $t('平均流量'),
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
      setBarChartInfoData({
        title: $t('请求数'),
        data: serviceOverview.requestOverview,
        value: serviceOverview.requestTotal,
        date: serviceOverview.date
      }),
      // token 消耗总数
      setBarChartInfoData({
        title: $t('Token'),
        data: serviceOverview.tokenOverview,
        value: serviceOverview.tokenTotal,
        date: serviceOverview.date
      })
    ])
    // 设置平均值数据
    setPerBarChartInfo([
      // 平均 token 消耗
      {
        title: $t('平均 Token/s 统计'),
        data: serviceOverview.avgTokenOverview,
        value: serviceOverview.avgToken,
        date: serviceOverview.date,
        type: 'area'
      },
      // 平均请求
      setBarChartInfoData({
        title: $t('平均请求数'),
        data: serviceOverview.avgRequestPerSubscriberOverview,
        value: serviceOverview.avgRequestPerSubscriber,
        date: serviceOverview.date
      }),
      // 平均 token 消耗
      setBarChartInfoData({
        title: $t('平均 Token/订阅者统计'),
        data: serviceOverview.avgTokenPerSubscriberOverview,
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
        eoParams: { start: timeRange?.start, end: timeRange?.end },
        eoApiPrefix: 'http://uat.apikit.com:11204/mockApi/aoplatform/api/v1/'
      }
    ).then((response) => {
      const { code, data, msg } = response
      if (code === STATUS_CODE.SUCCESS) {
        const aiServiceOverview = {
          apis: [
            {
              id: '123',
              name: 'Model 21',
              request: 100,
              token: 100
            },
            {
              id: '456',
              name: 'Model 22',
              request: 200,
              token: 400
            },
            {
              id: '45611',
              name: 'Model 3',
              request: 3200,
              token: 4400
            },
            {
              id: '4536',
              name: 'Model 4',
              request: 1200,
              token: 4200
            }
          ],
          consumers: [
            {
              id: '6666',
              name: 'Customer 1',
              request: 100,
              token: 100
            }
          ]
        }
        const restServiceOverview = {
          apis: [
            {
              id: '123',
              name: 'Model 1',
              request: 100,
              traffic: 100
            },
            {
              id: '456',
              name: 'Model 2',
              request: 200,
              traffic: 300
            },
            {
              id: '12333',
              name: 'Model 123',
              request: 200,
              traffic: 300
            }
          ],
          consumers: [
            {
              id: '6666',
              name: 'Customer 1',
              request: 100,
              traffic: 100
            }
          ]
        }
        // 设置排名表格数据
        setTopRankingList({
          'TOP API': activeTab === 'AI' ? aiServiceOverview.apis : restServiceOverview.apis,
          'TOP Consumer': activeTab === 'AI' ? aiServiceOverview.consumers : restServiceOverview.consumers
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
          <div className="mt-[20px] flex mb-[10px]">
            {barChartInfo?.map((item: BarChartInfo, index: number) => (
              <Card
                key={index}
                className={`flex-1 cursor-pointer rounded-[10px] ${index > 0 ? 'ml-[10px]' : ''}`}
                classNames={{
                  body: 'p-[15px]'
                }}
              >
                <ServiceBarChar key={index} height={400} dataInfo={item} customClassNames="flex-1"></ServiceBarChar>
              </Card>
            ))}
          </div>
          <div className="flex mb-[10px]">
            {perBarChartInfo?.map((item: any, index: number) => (
              <Card
                key={index}
                className={`flex-1 cursor-pointer rounded-[10px] ${index > 0 ? 'ml-[10px]' : ''}`}
                classNames={{
                  body: 'p-[15px]'
                }}
              >
                {item.type === 'area' ? (
                  <>
                    <ServiceAreaChart
                      key={index}
                      height={250}
                      dataInfo={item}
                      customClassNames="flex-1 relative"
                    ></ServiceAreaChart>
                  </>
                ) : (
                  <ServiceBarChar key={index} height={250} dataInfo={item} customClassNames="flex-1"></ServiceBarChar>
                )}
              </Card>
            ))}
          </div>
          <RankingList topRankingList={topRankingList} serviceType={activeTab === 'AI' ? 'aiService' : 'restService'} />
        </Spin>
      </ScrollableSection>
    </div>
  )
}
