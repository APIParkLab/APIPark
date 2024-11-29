import {  Button, Modal, Empty, message, Checkbox, Radio } from "antd";
import { useState, useEffect, useRef } from "react";
import {  InvokeData, MonitorApiData, MonitorSubscriberData, SearchBody } from "@dashboard/const/type";
import TimeRangeSelector, { RangeValue, TimeRange, TimeRangeButton } from "@common/components/aoplatform/TimeRangeSelector";
import MonitorLineGraph from "./MonitorLineGraph";
import { BasicResponse, RESPONSE_TIPS, STATUS_CODE } from "@common/const/const";
import { getTime, getTimeUnit } from "../utils/dashboard";
import MonitorTable, { MonitorTableHandler } from "./MonitorTable";
import { DashboardDetailInvokeType } from "@dashboard/pages/DashboardDetail";
import { MonitorApiQueryData } from "./MonitorApiPage";
import { MonitorSubQueryData } from "./MonitorSubPage";
import dayjs from "dayjs";
import { $t } from "@common/locales";

type MonitorDetailPageProps = {
  fetchInvokeData:(body:SearchBody)=>Promise<BasicResponse<DashboardDetailInvokeType>>
  fetchTableData:(body:SearchBody)=>Promise<BasicResponse<{statistics:(MonitorApiData|MonitorSubscriberData)[]}>>
  fetchDetailInvokeData:(params:{[k:string]:string}, body:SearchBody)=>Promise<BasicResponse<DashboardDetailInvokeType>>
  dashboardType:'api'|'subscriber'|'provider'
  tableType:'api'|'subscribers'
  tableId:string
  fullScreen:boolean
  detailName:string
  initialQueryData:(MonitorApiQueryData|MonitorSubQueryData) & {timeButton:TimeRangeButton}
}

