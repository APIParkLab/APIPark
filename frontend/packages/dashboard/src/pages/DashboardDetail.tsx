
import MonitorDetailPage from "../component/MonitorDetailPage"
import { BasicResponse } from "@common/const/const"
import { SearchBody, MonitorApiData, InvokeData, MonitorSubscriberData } from "@dashboard/const/type"
import { useFetch } from "@common/hooks/http"
import { MonitorApiQueryData } from "@dashboard/component/MonitorApiPage"
import { MonitorSubQueryData } from "@dashboard/component/MonitorSubPage"
import { TimeRangeButton } from "@common/components/aoplatform/TimeRangeSelector"

export type DashboardDetailInvokeType = {
  tendency:InvokeData, timeInterval:string
}

export default function DashboardDetail({fullScreen,name,queryData,dashboardDetailId,dashboardType}:{fullScreen?:boolean,name:string,queryData:(MonitorApiQueryData|MonitorSubQueryData)&{timeButton:TimeRangeButton},dashboardDetailId:string,dashboardType:'api'|'subscriber'|'provider'}){
  const {fetchData } = useFetch()
  
  const fetchTableData:(body:SearchBody)=>Promise<BasicResponse<{statistics:(MonitorApiData|MonitorSubscriberData)[]}>>
    = (body:SearchBody) =>fetchData<BasicResponse<{statistics:(MonitorApiData|MonitorSubscriberData)[]}>>(
      `monitor/${getType(dashboardType as ("api" | "subscriber"),body)}/statistics/${getType(dashboardType as ("api" | "subscriber"),body,true)}`,{
        method:'POST', 
        eoParams:{id:dashboardDetailId},
        eoBody:({...body}), 
        eoTransformKeys:['dataType','request_total','request_success','request_rate','proxy_total','proxy_success','proxy_rate','status_fail','avg_resp','max_resp','min_resp','avg_traffic','max_traffic','min_traffic','min_traffic']})

    
  const fetchInvokeData:(body:SearchBody)=>Promise<BasicResponse<DashboardDetailInvokeType>>
    = (body:SearchBody) =>fetchData<BasicResponse<DashboardDetailInvokeType>>(
      `monitor/${getType(dashboardType,body)}/trend`,{
        method:'POST', 
        eoParams:{id:dashboardDetailId},
        eoBody:({...body}), 
        eoTransformKeys:['dataType','request_total','request_rate','proxy_total','proxy_rate','time_interval']})


  const fetchDetailInvokeData:(params:{[k:string]:string},body:SearchBody)=>Promise<BasicResponse<DashboardDetailInvokeType>>
    = (params:{[k:string]:string},body:SearchBody) =>fetchData<BasicResponse<DashboardDetailInvokeType>>(
      `monitor/${getType(dashboardType,body)}/trend/${getType(dashboardType,body,true)}`,{
        method:'POST', 
        eoParams:{[getType(dashboardType,body)]:dashboardDetailId,[getType(dashboardType,body,true)]:params.id},
        eoBody:({...body}), 
        eoTransformKeys:['dataType','request_total','request_rate','proxy_total','proxy_rate','time_interval']})


    const getType = (initType:'api'|'subscriber', body:MonitorApiQueryData|MonitorSubQueryData,reserve?:boolean) => {
        const newType = initType === 'api' ? 'api' : (body as MonitorSubQueryData)?.type ?? 'subscriber'
        if(reserve){
          return newType === 'api' ? (body as MonitorSubQueryData)?.type ?? 'subscriber' : 'api'
        }
        return newType
    }

    return (<MonitorDetailPage  fullScreen={fullScreen!} fetchTableData={fetchTableData} fetchInvokeData={fetchInvokeData} fetchDetailInvokeData={fetchDetailInvokeData} tableId={`dashboard_${dashboardType}_detail`} tableType={dashboardType === 'api' ? 'subscribers':'api'}  detailName={name} dashboardType={dashboardType! as 'api'|'subscriber'} initialQueryData={queryData}/>)
  }