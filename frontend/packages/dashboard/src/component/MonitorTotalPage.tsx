
import { App, Select, Button, Tabs, TabsProps, Empty, Drawer, Spin } from "antd";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { useState, useEffect, useRef, useReducer } from "react";
import { useParams } from "react-router-dom";
import { BasicResponse, RESPONSE_TIPS, STATUS_CODE } from "@common/const/const";
import { SummaryPieData, SearchBody, PieData, MonitorApiData, MonitorSubscriberData, InvokeData, MessageData } from "@dashboard/const/type";
import { getTime, getTimeUnit, changeNumberUnit } from "../utils/dashboard";
import { RouterParams } from "@core/components/aoplatform/RenderRoutes";
import ScrollableSection from "@common/components/aoplatform/ScrollableSection";
import { RangeValue, TimeRange } from "@common/components/aoplatform/TimeRangeSelector";
import TimeRangeSelector from "@common/components/aoplatform/TimeRangeSelector";
import MonitorLineGraph from "./MonitorLineGraph";
import MonitorPieGraph from "./MonitorPieGraph";
import MonitorTable, { MonitorTableHandler } from "./MonitorTable";
import { CloseOutlined, ExpandOutlined, LoadingOutlined } from "@ant-design/icons";
import DashboardDetail from "@dashboard/pages/DashboardDetail";
import { $t } from "@common/locales";

dayjs.extend(customParseFormat);
const APP_MODE = import.meta.env.VITE_APP_MODE;

export type MonitorTotalPageProps = {
    fetchPieData:(body:SearchBody)=>Promise<BasicResponse<PieData>>
    fetchInvokeData:(body:SearchBody)=>Promise<BasicResponse<InvokeData>>
    fetchMessageData:(body:SearchBody)=>Promise<BasicResponse<MessageData>>
    fetchTableData:(body:SearchBody,type: 'api' | 'subscriber'|'provider')=>Promise<BasicResponse<{top10:MonitorApiData[]|MonitorSubscriberData[]}>>
    goToDetail:(body:SearchBody,val: MonitorApiData|MonitorSubscriberData, type: string) => void
}

const ACTIONS = {
  REQUEST_COMPLETE: 'REQUEST_COMPLETE',
  RESET: 'RESET',
};

const initialState = {
  getPieData: false,
  getInvokeData: false,
  getMessageData: false,
  getTablesData: false,
};

function reducer(state: typeof initialState, action: { type: string, payload?: string }) {
  switch (action.type) {
    case ACTIONS.REQUEST_COMPLETE:
      return { ...state, [action.payload!]: true };
    case ACTIONS.RESET:
      return initialState;
    default:
      return state;
  }
}

