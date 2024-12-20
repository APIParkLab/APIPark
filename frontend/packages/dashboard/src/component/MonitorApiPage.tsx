import { CloseOutlined, ExpandOutlined, SearchOutlined } from '@ant-design/icons'
import { Select, Input, Button, App, Drawer } from 'antd'
import { debounce } from 'lodash-es'
import { useState, useEffect, useRef } from 'react'
import { MonitorApiData, SearchBody } from '@dashboard/const/type'
import { getTime } from '../utils/dashboard'
import ScrollableSection from '@common/components/aoplatform/ScrollableSection'
import TimeRangeSelector, {
  RangeValue,
  TimeRange,
  TimeRangeButton
} from '@common/components/aoplatform/TimeRangeSelector'
import MonitorTable, { MonitorTableHandler } from './MonitorTable'
import { BasicResponse, RESPONSE_TIPS, STATUS_CODE } from '@common/const/const'
import { DefaultOptionType } from 'antd/es/select'
import { useExcelExport } from '@common/hooks/excel'
import { API_TABLE_GLOBAL_COLUMNS_CONFIG } from '@dashboard/const/const'
import { useFetch } from '@common/hooks/http'
import { EntityItem } from '@common/const/type'
import { $t } from '@common/locales'
export type MonitorApiPageProps = {
  fetchTableData: (body: SearchBody) => Promise<BasicResponse<{ statistics: MonitorApiData[] }>>
  detailDrawerContent: React.ReactNode
  fullScreen?: boolean
  setFullScreen?: (val: boolean) => void
  setDetailId: (val: string) => void
  setTimeButton: (val: TimeRangeButton) => void
  timeButton: TimeRangeButton
  setDetailEntityName: (name: string) => void
  detailEntityName: string
}

export type MonitorApiQueryData = SearchBody & { path?: string; apis?: string[]; services?: string[] }