export default function MonitorDetailPage(props:MonitorDetailPageProps){
    const {fetchInvokeData,fetchDetailInvokeData,fetchTableData,dashboardType,tableType,tableId,detailName,fullScreen,initialQueryData} = props
    const [timeButton, setTimeButton] = useState<''|'hour'|'day'|'threeDays'|'sevenDays'>(initialQueryData.start ?initialQueryData?.timeButton : 'hour');
    const [datePickerValue, setDatePickerValue] = useState<RangeValue>(!initialQueryData.timeButton && initialQueryData.start ? [dayjs.unix(Number(initialQueryData.start)), dayjs.unix(Number(initialQueryData.end))]:null);
    const [queryData, setQueryData] = useState<MonitorApiQueryData|MonitorSubQueryData|null>(initialQueryData.timeButton ? {timeButton:initialQueryData.timeButton,type:initialQueryData?.type} : initialQueryData);
    // const [listOfServices, setListOfServices] = useState<SelectOption[]>([]);
    // const [listOfApis, setListOfApis] = useState<SelectOption[]>([]);
    const [compareTotal, setCompareTotal] = useState<boolean>(false);
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [detailInvokeStatic, setDetailInvokeStatic] = useState<InvokeData>();
    const [detailInvokeError,setDetailInvokeError] = useState<boolean>(false)
    const [invokeStatic, setInvokeStatic] = useState<InvokeData>({ date: [], requestRate: [], requestTotal: [], proxyRate: [], proxyTotal: [], status_4xx: [], status_5xx: [] });
    const [timeUnit, setTimeUnit] = useState<string>()
    const [invokeStaticError,setInvokeStaticError] = useState<boolean>(false)
    const monitorTableRef = useRef<MonitorTableHandler>(null)
    const [modalTitle, setModalTitle] = useState<string>($t('调用趋势'))
    const [queryBtnLoading, setQueryBtnLoading] = useState<boolean>(false)

    useEffect(() => {
      // 初始化数据
      getMonitorData();
    }, []);

    const getMonitorData = () => {
      // ...根据时间和集群获取监控数据...
      let query = queryData
        if(!queryData || queryData.start === undefined){
          const { startTime, endTime } = getTime(timeButton, datePickerValue||[],)
          query={...query,start: startTime, end: endTime }
        }
        const data:SearchBody = query!
        setQueryData(data)
        getInvokeData(data)
        monitorTableRef.current?.reload()
      };

    const getInvokeData = (body: SearchBody) => {
      fetchInvokeData(body).then((resp) => {
          const {code,data,msg} = resp
          setQueryBtnLoading(false)
            if (code === STATUS_CODE.SUCCESS) {
              const { timeInterval, tendency } = data
              setInvokeStatic(tendency)
              setInvokeStaticError(false)
              setTimeUnit((getTimeUnit(timeInterval!)))
              // this.invokeLineRef?.changeLineChart()
            }else{
              setInvokeStaticError(true)
              message.error(msg || $t(RESPONSE_TIPS.dataError))
            }
    }).catch(()=>{setQueryBtnLoading(false)})
  };

    const getTablesData = (body: SearchBody) => {
      return fetchTableData(body).then((resp) => {
        const {code,data,msg} = resp
          setQueryBtnLoading(false)
          if(code === STATUS_CODE.SUCCESS){
            return  {data:data.statistics?.map((x:(MonitorApiData|MonitorSubscriberData))=>{x.proxyRate = Number((x.proxyRate*100).toFixed(2));x.requestRate = Number((x.requestRate*100).toFixed(2));return x}), success: true}
        }else{
            message.error(msg || $t(RESPONSE_TIPS.dataError))
            return {data:[], success:false}
        }
      }).catch(() => {
          setQueryBtnLoading(false)
          return {data:[], success:false}
      })
    };


    const clearSearch = () => {
      setTimeButton('hour');
      setDatePickerValue(null)
      setQueryData(null);
      // monitorTableRef.current?.reload()
    };

    const openModal = (entity:MonitorApiData|MonitorSubscriberData) => {
      fetchDetailInvokeData({id:entity.id},queryData!).then((resp) => {
        const {code,data,msg} = resp
        if (code === STATUS_CODE.SUCCESS) {
          const { timeInterval, tendency } = data
          setDetailInvokeStatic(tendency)
          setDetailInvokeError(false)
          setTimeUnit((getTimeUnit(timeInterval!)))
          setModalTitle($t('(0)-(1)调用趋势', [entity.name, detailName]))
          setModalVisible(true);
        }else{
          setInvokeStaticError(true)
          message.error(msg || $t(RESPONSE_TIPS.dataError))
        }
        })
    };

    const handleCloseModal = () => {
      setModalVisible(false);
      setDetailInvokeError(false)
      setDetailInvokeStatic(undefined)
      setCompareTotal(false)
    };
    
    const handleTimeRangeChange = (timeRange:TimeRange) => {
      setQueryData(pre => ({...pre, ...timeRange} as SearchBody ))
    };

  return (
    <div className="pb-[20px] h-full box-border flex flex-col">
      <div className="pl-btnbase pr-btnrbase pb-btnybase sticky top-[0] bg-[#fff] z-[10] shadow-SCROLL_TOP ">
        <div className="flex flex-nowrap items-center mr-btnybase">
            <TimeRangeSelector  
              initialTimeButton={timeButton}
              initialDatePickerValue={datePickerValue}
              onTimeButtonChange={setTimeButton}
              onTimeRangeChange={handleTimeRangeChange}
              hideTitle={!fullScreen}/>
          <Button className="ml-btnybase mt-btnybase" onClick={clearSearch}>
              {$t('重置')}
            </Button>
            <Button className="ant-btn-primary ml-btnybase mt-btnybase" loading={queryBtnLoading} onClick={()=>{setQueryBtnLoading(true);getMonitorData();}}>
              {$t('查询')}
            </Button>
        </div>
      </div>
      <div className={` flex flex-col flex-1 overflow-y-hidden`}>
        <div className="line-block eo-ng-monitor-detail-pie">
          {/* 这里应该添加图表组件 */}
          {invokeStaticError ? <Empty className="mt-[20%]" image={Empty.PRESENTED_IMAGE_SIMPLE}/>: <MonitorLineGraph
              lineData={invokeStatic}
              titles={[$t('调用量统计')]}
              yAxisTitle={$t(timeUnit || '-')}
              type="invoke"
            />}
        </div>
        <div className="table-block not-lr-border monitor-table flex-1">
            <MonitorTable  inModal ref={monitorTableRef} type={tableType} id={tableId} onRowClick={(record)=>{openModal(record as MonitorApiData | MonitorSubscriberData)}} request={()=>getTablesData({...queryData||{}})} noTop={true} minVirtualHeight={300}/>
        </div>
      </div>
      <Modal
        title={modalTitle}
        visible={modalVisible}
        onCancel={handleCloseModal}
        footer={null}
        wrapClassName="height-fixed-modal modal-without-footer"
        width={900}
        maskClosable={false}
      >
        <div className=" pb-btnybase flex flex-nowrap flex-col w-full items-center justify-between">
          <div className="w-full flex flex-row-reverse"><Checkbox  checked={compareTotal} onChange={(e) => {setCompareTotal(e.target.checked)}}>{$t('加入总体数据对比')}</Checkbox></div>
          {(detailInvokeError||!modalVisible) ? <Empty className="w-[calc(100%-20px)]" image={Empty.PRESENTED_IMAGE_SIMPLE}/>: <MonitorLineGraph
          className="w-[calc(100%-22px)] w-min-[300px]"
              lineData={detailInvokeStatic!}
              titles={[$t('调用量统计')]}
              yAxisTitle={$t(timeUnit || '-')}
              type="invoke"
            />}
          {/* 这里应该添加图表组件 */}
          {compareTotal && <>{
            (invokeStaticError ||!modalVisible ) ? <Empty className="w-[calc(100%-20px)]" image={Empty.PRESENTED_IMAGE_SIMPLE}/>: <MonitorLineGraph
            className="w-[calc(100%-20px)]"
            lineData={invokeStatic}
            titles={[$t('调用量统计')]}
            yAxisTitle={$t(timeUnit || '-')}
            type="invoke"
          />
          }</>}
        </div>
      </Modal>
    </div>
  );
}