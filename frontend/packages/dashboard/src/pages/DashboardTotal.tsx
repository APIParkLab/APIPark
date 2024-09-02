
import { useNavigate, useParams } from "react-router-dom"
import { RouterParams } from "@core/components/aoplatform/RenderRoutes"
import MonitorTotalPage from "@dashboard/component/MonitorTotalPage"
import { BasicResponse } from "@common/const/const"
import { InvokeData, MessageData, MonitorApiData, MonitorSubscriberData, PieData, SearchBody } from "@dashboard/const/type"
import { useFetch } from "@common/hooks/http"
import { objectToSearchParameters } from "@common/utils/router"
import { useEffect } from "react"
export default function DashboardTotal() {
    const {fetchData } = useFetch()
    const navigateTo = useNavigate()
    const fetchPieData:(body:SearchBody)=>Promise<BasicResponse<PieData>> = (body:SearchBody)=> fetchData<BasicResponse<PieData>>('monitor/overview/summary',{
        method:'POST', eoBody:(body),eoTransformKeys:['request_summary','proxy_summary']})

    const fetchInvokeData:(body:SearchBody)=>Promise<BasicResponse<InvokeData>> = (body:SearchBody) =>fetchData<BasicResponse<InvokeData>>('monitor/overview/invoke',{
        method:'POST', eoBody:(body),eoTransformKeys:['request_total','request_rate','proxy_total','proxy_rate','time_interval']})

    const fetchMessageData:(body:SearchBody)=>Promise<BasicResponse<MessageData>>= (body:SearchBody) =>fetchData<BasicResponse<MessageData>>('monitor/overview/message',{
        method:'POST', eoBody:(body),eoTransformKeys:['time_interval','request_message','response_message']})

    const fetchTableData:(body:SearchBody,type: 'api' | 'subscribers'|'providers')=>Promise<BasicResponse<{top10:MonitorApiData[]|MonitorSubscriberData[]}>>= (body:SearchBody,type: 'api' | 'subscribers'|'providers') =>fetchData<BasicResponse<{api:MonitorApiData[], subscribers:MonitorSubscriberData}>>('monitor/overview/top10',{
        method:'POST', 
        eoBody:({...body, dataType:type}), 
        eoTransformKeys:['dataType','request_total','request_success','request_rate','proxy_total','proxy_success','proxy_rate','status_fail','avg_resp','max_resp','min_resp','avg_traffic','max_traffic','min_traffic','min_traffic','is_red']})

    const goToDetail:(body:SearchBody,val: MonitorApiData|MonitorSubscriberData, type: string) => void= (body:SearchBody,val: MonitorApiData|MonitorSubscriberData, type: string) => {
          // ...跳转到详情页...
          const { start:startTime, end:endTime, clusters} = body
          navigateTo(
            `/analytics/${type}/list?${objectToSearchParameters({id:val.id,clusters:clusters || undefined, start: startTime?.toString(), end: endTime?.toString(), name:val.name}).toString()}`)        
        };

    return <MonitorTotalPage  fetchPieData={fetchPieData} fetchInvokeData={fetchInvokeData} fetchMessageData={fetchMessageData} fetchTableData={fetchTableData} goToDetail={goToDetail}/>
}