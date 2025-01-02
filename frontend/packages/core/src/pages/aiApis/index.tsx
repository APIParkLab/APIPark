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
import { APIKey } from './types'

const ApiSettings: React.FC = () => {
  const pageListRef = useRef<ActionType>(null)
  const { modal, message } = App.useApp()
  const [searchParams] = useSearchParams()
  const [selectedProvider, setSelectedProvider] = useState<string>(searchParams.get('modelId') || '')
  const [provider, setProvider] = useState<AIProvider | undefined>()
  const { fetchData } = useFetch()
  const [searchWord, setSearchWord] = useState<string>('')
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

  const requestApis = async (params: any) => {
    if (!selectedProvider) return
    setQueryBtnLoading(true)
    try {
      const eoParams = {
        provider: selectedProvider,
        page_size: params.pageSize,
        keyword: searchWord,
        page: params.current,
        start: timeRange.start,
        end: timeRange.end
      }
      if (!timeRange || !timeRange.start) {
        const { startTime, endTime } = getTime(timeButton, [])
        eoParams.start = startTime
        eoParams.end = endTime
      }
      const response = await fetchData<BasicResponse<{ data: APIKey[] }>>('ai/apis', {
        method: 'GET',
        eoParams
      })
      setQueryBtnLoading(false)
      if (response.code === STATUS_CODE.SUCCESS) {
        setTotal(response.data.total)
        return {
          data: response.data.apis,
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

  const operation: PageProColumns<APIKey>[] = [
    {
      title: '',
      key: 'option',
      btnNums: 4,
      fixed: 'right',
      valueType: 'option',
      render: (_: React.ReactNode, entity: APIKey) => [
        <TableBtnWithPermission
          access="system.settings.ai_key_resource.manager"
          key="edit"
          btnType="edit"
          // onClick={() => handleEdit(entity)}
          btnTitle={$t('编辑')}
        />
      ]
    }
  ]

  const columns: PageProColumns<APIKey>[] = [
    {
      title: 'AI 服务',
      dataIndex: 'name',
      key: 'name',
      width: 180
    },
    {
      title: 'API URL',
      dataIndex: 'request_path',
      key: 'request_path',
      width: 200,
      ellipsis: true
    },
    {
      title: '模型',
      dataIndex: ['model', 'name'],
      key: 'model',
      width: 150,
      filters: true,
      onFilter: true,
      valueType: 'select',
      valueEnum: {}
    },
    {
      title: '已用 Token',
      dataIndex: 'use_token',
      key: 'use_token',
      width: 120,
      sorter: true
    },
    {
      title: '是否放行',
      dataIndex: 'disabled',
      ellipsis: true,
      filters: true,
      onFilter: true,
      valueType: 'select',
      valueEnum: {
        true: { text: <Typography.Text type="danger">{$t('拦截')}</Typography.Text> },
        false: { text: <Typography.Text type="success">{$t('放行')}</Typography.Text> }
      }
    },
    {
      title: '编辑时间',
      dataIndex: 'update_time',
      key: 'update_time',
      width: 200,
      render: (time: string) => <Typography.Text>{dayjs(time).format('YYYY-MM-DD HH:mm:ss')}</Typography.Text>
    },
    ...operation
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
          request={requestApis}
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
