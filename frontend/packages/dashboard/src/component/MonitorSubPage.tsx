import { Select, Button, App, Radio, Drawer } from "antd";
import { useEffect, useRef, useState } from "react";
import { MonitorSubscriberData, SearchBody } from "@dashboard/const/type";
import { EntityItem } from "@common/const/type";
import TimeRangeSelector, { RangeValue, TimeRange, TimeRangeButton } from "@common/components/aoplatform/TimeRangeSelector";
import MonitorTable, { MonitorTableHandler } from "./MonitorTable";
import { DefaultOptionType } from "antd/es/select";
import { BasicResponse, RESPONSE_TIPS, STATUS_CODE } from "@common/const/const";
import { getTime } from "../utils/dashboard";
import { useParams } from "react-router-dom";
import { RouterParams } from "@core/components/aoplatform/RenderRoutes";
import { useExcelExport } from "@common/hooks/excel";
import { SERVICE_TABLE_GLOBAL_COLUMNS_CONFIG } from "@dashboard/const/const";
import { CloseOutlined, ExpandOutlined } from "@ant-design/icons";
import { useFetch } from "@common/hooks/http";
import { $t } from "@common/locales";

export type MonitorSubQueryData = SearchBody & { services?:string[] , apps?:string[],type?:'subscriber'|'provider'}


export type MonitorSubPageProps = {
    fetchTableData:(body:SearchBody)=>Promise<BasicResponse<{statistics:MonitorSubscriberData[]}>>
    fetchAppListData?:(body:SearchBody)=>Promise<BasicResponse<{statistics:MonitorSubscriberData[]}>>
    detailDrawerContent:React.ReactNode
    fullScreen?:boolean
    setFullScreen?:(val:boolean) => void
    setDetailId:(val:string) =>void
    setTimeButton:(val:TimeRangeButton) => void
    timeButton:TimeRangeButton
    setDetailEntityName:(name:string) => void
    detailEntityName:string
}