export default function MonitorApiPage(props: MonitorApiPageProps) {
  const {
    fetchTableData,
    detailDrawerContent,
    fullScreen,
    setFullScreen,
    setDetailId,
    timeButton,
    setTimeButton,
    detailEntityName,
    setDetailEntityName
  } = props
  const { message } = App.useApp()
  const [datePickerValue, setDatePickerValue] = useState<RangeValue>()
  const [queryData, setQueryData] = useState<MonitorApiQueryData>()
  const [exportLoading, setExportLoading] = useState<boolean>(false)
  const monitorApiTableRef = useRef<MonitorTableHandler>(null)
  const { exportExcel } = useExcelExport<MonitorApiData>()
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false)
  const [apiOptionList, setApiOptionList] = useState<DefaultOptionType[]>([])
  const [projectOptionList, setProjectOptionList] = useState<DefaultOptionType[]>([])
  const [queryBtnLoading, setQueryBtnLoading] = useState<boolean>(false)
  const { fetchData } = useFetch()

  useEffect(() => {
    getMonitorData()
    getApiList()
    getProjectList()
  }, [])

  const getApiList = (projectIds?: string[]) => {
    return fetchData<{ apis: EntityItem[] }>('simple/service/apis', {
      method: 'POST',
      eoBody: { services: projectIds || queryData?.services }
    })
      .then((resp) => {
        const { code, data, msg } = resp
        if (code === STATUS_CODE.SUCCESS) {
          setApiOptionList(data.apis?.map((x: EntityItem) => ({ label: x.name, value: x.id })))
        } else {
          message.error(msg || $t(RESPONSE_TIPS.dataError))
          return setApiOptionList([])
        }
      })
      .catch(() => {
        return setApiOptionList([])
      })
  }

  const getProjectList = () => {
    return fetchData<{ services: EntityItem[] }>('simple/services', { method: 'GET' })
      .then((resp) => {
        const { code, data, msg } = resp
        if (code === STATUS_CODE.SUCCESS) {
          setProjectOptionList(data.services?.map((x: EntityItem) => ({ label: x.name, value: x.id })))
        } else {
          message.error(msg || $t(RESPONSE_TIPS.dataError))
          return setProjectOptionList([])
        }
      })
      .catch(() => {
        return setProjectOptionList([])
      })
  }

  const getMonitorData = () => {
    let query = queryData
    if (!queryData || queryData.start === undefined) {
      const { startTime, endTime } = getTime(timeButton, datePickerValue || [])
      query = { ...query, start: startTime, end: endTime }
    }
    const data: SearchBody = query!
    setQueryData(data)
  }

  const getApiTableList = () => {
    // ...根据时间和集群获取监控数据...
    let query = queryData
    if (!queryData || queryData.start === undefined) {
      const { startTime, endTime } = getTime(timeButton, datePickerValue || [])
      query = { ...query, start: startTime, end: endTime }
    }
    const data: SearchBody = query!
    setQueryData(data)
    monitorApiTableRef.current?.reload()
  }

  const exportData = () => {
    setExportLoading(true)
    let query = queryData
    if (!queryData || queryData.start === undefined) {
      const { startTime, endTime } = getTime(timeButton, datePickerValue || [])
      query = { ...query, start: startTime, end: endTime }
    }
    const data: SearchBody = query!
    fetchTableData(data).then((resp) => {
      const { code, data, msg } = resp
      if (code === STATUS_CODE.SUCCESS) {
        exportExcel(
          $t('API调用统计'),
          [query!.start!, query!.end!],
          $t('API调用统计'),
          'dashboard_api',
          API_TABLE_GLOBAL_COLUMNS_CONFIG,
          data.statistics
        )
      } else {
        message.error(msg || $t(RESPONSE_TIPS.dataError))
      }
    })
  }

  const clearSearch = () => {
    setTimeButton('hour')
    setDatePickerValue(null)
    setQueryData(undefined)
  }

  const handleTimeRangeChange = (timeRange: TimeRange) => {
    setQueryData((pre) => ({ ...pre, ...timeRange }) as SearchBody)
  }

  const getTablesData = (body: SearchBody) => {
    return fetchTableData(body)
      .then((resp) => {
        const { code, data, msg } = resp
        setQueryBtnLoading(false)
        if (code === STATUS_CODE.SUCCESS) {
          return {
            data: data.statistics?.map((x: MonitorApiData) => {
              x.proxyRate = Number((x.proxyRate * 100).toFixed(2))
              x.requestRate = Number((x.requestRate * 100).toFixed(2))
              return x
            }),
            success: true
          }
        } else {
          message.error(msg || $t(RESPONSE_TIPS.dataError))
          return { data: [], success: false }
        }
      })
      .catch(() => {
        setQueryBtnLoading(false)
        return { data: [], success: false }
      })
  }

  const getDetailData = (entity: MonitorApiData) => {
    setDetailEntityName(entity.name)
    setDetailId(entity.id)
    setDrawerOpen(true)
  }

  return (
    <div className="h-full overflow-hidden">
      <ScrollableSection>
        <div className="pl-btnbase pr-btnrbase pb-btnbase content-before">
          <TimeRangeSelector
            labelSize="small"
            initialTimeButton={timeButton}
            onTimeButtonChange={setTimeButton}
            initialDatePickerValue={datePickerValue}
            onTimeRangeChange={handleTimeRangeChange}
          />
          <div className="flex flex-nowrap items-center  pt-btnybase mr-btnybase">
            <label className=" whitespace-nowrap inline-block">{$t('服务')}：</label>
            <Select
              className="w-[346px]"
              value={queryData?.services}
              options={projectOptionList}
              mode="multiple"
              allowClear
              maxCount={3}
              placeholder={$t('选择服务')}
              onChange={(value) => {
                setQueryData((prevData) => ({ ...(prevData || {}), services: value }))
                getApiList(value)
              }}
            />
          </div>
          <div className="flex flex-nowrap items-center  pt-btnybase mr-btnybase">
            <label className=" whitespace-nowrap inline-block w-[42px] text-right">API ：</label>
            <Select
              className="w-[346px]"
              value={queryData?.apis}
              options={apiOptionList}
              mode="multiple"
              allowClear
              maxCount={3}
              placeholder={$t('选择API')}
              onChange={(value) => {
                setQueryData((prevData) => ({ ...(prevData || {}), apis: value }))
              }}
            />
            <label className="ml-btnybase whitespace-nowrap">{$t('路径')}：</label>
            <div className="w-[346px] inline-block">
              {/* <SearchInputGroup eoSingle={false} eoInputVal={queryData.path} eoClick={() => setQueryData({ ...queryData, path: '' })} /> */}
              <Input
                value={queryData?.path}
                onChange={(e) =>
                  debounce((e) => {
                    setQueryData((prevData) => ({ ...(prevData || {}), path: e.target.value }))
                  }, 100)(e)
                }
                allowClear
                placeholder={$t('请输入请求路径进行搜索')}
                prefix={<SearchOutlined className="cursor-pointer" />}
              />
            </div>
            <Button className="ml-btnybase" onClick={clearSearch}>
              {$t('重置')}
            </Button>
            <Button
              type="primary"
              loading={queryBtnLoading}
              className="ml-btnybase"
              onClick={() => {
                setQueryBtnLoading(true)
                getApiTableList()
              }}
            >
              {$t('查询')}
            </Button>
            <Button className="ml-btnybase" loading={exportLoading} onClick={exportData}>
              {$t('导出')}
            </Button>
          </div>
        </div>
        <div className="scroll-area h-[calc(100%-144px)]">
          <MonitorTable
            noTop={true}
            ref={monitorApiTableRef}
            type="api"
            id="dashboard_api"
            onRowClick={(record) => {
              getDetailData(record)
            }}
            request={() => getTablesData(queryData || {})}
            showPagination={true}
          />
        </div>
      </ScrollableSection>

      <Drawer
        destroyOnClose={true}
        maskClosable={false}
        className={fullScreen ? 'h-calc-100vh-minus-navbar mt-navbar-height' : ''}
        mask={!fullScreen}
        title={
          <>
            {fullScreen && (
              <a
                className="mr-btnrbase text-[14px]"
                onClick={() => {
                  setFullScreen?.(false)
                }}
              >
                <CloseOutlined className="mr-[4px]" />
                {$t('退出全屏')}
              </a>
            )}
            <span className="mr-btnrbase">{$t('(0)调用详情', [detailEntityName])}</span>
            {!fullScreen && (
              <ExpandOutlined
                className="text-MAIN_TEXT hover:text-MAIN_HOVER_TEXT"
                onClick={() => {
                  setFullScreen?.(true)
                }}
              />
            )}
          </>
        }
        width={fullScreen ? '100%' : '60%'}
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
      >
        {detailDrawerContent}
      </Drawer>
    </div>
  )
}
