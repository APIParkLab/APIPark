import { ActionType } from '@ant-design/pro-components'
import InsidePage from '@common/components/aoplatform/InsidePage'
import PageList, { PageProColumns } from '@common/components/aoplatform/PageList'
import TableBtnWithPermission from '@common/components/aoplatform/TableBtnWithPermission'
import TimeRangeSelector, { TimeRangeButton } from '@common/components/aoplatform/TimeRangeSelector'
import { BasicResponse, RESPONSE_TIPS, STATUS_CODE } from '@common/const/const'
import { useFetch } from '@common/hooks/http'
import { $t } from '@common/locales'
import AIProviderSelect, { AIProvider } from '@core/components/AIProviderSelect'
import { getTime } from '@dashboard/utils/dashboard'
import { Alert, App, Button, Typography } from 'antd'
import dayjs from 'dayjs'
import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { APIs } from './types'

const ApiSettings: React.FC = () => {
  const pageListRef = useRef<ActionType>(null)
  const { modal, message } = App.useApp()
  const [searchParams] = useSearchParams()
  const [selectedProvider, setSelectedProvider] = useState<string>(searchParams.get('modelId') || '')
  const [provider, setProvider] = useState<AIProvider | undefined>()
  const { fetchData } = useFetch()
  const [searchWord, setSearchWord] = useState<string>('')
  const [columns, setColumns] = useState<PageProColumns<APIs>[]>([])
  const [total, setTotal] = useState<number>(0)
  const [timeButton, setTimeButton] = useState<TimeRangeButton>('day')
  const navigate = useNavigate()
  const [timeRange, setTimeRange] = useState<{ start: number | null; end: number | null }>({
    start: null,
    end: null
  })
  const [queryBtnLoading, setQueryBtnLoading] = useState(false)

  useEffect(() => {
    pageListRef.current?.reload()
  }, [selectedProvider])

  const handlePreview = (record: APIs) => {
    navigate(`../service/${record.team.id}/aiInside/${record.service.id}/route/${record.id}/apiDetail`)
  }
  const requestApis = async (params: any & {
    pageSize: number;
    current: number;
  },
    sort: Record<string, string>,
    filter: Record<string, string>) => {
    if (!selectedProvider) return
    setQueryBtnLoading(true)
    try {
      const eoParams = {
        provider: selectedProvider,
        page_size: params.pageSize,
        keyword: searchWord,
        sort: Object.keys(sort)?.length > 0 ? 'use_token' : undefined,
        asc: Object.keys(sort)?.length > 0 ? Object.values(sort)?.[0] === 'ascend' : undefined,
        models: filter?.model && filter?.model?.length ? JSON.stringify(filter.model) : undefined,
        services: filter?.name && filter?.name?.length ? JSON.stringify(filter.name) : undefined,
        page: params.current,
        start: timeRange.start,
        end: timeRange.end
      }
      if (!timeRange || !timeRange.start) {
        const { startTime, endTime } = getTime(timeButton, [])
        eoParams.start = startTime
        eoParams.end = endTime
      }
      const response = await fetchData<BasicResponse<{ data: APIs[] }>>('ai/apis', {
        method: 'GET',
        eoParams
      })
      setQueryBtnLoading(false)
      if (response.code === STATUS_CODE.SUCCESS) {
        setTotal(response.data.total)
        const modalMap: {
          [key: string]: string
        } = response.data?.condition?.models.reduce((acc: { [key: string]: string }, item: { id: string; name: string }) => {
          acc[item.id] = $t(item.name)
          return acc
        }, {})
        const serviceMap: {
          [key: string]: string
        } = response.data?.condition?.services.reduce((acc: { [key: string]: string }, item: { id: string; name: string }) => {
          acc[item.id] = $t(item.name)
          return acc
        }, {})
        setTableColumns(modalMap, serviceMap)
        return {
          data: response.data.apis || [],
          success: true,
          total: response.data.total
        }
      } else {
        message.error(response.msg || $t(RESPONSE_TIPS.error))
        return {
          data: [],
          success: false,
          total: response.data.total
        }
      }
    } catch (error) {
      return {
        data: [],
        success: false,
        total: 0
      }
    }
  }
  const setTableColumns = (modalMap: {
    [key: string]: string
  }, serviceMap: {
    [key: string]: string
  }) => {
    setColumns([
      {
        title: $t('AI 服务'),
        dataIndex: 'name',
        key: 'name',
        width: 180,
        filters: true,
        valueEnum: serviceMap || {}
      },
      {
        title: 'API URL',
        dataIndex: 'request_path',
        key: 'request_path',
        ellipsis: true,
        render: (text: string, record: APIs) => (
          <p>
            <Typography.Text type="success">{record.method}</Typography.Text>
            <span className="ml-1">{text}</span>
          </p>
        )
      },
      {
        title: $t('模型'),
        dataIndex: ['model', 'name'],
        key: 'model',
        width: 150,
        filters: true,
        onFilter: true,
        valueType: 'select',
        valueEnum: modalMap || {}
      },
      {
        title: $t('已用 Token'),
        dataIndex: 'use_token',
        key: 'use_token',
        width: 120,
        sorter: (a: any, b: any) => {
          return (a.priority as number) - (b.priority as number)
        }
      },
      {
        title: $t('是否放行'),
        dataIndex: 'disable',
        ellipsis: true,
        width: 120,
        filters: true,
        onFilter: true,
        valueType: 'select',
        valueEnum: {
          true: { text: <Typography.Text type="danger">{$t('拦截')}</Typography.Text> },
          false: { text: <Typography.Text type="success">{$t('放行')}</Typography.Text> }
        }
      },
      {
        title: $t('编辑时间'),
        dataIndex: 'update_time',
        key: 'update_time',
        width: 200,
        render: (time: string) => <Typography.Text>{dayjs(time).format('YYYY-MM-DD HH:mm:ss')}</Typography.Text>
      },
      ...operation
    ])
  }
  const operation: PageProColumns<APIs>[] = [
    {
      title: '',
      key: 'option',
      btnNums: 4,
      fixed: 'right',
      valueType: 'option',
      render: (_: React.ReactNode, entity: APIs) => [
        <TableBtnWithPermission
          access="team.service.router.view"
          key="preview"
          btnType="logs"
          onClick={() => handlePreview(entity)}
          btnTitle={$t('预览')}
        />
      ]
    }
  ]

  const resetQuery = () => {
    setTimeButton('day')
    setTimeRange({ start: null, end: null })
    setSearchWord('')
  }

  const getData = () => {
    pageListRef.current?.reload()
  }

  const renderProviderBanner = () => {
    if (!provider) return null
    if (provider.status === 'disabled' || provider.status === 'abnormal') {
      const message =
        provider.status === 'disabled'
          ? $t(`当前供应商异常，以下API均临时调用 ${provider.backupName} 下的 ${provider.backupModel} 模型能力。`)
          : $t(`当前供应商异常，以下API均临时调用 ${provider.backupName} 下的 ${provider.backupModel} 模型能力。`)
      const type = provider.status === 'disabled' ? 'warning' : 'error'
      return (
        <Alert
          message={message}
          type={type}
          className="my-4"
          showIcon
          action={
            <Button
              size="small"
              type="link"
              onClick={() => {
                navigate('/aisetting')
              }}
            >
              {$t('查看详情')}
            </Button>
          }
        />
      )
    }
    return null
  }

  return (
    <InsidePage
      className="overflow-y-auto gap-4 pb-PAGE_INSIDE_B"
      pageTitle={$t('AI API 列表')}
      description={
        <>
          <div className="flex gap-2 items-center">
            <AIProviderSelect
              value={selectedProvider}
              onChange={(value, option) => {
                setSelectedProvider(value)
                setProvider(option)
              }}
            />
          </div>
          {renderProviderBanner()}
        </>
      }
      showBorder={false}
      scrollPage={false}
    >
      <div className="h-[calc(100%-1rem-36px)] pr-PAGE_INSIDE_X">
        <PageList
          ref={pageListRef}
          rowKey="id"
          afterNewBtn={
            <div className="flex items-center flex-wrap pb-[10px] px-btnbase content-before bg-MAIN_BG pr-PAGE_INSIDE_X">
              <TimeRangeSelector
                labelSize="small"
                hideBtns={['hour']}
                initialTimeButton={timeButton}
                onTimeButtonChange={setTimeButton}
                onTimeRangeChange={($event) => {
                  setTimeRange($event)
                }}
              />
              <div className="flex flex-nowrap items-center pt-btnybase">
                <Button onClick={resetQuery}>{$t('重置')}</Button>
                <Button
                  className="ml-btnybase"
                  type="primary"
                  loading={queryBtnLoading}
                  onClick={() => {
                    setQueryBtnLoading(true)
                    getData()
                  }}
                >
                  {$t('查询')}
                </Button>
              </div>
            </div>
          }
          request={async (params: any & {
            pageSize: number;
            current: number;
          },
            sort: Record<string, string>,
            filter: Record<string, string>) => requestApis(params, sort, filter)}
          onSearchWordChange={(e) => {
            setSearchWord(e.target.value)
          }}
          showPagination={true}
          searchPlaceholder={$t('请输入 APIURL 搜索')}
          columns={columns}
        />
      </div>
    </InsidePage>
  )
}

export default ApiSettings
