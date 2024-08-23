import { MonitorApiData, MonitorData } from "./type"
import { EChartsOption } from "echarts-for-react"
import { Tooltip } from "antd"
import { $t } from "@common/locales"
import { PageProColumns } from "@common/components/aoplatform/PageList"

// 监控表格参数
export const DASHBOARD_BASE_COLUMNS_CONFIG:(PageProColumns<MonitorData>&{eoTitle:string})[] = [
    {
        title:$t('请求总数'),
        eoTitle:$t('请求总数'),
        dataIndex: 'requestTotal',
        sorter: (a,b)=> {
            return a.requestTotal - b.requestTotal
        },
        ellipsis:true,
        width: 96
      },
      {
        title: <Tooltip title={$t("请求成功数")} >{$t('请求成功数')}</Tooltip>,
        eoTitle:$t('请求成功数'),
        dataIndex: 'requestSuccess',
        width: 106,
        ellipsis:true,
        sorter: (a,b)=> {
            return a.requestSuccess - b.requestSuccess
        },
      },
      {
        // title:$t('请求成功率',
        title: <Tooltip title={$t('请求成功率')} >{$t('请求成功率')}</Tooltip>,
        eoTitle:$t('请求成功率'),
        dataIndex: 'requestRate',
        valueType:'percent',
        ellipsis:true,
        sorter: (a,b)=> {
            return a.requestRate - b.requestRate
        },
        width: 106
      },
    {
      title:$t('转发总数'),
      eoTitle:$t('转发总数'),
      width: 96,
      dataIndex: 'proxyTotal',
      ellipsis:true,
      sorter: (a,b)=> {
            return a.proxyTotal - b.proxyTotal
      },
    },
    {
      // title:$t('转发成功数',
      title: <Tooltip title={$t("转发成功数")} >{$t('转发成功数')}</Tooltip>,
      eoTitle:$t('转发成功数'),
      width: 106,
      dataIndex: 'proxySuccess',
      ellipsis:true,
      sorter: (a,b)=> {
          return a.proxySuccess - b.proxySuccess
      },
    },
    {
      // title:$t('转发成功率',
      title: <Tooltip title={$t("转发成功率")} >{$t('转发成功率')}</Tooltip>,
      eoTitle:$t('转发成功率'),
      width: 106,
      dataIndex: 'proxyRate',
      valueType:'percent',
      ellipsis:true,
      sorter: (a,b)=> {
          return a.proxyRate - b.proxyRate
      },
    },
    {
      // title:$t('失败状态码数',
      title: <Tooltip title={$t("失败状态码数")} >{$t('失败状态码数')}</Tooltip>,
      eoTitle:$t('失败状态码数'),
      width: 120,
      dataIndex: 'statusFail',
      ellipsis:true,
      sorter: (a,b)=> {
          return a.statusFail - b.statusFail
      },
    },
    {
      // title:$t('平均响应时间(ms)',
      title: <Tooltip title={$t("平均响应时间(ms)")} >{$t('平均响应时间(ms)')}</Tooltip>,
        eoTitle:$t('平均响应时间(ms)'),
        width: 148,
      dataIndex: 'avgResp',
      valueType:'digit',
      ellipsis:true,
      sorter: (a,b)=> {
          return a.avgResp - b.avgResp
      },
    },
    {
      // title:$t('最大响应时间(ms)',
      title: <Tooltip title={$t("最大响应时间(ms)")} >{$t('最大响应时间(ms)')}</Tooltip>,
        eoTitle:$t('最大响应时间(ms)'),
        width: 148,
      dataIndex: 'maxResp',
      valueType:'digit',
      ellipsis:true,
      sorter: (a,b)=> {
          return a.maxResp - b.maxResp
      },
    },
    {
      // title:$t('最小响应时间(ms)',
      title: <Tooltip title={$t("最小响应时间(ms)")} >{$t('最小响应时间(ms)')}</Tooltip>,
        eoTitle:$t('最小响应时间(ms)'),
        width: 148,
      dataIndex: 'minResp',
      valueType:'digit',
      ellipsis:true,
      sorter: (a,b)=> {
          return a.minResp - b.minResp
      },
    },
    {
      // title:$t('平均请求流量(KB)',
      title: <Tooltip title={$t("平均请求流量(KB)")} >{$t('平均请求流量(KB)')}</Tooltip>,
        eoTitle:$t('平均请求流量(KB)'),
        width: 148,
      dataIndex: 'avgTraffic',
      valueType:'digit',
      ellipsis:true,
      sorter: (a,b)=> {
          return a.avgTraffic - b.avgTraffic
      },
    },
    {
      // title:$t('最大请求流量(KB)',
      title: <Tooltip title={$t("最大请求流量(KB)")} >{$t('最大请求流量(KB)')}</Tooltip>,
        eoTitle:$t('最大请求流量(KB)'),
        width: 148,
      dataIndex: 'maxTraffic',
      valueType:'digit',
      ellipsis:true,
      sorter: (a,b)=> {
          return a.maxTraffic - b.maxTraffic
      },
    },
    {
      // title:$t('最小请求流量(KB)',
      title: <Tooltip title={$t("最小请求流量(KB)")} >{$t('最小请求流量(KB)')}</Tooltip>,
        eoTitle:$t('最小请求流量(KB)'),
        width: 148,
      dataIndex: 'minTraffic',
      valueType:'digit',
      ellipsis:true,
      sorter: (a,b)=> {
          return a.minTraffic - b.minTraffic
      },
    }]
  
  
  export const API_TABLE_GLOBAL_COLUMNS_CONFIG:(PageProColumns<MonitorApiData>&{eoTitle:string})[] = [
  
    {
      title:$t('API 名称'),
        eoTitle:$t('API 名称'),
        dataIndex: 'name',
      width:120,
      ellipsis:true,
      fixed: 'left',
      disable:true
    },
    {
      title:$t('请求路径'),
        eoTitle:$t('请求路径'),
        dataIndex: 'path',
      ellipsis:true,
      width: 80
    },
    {
        title:$t('所属服务'),
        eoTitle:$t('所属服务'),
        dataIndex: ['project','name'],
        ellipsis:true,
        width: 80
      },
    ...DASHBOARD_BASE_COLUMNS_CONFIG as (PageProColumns<MonitorApiData>&{eoTitle:string})[]
  ]

  
  
  export const APPLICATION_TABLE_GLOBAL_COLUMNS_CONFIG:(PageProColumns<MonitorApiData>&{eoTitle:string})[] = [
  
    {
      title:$t('应用名称'),
        eoTitle:$t('应用名称'),
        dataIndex: 'name',
      width:160,
      ellipsis:true,
      fixed: 'left',
      disable:true
    },
    {
      title:$t('应用 ID'),
      eoTitle:$t('应用 ID'),
      dataIndex: 'id',
      width: 140,
      ellipsis:true,
      fixed: 'left'
    },
    ...DASHBOARD_BASE_COLUMNS_CONFIG as (PageProColumns<MonitorApiData>&{eoTitle:string})[]
  ]
  
  export const SERVICE_TABLE_GLOBAL_COLUMNS_CONFIG:(PageProColumns<MonitorApiData>&{eoTitle:string})[] = [
  
    {
      title:$t('服务名称'),
      eoTitle:$t('服务名称'),
      dataIndex: 'name',
      width:160,
      ellipsis:true,
      fixed: 'left',
      disable:true
    },
    {
      title:$t('服务 ID'),
      eoTitle:$t('服务 ID'),
      dataIndex: 'id',
      width: 140,
      ellipsis:true,
      fixed: 'left'
    },
    ...DASHBOARD_BASE_COLUMNS_CONFIG as (PageProColumns<MonitorApiData>&{eoTitle:string})[]
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
    top: '40',
    left:'16',
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