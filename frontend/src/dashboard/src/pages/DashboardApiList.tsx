import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { RouterParams } from '@core/components/aoplatform/RenderRoutes'
import MonitorApiPage, { MonitorApiQueryData } from '@dashboard/component/MonitorApiPage'
import { BasicResponse, STATUS_CODE } from '@common/const/const'
import { SearchBody, MonitorApiData } from '@dashboard/const/type'
import { useFetch } from '@common/hooks/http'
import DashboardDetail from './DashboardDetail'
import { TimeRangeButton } from '@common/components/aoplatform/TimeRangeSelector'

export default function DashboardApiList() {
  const { dashboardType } = useParams<RouterParams>()
  const { fetchData } = useFetch()
  const [fullScreen, setFullScreen] = useState<boolean>(false)
  const [queryData, setQueryData] = useState<MonitorApiQueryData>()
  const [detailId, setDetailId] = useState<string>()
  const [timeButton, setTimeButton] = useState<TimeRangeButton>('hour')
  const [detailEntityName, setDetailEntityName] = useState<string>('')

  const fetchTableData: (body: SearchBody) => Promise<BasicResponse<{ statistics: MonitorApiData[] }>> = (
    body: SearchBody
  ) =>
    fetchData<BasicResponse<{ statistics: MonitorApiData[] }>>('monitor/api', {
      method: 'POST',
      eoBody: { ...body, dataType: 'api' },
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

  return (
    <MonitorApiPage
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
          dashboardType={dashboardType as 'api' | 'subscriber'}
        />
      }
      fullScreen={fullScreen}
      setFullScreen={setFullScreen}
      setDetailId={setDetailId}
    />
  )
}
