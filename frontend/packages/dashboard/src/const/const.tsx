import { ProColumns } from "@ant-design/pro-components"
import { MonitorApiData, MonitorData } from "./type"
import { EChartsOption } from "echarts-for-react"
import { Tooltip } from "antd"

// 监控表格参数
export const DASHBOARD_BASE_COLUMNS_CONFIG:(ProColumns<MonitorData>&{eoTitle:string})[] = [
    {
        title: '请求总数',
        eoTitle:'请求总数',
        dataIndex: 'requestTotal',
        sorter: (a,b)=> {
            return a.requestTotal - b.requestTotal
        },
        ellipsis:true,
        width: 96
      },
      {
        // title: '请求成功数',
        title: <Tooltip title="请求成功数" >请求成功数</Tooltip>,
        eoTitle:'请求成功数',
        dataIndex: 'requestSuccess',
        width: 106,
        ellipsis:true,
        copyable: true,
        sorter: (a,b)=> {
            return a.requestSuccess - b.requestSuccess
        },
      },
      {
        // title: '请求成功率',
        title: <Tooltip title="请求成功率" >请求成功率</Tooltip>,
        eoTitle:'请求成功率',
        dataIndex: 'requestRate',
        valueType:'percent',
        copyable: true,
        ellipsis:true,
        sorter: (a,b)=> {
            return a.requestRate - b.requestRate
        },
        width: 106
      },
    {
      title: '转发总数',
        eoTitle:'转发总数',
        width: 96,
      dataIndex: 'proxyTotal',
      copyable: true,
      ellipsis:true,
      sorter: (a,b)=> {
            return a.proxyTotal - b.proxyTotal
      },
    },
    {
      // title: '转发成功数',
      title: <Tooltip title="转发成功数" >转发成功数</Tooltip>,
        eoTitle:'转发成功数',
        width: 106,
      dataIndex: 'proxySuccess',
      copyable: true,
      ellipsis:true,
      sorter: (a,b)=> {
          return a.proxySuccess - b.proxySuccess
      },
    },
    {
      // title: '转发成功率',
      title: <Tooltip title="转发成功率" >转发成功率</Tooltip>,
        eoTitle:'转发成功率',
        width: 106,
      dataIndex: 'proxyRate',
      valueType:'percent',
      copyable: true,
      ellipsis:true,
      sorter: (a,b)=> {
          return a.proxyRate - b.proxyRate
      },
    },
    {
      // title: '失败状态码数',
      title: <Tooltip title="失败状态码数" >失败状态码数</Tooltip>,
        eoTitle:'失败状态码数',
        width: 120,
      dataIndex: 'statusFail',
      copyable: true,
      ellipsis:true,
      sorter: (a,b)=> {
          return a.statusFail - b.statusFail
      },
    },
    {
      // title: '平均响应时间(ms)',
      title: <Tooltip title="平均响应时间(ms)" >平均响应时间(ms)</Tooltip>,
        eoTitle:'平均响应时间(ms)',
        width: 148,
      dataIndex: 'avgResp',
      valueType:'digit',
      copyable: true,
      ellipsis:true,
      sorter: (a,b)=> {
          return a.avgResp - b.avgResp
      },
    },
    {
      // title: '最大响应时间(ms)',
      title: <Tooltip title="最大响应时间(ms)" >最大响应时间(ms)</Tooltip>,
        eoTitle:'最大响应时间(ms)',
        width: 148,
      dataIndex: 'maxResp',
      valueType:'digit',
      copyable: true,
      ellipsis:true,
      sorter: (a,b)=> {
          return a.maxResp - b.maxResp
      },
    },
    {
      // title: '最小响应时间(ms)',
      title: <Tooltip title="最小响应时间(ms)" >最小响应时间(ms)</Tooltip>,
        eoTitle:'最小响应时间(ms)',
        width: 148,
      dataIndex: 'minResp',
      valueType:'digit',
      copyable: true,
      ellipsis:true,
      sorter: (a,b)=> {
          return a.minResp - b.minResp
      },
    },
    {
      // title: '平均请求流量(KB)',
      title: <Tooltip title="平均请求流量(KB)" >平均请求流量(KB)</Tooltip>,
        eoTitle:'平均请求流量(KB)',
        width: 148,
      dataIndex: 'avgTraffic',
      valueType:'digit',
      copyable: true,
      ellipsis:true,
      sorter: (a,b)=> {
          return a.avgTraffic - b.avgTraffic
      },
    },
    {
      // title: '最大请求流量(KB)',
      title: <Tooltip title="最大请求流量(KB)" >最大请求流量(KB)</Tooltip>,
        eoTitle:'最大请求流量(KB)',
        width: 148,
      dataIndex: 'maxTraffic',
      valueType:'digit',
      copyable: true,
      ellipsis:true,
      sorter: (a,b)=> {
          return a.maxTraffic - b.maxTraffic
      },
    },
    {
      // title: '最小请求流量(KB)',
      title: <Tooltip title="最小请求流量(KB)" >最小请求流量(KB)</Tooltip>,
        eoTitle:'最小请求流量(KB)',
        width: 148,
      dataIndex: 'minTraffic',
      valueType:'digit',
      copyable: true,
      ellipsis:true,
      sorter: (a,b)=> {
          return a.minTraffic - b.minTraffic
      },
    }]
  
  
  export const API_TABLE_GLOBAL_COLUMNS_CONFIG:(ProColumns<MonitorApiData>&{eoTitle:string})[] = [
  
    {
      title: 'API 名称',
        eoTitle:'API 名称',
        dataIndex: 'name',
      width:120,
      ellipsis:true,
      copyable:true,
      fixed: 'left',
      disable:true
    },
    {
      title: '请求路径',
        eoTitle:'请求路径',
        dataIndex: 'path',
      ellipsis:true,
      copyable:true,
      width: 80
    },
    {
        title: '所属服务',
        eoTitle:'所属服务',
        dataIndex: ['project','name'],
        ellipsis:true,
        width: 80
      },
    ...DASHBOARD_BASE_COLUMNS_CONFIG as (ProColumns<MonitorApiData>&{eoTitle:string})[]
  ]

  
  
  export const APPLICATION_TABLE_GLOBAL_COLUMNS_CONFIG:(ProColumns<MonitorApiData>&{eoTitle:string})[] = [
  
    {
      title: '应用名称',
        eoTitle:'应用名称',
        dataIndex: 'name',
      width:160,
      ellipsis:true,
      copyable:true,
      fixed: 'left',
      disable:true
    },
    {
      title: '应用 ID',
      eoTitle:'应用 ID',
      dataIndex: 'id',
      width: 140,
      ellipsis:true,
      copyable:true,
      fixed: 'left'
    },
    ...DASHBOARD_BASE_COLUMNS_CONFIG as (ProColumns<MonitorApiData>&{eoTitle:string})[]
  ]
  
  export const SERVICE_TABLE_GLOBAL_COLUMNS_CONFIG:(ProColumns<MonitorApiData>&{eoTitle:string})[] = [
  
    {
      title: '服务名称',
      eoTitle:'服务名称',
      dataIndex: 'name',
      width:160,
      ellipsis:true,
      copyable:true,
      fixed: 'left',
      disable:true
    },
    {
      title: '服务 ID',
      eoTitle:'服务 ID',
      dataIndex: 'id',
      width: 140,
      ellipsis:true,
      copyable:true,
      fixed: 'left'
    },
    ...DASHBOARD_BASE_COLUMNS_CONFIG as (ProColumns<MonitorApiData>&{eoTitle:string})[]
  ]
  