const MonitorTotalPage = (props:MonitorTotalPageProps) => {
      const {fetchPieData,fetchInvokeData,fetchMessageData,fetchTableData} = props
      const { message } = App.useApp()
      const [ queryData, setQueryData] = useState<SearchBody>()
      const [timeButton, setTimeButton] = useState<''|'hour'|'day'|'threeDays'|'sevenDays'>('hour');
      const [datePickerValue, setDatePickerValue] = useState<RangeValue>();
      const [requestStatic, setRequestStatic] = useState<SummaryPieData>();
      const [proxyStatic, setProxyStatic] = useState<SummaryPieData>();
      const [requestPie, setRequestPie] = useState<{ [key: string]: number }>({});
      const [proxyPie, setProxyPie] = useState<{ [key: string]: number }>({});
      const [requestSucRate, setRequestSucRate] = useState<string>('0%');
      const [proxySucRate, setProxySucRate] = useState<string>('0%');
      const [invokeStatic, setInvokeStatic] = useState<InvokeData>({ date: [], requestRate: [], requestTotal: [], proxyRate: [], proxyTotal: [], status_4xx: [], status_5xx: [] });
      const [trafficStatic, setTrafficStatic] = useState<MessageData>({ date: [], requestMessage: [], responseMessage: [] });
      const [pieError, setPieError] = useState<boolean>(false)
      const [invokeStaticError,setInvokeStaticError] = useState<boolean>(false)
      const [trafficStaticError,setTrafficStaticError] = useState<boolean>(false)
      const [timeUnit, setTimeUnit] = useState<string>()
      const monitorApiTableRef = useRef<MonitorTableHandler>(null)
      const monitorSubTableRef = useRef<MonitorTableHandler>(null)
      const [detailEntityName,setDetailEntityName]= useState<string>('')
      const [detailType,setDetailType]= useState<'api'|'provider'|'subscriber'>()
      const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
      const [detailId, setDetailId] = useState<string>()
      const [fullScreen, setFullScreen] = useState<boolean>(false)
      const [recordQuery, setRecordQuery] = useState<SearchBody&{timeButton:''|'hour'|'day'|'threeDays'|'sevenDays'}>()
      const [queryBtnLoading, setQueryBtnLoading] = useState<boolean>(false)
      const [totalEmpty, setTotalEmpty] = useState<boolean>(true)
      const [requestStatus, dispatch] = useReducer(reducer, initialState);
      
      useEffect(() => {
        const isLoading = Object.values(requestStatus).every(status => status !== true);
        setQueryBtnLoading(isLoading);
      }, [requestStatus]);

      useEffect(() => {
         getMonitorData();
      }, []);
    
      const getMonitorData = () => {
        setTotalEmpty(true)
        dispatch({ type: ACTIONS.RESET });
        // ...根据时间和集群获取监控数据...
         let query = queryData
          if(!queryData || queryData.start === undefined){
            const { startTime, endTime } = getTime(timeButton, datePickerValue||[],)
            query={...query,start: startTime, end: endTime }
          }
          const data:SearchBody = query!
          setQueryData(data)
          setRecordQuery({...data,timeButton})
          getPieData(data)
          getInvokeData(data)
          getMessageData(data)
          monitorApiTableRef.current?.reload()
          monitorSubTableRef.current?.reload()
      };
    
      const getPieData = (body: SearchBody) => {
        fetchPieData(body)
            .then((resp) => {
              const {code,data,msg} = resp
                setQueryBtnLoading(false)
                if (code === STATUS_CODE.SUCCESS) {
                  setPieError(false)
                  setRequestStatic(data.requestSummary)
                  setProxyStatic(data.proxySummary)
                  setRequestPie({ [('请求成功数')]: data.requestSummary.success, [('请求失败数')]: data.requestSummary.fail })
                  setProxyPie({ [('转发成功数')]: data.proxySummary.success, [('转发失败数')]: data.proxySummary.fail })
                  setPieError(false)
                  // this.requestPieRef?.changePieChart()
                  // this.proxyPieRef?.changePieChart()
                  setRequestSucRate(data.requestSummary.total === 0 ? '0%' : (data.requestSummary.success * 100 / data.requestSummary.total).toFixed(2) + '%')
                  setProxySucRate(data.proxySummary.total === 0 ? '0%' : (data.proxySummary.success * 100 / data.proxySummary.total).toFixed(2) + '%')
                  setTotalEmpty(data.requestSummary.total === 0 && data.proxySummary.total === 0)
                }else{
                  setPieError(true)
                  message.error(msg || RESPONSE_TIPS.dataError)
                }
        }).finally(()=>{
          dispatch({ type: ACTIONS.REQUEST_COMPLETE, payload: 'getPieData' });
        })
      };
    
      const getInvokeData = (body: SearchBody) => {
          fetchInvokeData(body).then((resp) => {
              const {code,data,msg} = resp
                setQueryBtnLoading(false)
                if (code === STATUS_CODE.SUCCESS) {
                  const { timeInterval, ...arr } = data
                  setInvokeStatic(arr as InvokeData)
                  setInvokeStaticError(false)
                  setTimeUnit(getTimeUnit(timeInterval!))
                  // this.invokeLineRef?.changeLineChart()
                }else{
                  setInvokeStaticError(true)
                  message.error(msg || RESPONSE_TIPS.dataError)
                }
        }).finally(()=>{
          dispatch({ type: ACTIONS.REQUEST_COMPLETE, payload: 'getInvokeData' });
        })
      };
    
      const getMessageData = (body: SearchBody) => {
        fetchMessageData(body).then((resp) => {
              const {code,data,msg} = resp
                setQueryBtnLoading(false)
                if (code === STATUS_CODE.SUCCESS) {
                  setTrafficStaticError(false)
                  setTrafficStatic(data)
                  // this.trafficLineRef?.changeLineChart()
                }else{
                  setTrafficStaticError(true)
                  message.error(msg || RESPONSE_TIPS.dataError)
                }
        }).finally(()=>{
          dispatch({ type: ACTIONS.REQUEST_COMPLETE, payload: 'getMessageData' });
        })
      };
    

      const getTablesData = (body: SearchBody,type: 'api' | 'subscriber'|'provider') => {
       return fetchTableData(body,type).then((resp) => {
          const {code,data,msg} = resp
                setQueryBtnLoading(false)
                if(code === STATUS_CODE.SUCCESS){
              return  {data:data.top10.map((x:MonitorApiData | MonitorSubscriberData)=>{x.proxyRate = Number((x.proxyRate*100).toFixed(2));x.requestRate = Number((x.requestRate*100).toFixed(2));return x}), success: true}
          }else{
              message.error(msg || RESPONSE_TIPS.dataError)
              return {data:[], success:false}
          }
        }).catch(() => {
          setQueryBtnLoading(false)
            return {data:[], success:false}
        }).finally(() => {
          dispatch({ type: ACTIONS.REQUEST_COMPLETE, payload: 'getTablesData'})
        })
      };
    
    
      const resetQuery = () => {
        // ...重置查询条件...
        setTimeButton('hour')
        setDatePickerValue(null)
        setQueryData(undefined)
      };
    

      const handleTimeRangeChange = (timeRange:TimeRange) => {
        setQueryData(pre => ({...pre, ...timeRange} as SearchBody ))
      };
    
      
     const monitorTopDataTabItems:TabsProps['items'] = [
      {
          label:$t('API 请求量 Top10'),
          key:'api',
          children:<MonitorTable className="py-[10px]" ref={monitorApiTableRef} type='api' id="dashboard_top10_api" onRowClick={(record)=>{APP_MODE !== 'pro' ? null : getDetailData(record as MonitorApiData,'api')}} request={()=>getTablesData(queryData||{},'api')}/>
      },
      {
          label:$t('应用调用量 Top10'),
          key:'subscribers',
          children:<MonitorTable className="py-[10px]"  ref={monitorSubTableRef} type='subscribers'  id="dashboard_top10_subscriber" onRowClick={(record)=>{APP_MODE !== 'pro' ? null : getDetailData(record as MonitorSubscriberData,'subscriber')}}  request={()=>getTablesData(queryData||{},'subscriber')} />
      },
      {
          label:$t('服务被调用量 Top10'),
          key:'providers',
          children:<MonitorTable className="py-[10px]"  ref={monitorSubTableRef} type='provider'  id="dashboard_top10_provider" onRowClick={(record)=>{APP_MODE !== 'pro' ? null : getDetailData(record as MonitorSubscriberData,'provider')}}  request={()=>getTablesData(queryData||{},'provider')} />
      }
    ]

    const getDetailData = (entity:MonitorApiData|MonitorSubscriberData, type:'api'|'provider'|'subscriber')=>{
      setDetailEntityName(entity.name)
      setDetailId(entity.id)
      setDetailType(type)
      setDrawerOpen(true)
    }

      return (
        <div className={`h-full overflow-hidden pb-btnybase flex flex-col  ${totalEmpty ?  'bg-[#fff]' : 'bg-MENU_BG'}`}>
          <ScrollableSection>
          <div className="flex items-center flex-wrap pb-[10px] px-btnbase content-before bg-MAIN_BG">
            <TimeRangeSelector 
              labelSize="small"
              initialTimeButton={timeButton}
              onTimeButtonChange={setTimeButton}
              initialDatePickerValue={datePickerValue}
              onTimeRangeChange={handleTimeRangeChange}/>
            <div className="flex flex-nowrap items-center  pt-btnybase">
                <Button onClick={resetQuery}>{$t('重置')}</Button>
                <Button className="ml-btnybase" type="primary" loading={queryBtnLoading} onClick={() => {getMonitorData();setQueryBtnLoading(true)}}>{$t('查询')}</Button>
            </div>
          </div>
          <Spin wrapperClassName={`flex-1 ${totalEmpty ?'':'overflow-auto'}`} indicator={<LoadingOutlined style={{ fontSize: 24 }} spin/>} spinning={queryBtnLoading}>
            {totalEmpty ?<Empty className="mt-[100px]" image={Empty.PRESENTED_IMAGE_SIMPLE} />:
              <div className=" h-full scroll-area">
              {/* 图表区域 */}
              <div className=" px-btnbase  mt-[12px] mb-[16px] grid gap-[20px]" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(570px, 1fr))'}}>
                {/* 请求统计饼图 */}
                {pieError ? <Empty className="pt-[80px] bg-MAIN_BG  w-[50%] h-[200px]  m-0 mr-[16px]" image={Empty.PRESENTED_IMAGE_SIMPLE} description={$t("暂无请求统计数据")}/>: <MonitorPieGraph
                  className="bg-MAIN_BG"
                  title={$t("请求统计")}
                  pieData={requestPie}
                  labelName={$t("请求成功率")}
                  labelValue={requestSucRate}
                  subText={$t("请求总数")}
                  subValue={changeNumberUnit(requestStatic?.total)}
                  status4xxCount={requestStatic?.status_4xx}
                  status5xxCount={requestStatic?.status_5xx}
                />}
                {/* 转发统计饼图 */}
                {pieError ? <Empty className="pt-[80px] bg-MAIN_BG w-[50%] h-[200px] m-0" image={Empty.PRESENTED_IMAGE_SIMPLE} description={$t("暂无转发统计数据")}/>: <MonitorPieGraph
                  className=" bg-MAIN_BG"
                  title={$t("转发统计")}
                  pieData={proxyPie}
                  labelName={$t("转发成功率")}
                  labelValue={proxySucRate}
                  subText={$t("转发总数")}
                  subValue={changeNumberUnit(proxyStatic?.total)}
                  status4xxCount={proxyStatic?.status_4xx}
                  status5xxCount={proxyStatic?.status_5xx}
                />}
              </div>
              {/* 折线图区域 */}
              <div className=" px-btnbase  mt-[12px] mb-[16px] grid gap-[20px]" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(570px, 1fr))'}}>
              {/* 调用量统计折线图 */}
                {invokeStaticError ? <Empty className="pt-[80px]  mb-[16px] h-[200px] bg-MAIN_BG" image={Empty.PRESENTED_IMAGE_SIMPLE} description={$t("暂无调用量统计数据")}/>: <MonitorLineGraph
                className=" bg-MAIN_BG pt-[16px]"
                  lineData={invokeStatic}
                  titles={[$t('调用量统计')]}
                  yAxisTitle={timeUnit || '-'}
                  type="invoke"
                />}
                {/* 报文量统计折线图 */}
                {trafficStaticError ? <Empty className=" bg-MAIN_BG pt-[80px]  mb-0 h-[200px]" image={Empty.PRESENTED_IMAGE_SIMPLE} description={$t("暂无报文量统计数据")}/>:<MonitorLineGraph
                className=" bg-MAIN_BG pt-[16px]"
                lineData={trafficStatic}
                  titles={[$t('报文量统计')]}
                  yAxisTitle={timeUnit || '-'}
                  type="traffic"
                />}
                </div>
              {/* 表格区域 */}
              <div className="bg-MAIN_BG pt-[4px] m-btnbase mt-[16px] rounded">
                <Tabs defaultActiveKey={'total'} items={monitorTopDataTabItems} destroyInactiveTabPane={true} className="h-auto mt-[4px] not-top-border-table not-top-padding-table mx-[12px]" size="small"  tabBarStyle={{paddingLeft:'10px',marginTop:'0px',marginBottom:'0px'}} />
                <Drawer 
                  destroyOnClose={true} 
                  maskClosable={false}
                  className={fullScreen? 'h-calc-100vh-minus-navbar mt-navbar-height':''} 
                  mask={!fullScreen} 
                  title={<>
                      {fullScreen && <a className="mr-btnrbase text-[14px]" onClick={()=>{setFullScreen(false)}}>
                        <CloseOutlined className="mr-[4px]"/>{$t('退出全屏')}
                        </a>}
                      <span className="mr-btnrbase">{detailEntityName}{$t('调用详情')}</span>
                      {!fullScreen && <ExpandOutlined className="text-MAIN_TEXT hover:text-MAIN_HOVER_TEXT" onClick={()=>{setFullScreen(true)}}/>}
                      </>} 
                  width={fullScreen ? '100%' : '60%'} 
                  onClose={()=>setDrawerOpen(false)} 
                  open={drawerOpen}>
                  <DashboardDetail fullScreen={fullScreen} name={detailEntityName!} queryData={recordQuery!} dashboardDetailId={detailId!} dashboardType={detailType as "api" | "subscriber"}/>
                </Drawer>
              </div>
            </div>
          }
        </Spin>
        </ScrollableSection>
    </div>
    )
}
export default MonitorTotalPage
