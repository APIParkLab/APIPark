import { GetProps, DatePicker } from "antd"

    export type SearchBody = {
        clusters?:Array<string>,
        start?:number,
        end?:number,
    }

    export const DashboardTypeArr:string[] = [ 'api','project'] 

    // 监控总览中的饼图数据
    export interface SummaryPieData{
        total:number, success:number, fail:number, status_4xx:number, status_5xx:number
    }

    export type PieData = {
        requestSummary:SummaryPieData,
        proxySummary:SummaryPieData
    }
  
  
  export interface TotalQueryData{
    uuid:string,
    clusters:Array<string>,
    start:number,
    end:number,
  }
  
  export interface TableQueryData{
    pageNum:number
    pageSize:number
    total:number
    keyword:string
  }
  
  // export interface TableConfigEmitData{
  //   thead:THEAD_TYPE[],
  //   config:{[k:string]:boolean} | undefined
  // }
  
  // 从总调用数据传递到调用详情的query参数
  export interface QueryDetailData{
    time?:string
    startTime?:number
    endTime?:number
  }
  
  export interface QueryData {
    startTime: number
    endTime: number
    apiId?:string,
    clusters?:Array<string>,
    appId?:string,
    path?:string,
    ip?:string,
    addr?:string,
    proxyPath?:string,
    serviceName?:string
    serviceTitle?:string
    services?: Array<string>
    apiIds?: Array<string>
    appIds?:Array<string>
  }
  
  export interface StrategyQueryData {
    strategyName: string
    warnDimension: string | Array<string>
    status: string | number
    pageNum: number
    pageSize: number
    total: number
  }
  
  export interface StrategyHistoryQueryData {
    startTime: number
    endTime: number
    pageNum: number
    pageSize: number
    total: number
    strategyName: string
  }
  
  export interface MonitorAlarmStrategyRuleConditionData {
    compare: string
    unit: string
    value: number | null
  }
  
  export interface MonitorAlarmStrategyRuleData {
    channels?:Array<{uuid:string, type:number}>
    channelUuids: Array<string>
    condition: MonitorAlarmStrategyRuleConditionData[]
  }
  
  export interface MonitorAlarmStrategyData {
    uuid: string
    title: string
    desc: string
    isEnable: boolean
    dimension: string
    target: {
      rule?: string
      values?: Array<string>
    }
    quota: string
    every: number
    rule: MonitorAlarmStrategyRuleData[]
    continuity: number
    hourMax: number
    users: Array<string>
  }
  
  export interface MonitorAlarmStrategyListData {
    uuid: string
    strategyTitle: string
    warnDimension: string
    warnTarget: string
    warnRule: string
    warnFrequency: string
    isEnable: boolean
    operator: string
    updateTime: string
    createTime: string
  }
  
  export interface MonitorAlarmHistoryData {
    strategyTitle: string
    warnTarget: string
    warnContent: string
    createTime: string
  }
  
  export interface MonitorAlarmChannelsData {
    uuid: string
    title: string
    type: 1 | 2
  }
  
  export interface MonitorAlarmStrategyTargetValueData {
    contain: Array<string>
    notContain: Array<string>
    [key: string]: Array<string>
  }
  
  // 监控基础数据(表格用)
  export interface MonitorData{
    id:string
    name:string
    requestTotal:number,
    requestSuccess:number,
    requestRate:number
    proxyTotal:number,
    proxySuccess:number,
    proxyRate:number,
    statusFail:number,
    avgResp:number,
    maxResp:number,
    minResp:number,
    avgTraffic:number,
    maxTraffic:number,
    minTraffic:number,
  }
  
  // 监控Api数据(表格用)
  export interface MonitorApiData extends MonitorData{
    project:string,
    path:string,
  }

  export interface MonitorSubscriberData extends MonitorData{
  }

  export interface MonitorApiProxyData extends MonitorData{
    apiId?:string,
    apiName:string
  }
  
  export interface MonitorPathData extends MonitorData{
    path:string
  }
  
  export interface MonitorProxyData extends MonitorData{
    proxyPath:string
  }
  
  export interface MonitorProxyTableConfig {
    proxyTotal:boolean, proxySuccess :boolean, proxyRate :boolean, statusFail:boolean,
      avgResp :boolean, maxResp :boolean, minResp:boolean, avgTraffic :boolean, maxTraffic:boolean, minTraffic:boolean,
      [k:string]:boolean
  }
  
  export interface MonitorRequestTableConfig extends MonitorProxyTableConfig {
    requestTotal:boolean, requestSuccess:boolean, requestRate:boolean
  }
  
export type RangePickerProps = GetProps<typeof DatePicker.RangePicker>;


export type BaseQueryData = {
  clusters: Array<string>
  date: Array<string|number>
}

export type TableList = {
  api:Array<MonitorApiData>, subscribers:Array<MonitorSubscriberData>
}

// 监控告警中用到的折线图封装
// 监控总览：y轴左右两侧各有标题，标题会随x轴变化而更新（时间跨度）
// 调用量统计，共六条线，默认出现四条实线
// 报文量统计，共两条线
// 调用趋势：六条线，并且会出现需要加入对比的可能
// 预留数据给标题，标题根据需求
export type InvokeData = {
  date:Array<string>
  requestTotal:Array<number>
  requestRate:Array<number>
  proxyTotal:Array<number>
  proxyRate:Array<number>
  status_4xx:Array<number>
  status_5xx:Array<number>
  timeInterval?:string
}

export type MessageData = {
  date:Array<string>
  requestMessage:Array<number>
  responseMessage:Array<number>
}

export type LineGraphType = 'invoke'|'invokeService'|'traffic'