export default function MonitorSubPage(props:MonitorSubPageProps){
    const {fetchTableData,detailDrawerContent,fullScreen,setFullScreen,setDetailId,timeButton,setTimeButton,detailEntityName,setDetailEntityName} = props
    const {message} = App.useApp()
    const [queryData, setQueryData] = useState<MonitorSubQueryData>({type:'provider'});
    const [exportLoading, setExportLoading] = useState(false);
    const [datePickerValue, setDatePickerValue] = useState<RangeValue>();
    const monitorAppTableRef = useRef<MonitorTableHandler>(null)
    const {exportExcel} = useExcelExport<MonitorSubscriberData>()
    const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
    const [listOfProjects, setListOfProjects] = useState<DefaultOptionType[]>([])
    const {fetchData} = useFetch()
    const [queryBtnLoading, setQueryBtnLoading] = useState<boolean>(false)

    useEffect(() => {
        getMonitorData();
        getProjectList()
      }, []);

    const getMonitorData = () => {
        let query = queryData
        if(!queryData || queryData.start === undefined){
          const { startTime, endTime } = getTime(timeButton, datePickerValue||[],)
          query={...query,start: startTime, end: endTime }
        }
        const data:SearchBody = query!
        setQueryData(data)
    };

    const getProjectList = ()=>{
      return fetchData<{services:EntityItem[]}>('simple/services',{method:'GET'}).then((resp) => {
        const {code,data,msg} = resp
        if(code === STATUS_CODE.SUCCESS){
          setListOfProjects(data.services?.map((x:EntityItem)=>({label:x.name, value:x.id})))
        }else{
            message.error(msg || $t(RESPONSE_TIPS.dataError))
            return setListOfProjects([])
        }
      }).catch(() => {
          return setListOfProjects([])
      })
    }
  
    const clearSearch = () => {
        setTimeButton('hour');
        setDatePickerValue(null)
        setQueryData({type:'provider'});
    }
  
    const getAppTableList = () => {
        // ...根据时间和集群获取监控数据...
         let query = queryData
          if(!queryData || queryData.start === undefined){
            const { startTime, endTime } = getTime(timeButton, datePickerValue||[],)
            query={...query,start: startTime, end: endTime }
          }
          const data:SearchBody = query!
          setQueryData(data)
          monitorAppTableRef.current?.reload()
    };
  
    
    const exportData = () => {
        setExportLoading(true);
        let query = queryData
         if(!queryData || queryData.start === undefined){
           const { startTime, endTime } = getTime(timeButton, datePickerValue||[],)
           query={...query,start: startTime, end: endTime }
         }
         const data:SearchBody = query! ;
         fetchTableData(data).then((resp) => {
          const {code,data,msg} = resp
          if(code === STATUS_CODE.SUCCESS){
            exportExcel($t('服务调用统计'), [query!.start!, query!.end!], $t('服务调用统计'), 'dashboard_service', SERVICE_TABLE_GLOBAL_COLUMNS_CONFIG, data.statistics)
          }else{
              message.error(msg || $t(RESPONSE_TIPS.dataError))
          }
        })
    };
  
    const handleTimeRangeChange = (timeRange:TimeRange) => {
      setQueryData(pre => ({...pre, ...timeRange} as SearchBody ))
    };
    
    
    const getTablesData = (body: SearchBody) => {
        return fetchTableData(body).then((resp) => {
           const {code,data,msg} = resp
           setQueryBtnLoading(false)
           if(code === STATUS_CODE.SUCCESS){
               return  {data:data.statistics?.map((x:MonitorSubscriberData)=>{x.proxyRate = Number((x.proxyRate*100).toFixed(2));x.requestRate = Number((x.requestRate*100).toFixed(2));return x}), success: true}
           }else{
               message.error(msg || $t(RESPONSE_TIPS.dataError))
               return {data:[], success:false}
           }
         }).catch(() => {
              setQueryBtnLoading(false)
             return {data:[], success:false}
         })
       };

       
    const getDetailData = (entity:MonitorSubscriberData)=>{
      setDetailEntityName(entity.name)
      setDetailId(entity.id)
      setDrawerOpen(true)
    }

    return (
        <div className="overflow-hidden h-full">
          <div className="pl-btnbase pr-btnrbase pb-btnybase">
          <TimeRangeSelector  
                  initialTimeButton={timeButton}
                  onTimeButtonChange={setTimeButton}
                  initialDatePickerValue={datePickerValue}
                  onTimeRangeChange={handleTimeRangeChange}/>
            <div className="flex flex-wrap items-center row-gap-[12px]  pt-btnybase mr-btnybase">
              <div>
                <label className="inline-block  whitespace-nowrap">服务：</label>
                <Select
                  className="w-[346px]"
                  mode="multiple"
                  maxTagCount={1}
                  placeholder={$t("请选择服务")}
                  value={queryData?.services}
                  options={listOfProjects}
                  onChange={(value)=>{setQueryData(prevData=>({...prevData || {}, services:value}))}}
                />
              </div>
              <div>
                <Button className="ml-btnybase" onClick={clearSearch}>
                  {$t('重置')}
                </Button>
                <Button type="primary" loading={queryBtnLoading} className="ml-btnybase" onClick={()=>{setQueryBtnLoading(true);getAppTableList()}}>
                  {$t('查询')}
                </Button>
                <Button className="ml-btnybase" loading={exportLoading} onClick={exportData}>
                 {$t('导出')}
                </Button>
              </div>
            </div>
          </div>
            <div className="h-[calc(100%-100px)]">
              <MonitorTable ref={monitorAppTableRef} noTop={true} type='provider' id="dashboard_service" onRowClick={(record)=>{getDetailData(record); }} request={()=>getTablesData(queryData||{})} showPagination={true}/>
            </div>
            
        <Drawer 
          destroyOnClose={true} 
          className={fullScreen? 'h-calc-100vh-minus-navbar mt-navbar-height':''} 
          mask={!fullScreen} 
          title={<>
              {fullScreen && <a className="mr-btnrbase text-[14px]" onClick={()=>{setFullScreen?.(false)}}>
                <CloseOutlined className="mr-[4px]"/>{$t('退出全屏')}
                </a>}
              <span className="mr-btnrbase">{detailEntityName}{$t('调用详情')}</span>
              {!fullScreen && <ExpandOutlined className="text-MAIN_TEXT hover:text-MAIN_HOVER_TEXT" onClick={()=>{setFullScreen?.(true)}}/>}
              </>} 
          width={fullScreen ? '100%' : '60%'} 
          onClose={()=>setDrawerOpen(false)} 
          open={drawerOpen}>
          {detailDrawerContent}
        </Drawer>
        </div>)
}