export const MONITOR_LINE_CHART_BASIC_INVOKE_SELECTED = {
    请求总数: true,
    请求成功率: true,
    转发总数: true,
    转发成功率: true,
    状态码4xx数: false,
    状态码5xx数: false
}

export const MONITOR_LINE_CHART_BASIC_MESSAGE_SELECTED = {
  请求报文量: true,
  响应报文量: true
}

export const MONITOR_LINE_CHART_OPTION_CONFIG : EChartsOption = {
  legend: {
    orient: 'horizontal',
    top: '50',
    selected: MONITOR_LINE_CHART_BASIC_INVOKE_SELECTED
  },
  tooltip: {
    trigger: 'axis',
    // 为了失败率显示成百分比，所以自定义了formatter
    formatter: (params:Array<Record<string,unknown>>) => {
      const startHtml = params[0].axisValue + '<br/>'
      const listArr = []
      for (let i = 0; i < params.length; i++) {
        const item = params[i]
        // echarts会根据你定义的颜色返回一个生成好的带颜色的标记，直接实用即可
        let str = '<div><section style="align-items: center;display:flex; justify-content: space-between;flex-wrap: nowrap;"><span> ' + item.marker
        if (item.seriesName === '请求成功率' || item.seriesName === '转发成功率') {
          str += (item.seriesName + '&nbsp&nbsp&nbsp </span><span style="font-weight:bold"> ' + item.value + '% </span></section></div>')
        } else {
          str += (item.seriesName + '&nbsp&nbsp&nbsp </span><span style="font-weight:bold"> ' + item.value + '</span></section></div>')
        }
        listArr.push(str)
      }
      return startHtml + listArr.join('')
    }
  }
};

export const MONITOR_NAME_MAP : Record<string,string>= {
  requestTotal: '请求总数',
  requestRate: '请求成功率',
  proxyTotal: '转发总数',
  proxyRate: '转发成功率',
  status_4xx: '状态码4xx数',
  status_5xx: '状态码5xx数',
  requestMessage: '请求报文量',
  responseMessage: '响应报文量'
}