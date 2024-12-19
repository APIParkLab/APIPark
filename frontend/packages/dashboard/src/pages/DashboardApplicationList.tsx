import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { RouterParams } from '@core/components/aoplatform/RenderRoutes'
import { BasicResponse, STATUS_CODE } from '@common/const/const'
import { SearchBody, MonitorSubscriberData } from '@dashboard/const/type'
import { useFetch } from '@common/hooks/http'
import { MonitorSubQueryData } from '@dashboard/component/MonitorSubPage'
import MonitorAppPage from '@dashboard/component/MonitorAppPage'
import DashboardDetail from './DashboardDetail'
import { TimeRangeButton } from '@common/components/aoplatform/TimeRangeSelector'

export default function DashboardApplicationList() {
  const { dashboardType } = useParams<RouterParams>()
  const { fetchData } = useFetch()
  const [fullScreen, setFullScreen] = useState<boolean>(false)
  const [queryData, setQueryData] = useState<MonitorSubQueryData>({ type: 'subscriber' })
  const [detailId, setDetailId] = useState<string>()
  const [timeButton, setTimeButton] = useState<TimeRangeButton>('hour')
  const [detailEntityName, setDetailEntityName] = useState<string>('')

  const fetchTableData: (body: SearchBody) => Promise<BasicResponse<{ statistics: MonitorSubscriberData[] }>> = (
    body: MonitorSubQueryData
  ) => {
    return fetchData<BasicResponse<{ statistics: MonitorSubscriberData[] }>>(`monitor/subscriber`, {
      method: 'POST',
      eoBody: { ...body, dataType: 'subscriber' },
      eoTransformKeys: [
        'dataType',
        'request_total',
        'request_success',
        'request_rate',
        'proxy_total',
        'proxy_success',
        'proxy_rate',
        'status_fail',
        'avg_resp',
        'max_resp',
        'min_resp',
        'avg_traffic',
        'max_traffic',
        'min_traffic',
        'min_traffic'
      ]
    }).then((resp) => {
      if (resp.code === STATUS_CODE.SUCCESS) {
        setQueryData({ ...body })
        return resp
      }
    })
  }

  return (
    <MonitorAppPage
      fetchTableData={fetchTableData}
      timeButton={timeButton}
      setTimeButton={setTimeButton}
      detailEntityName={detailEntityName}
      setDetailEntityName={setDetailEntityName}
      detailDrawerContent={
        <DashboardDetail
          fullScreen={fullScreen}
          name={detailEntityName!}
          queryData={{ ...queryData, timeButton }}
          dashboardDetailId={detailId!}
          dashboardType={dashboardType as 'api' | 'subscriber' | 'provider'}
        />
      }
      fullScreen={fullScreen}
      setFullScreen={setFullScreen}
      setDetailId={setDetailId}
    />
  )
}
