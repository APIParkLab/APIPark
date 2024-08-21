
import  { FC, useEffect, useMemo, useRef, useState } from 'react';
import ECharts, { EChartsOption } from 'echarts-for-react';
import { InvokeData, LineGraphType, MessageData } from '@dashboard/const/type';
import {  MONITOR_LINE_CHART_BASIC_INVOKE_SELECTED, MONITOR_LINE_CHART_BASIC_MESSAGE_SELECTED, MONITOR_LINE_CHART_OPTION_CONFIG, MONITOR_NAME_MAP } from '@dashboard/const/const';
import { yUnitFormatter } from '../utils/dashboard';
import { $t } from '@common/locales';

type LineGraphProps = {
  className?:string
  lineData:InvokeData | MessageData
  compareData?:InvokeData | MessageData
  titles:string[]
  yAxisTitle:string 
  compare?:boolean
  type:LineGraphType
  modalTitle?:string
  dataTitle?:string
}

const MonitorLineGraph: FC<LineGraphProps> = ({ className, lineData, titles, yAxisTitle, compareData, compare, type, modalTitle, dataTitle }) => {
  const [legendSelected, setLegendSelected] = useState<Record<string,boolean>>(type === 'traffic' ? {...MONITOR_LINE_CHART_BASIC_MESSAGE_SELECTED}:{...MONITOR_LINE_CHART_BASIC_INVOKE_SELECTED})
  const chartRef = useRef<ECharts>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const handleWindowResize = () => {
    // 直接使用引用中的实例和DOM元素
    const chartInstance = chartRef.current?.getEchartsInstance();
    const containerWidth = containerRef.current?.offsetWidth;
    const containerHeight = containerRef.current?.offsetHeight;

    if (chartInstance && containerWidth && containerHeight) {
      chartInstance.resize({
        width: containerWidth,
        height: containerHeight,
      });
    }
  };

  
  useEffect(() => {
    // 创建 ResizeObserver 实例并绑定到父元素
    const resizeObserver = new ResizeObserver(() => {
      handleWindowResize()
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // 清理函数：在组件卸载时移除监听器
    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
    };
  }, []);

  const calculateYAxisInterval = (data: InvokeData | MessageData, lineChartOption: EChartsOption, yAxis: {[k:string]:unknown}, legendSelected?: Record<string, boolean>): {[k:string]:unknown} => {
    const maxValues =data ?  Object.entries(data).reduce((acc, [key, value]) => {
      if (key !== 'date' && key !== 'requestRate' && key !== 'proxyRate' && value instanceof Array) {
        acc[key] = Math.max(...(value as number[]));
      }
      return acc;
    }, {} as { [key: string]: number } ) : {};
  
    const selectedLegend = legendSelected ?? (lineChartOption.legend?.selected ?? {});
  
    const filteredMaxValues = Object.entries(maxValues).reduce((arr, [key, max]) => {
      if (selectedLegend[MONITOR_NAME_MAP[key]]) {
        arr.push(max);
      }
      return arr;
    }, [] as number[]);
  
    const maxNum = Math.max(...filteredMaxValues, 0);
  
    return {
      ...yAxis,
      interval: maxNum > 5 ? maxNum / 5 : 1,
      max: maxNum > 5 ? maxNum : 5,
    };
  };

  const handleLegendSelectChange = (val:{selected:Record<string,boolean>})=>{
    setLegendSelected(val.selected)
  }
  
  const getTimeFormatter = (time:string)=>{
    switch (yAxisTitle) {
      case '分钟': {
        return `${new Date(time).getMonth() < 9 ? '0' + (new Date(time).getMonth() + 1) : (new Date(time).getMonth() + 1)}/${new Date(time).getDate() < 10 ? '0' + new Date(time).getDate() : new Date(time).getDate()} ${new Date(time).getHours() < 10 ? '0' + new Date(time).getHours() : new Date(time).getHours()}:${new Date(time).getMinutes() < 10 ? '0' + new Date(time).getMinutes() : new Date(time).getMinutes()}`
      }
      case '5分钟': {
        return `${new Date(time).getMonth() < 9 ? '0' + (new Date(time).getMonth() + 1) : (new Date(time).getMonth() + 1)}/${new Date(time).getDate() < 10 ? '0' + new Date(time).getDate() : new Date(time).getDate()} ${new Date(time).getHours() < 10 ? '0' + new Date(time).getHours() : new Date(time).getHours()}:${new Date(time).getMinutes() < 10 ? '0' + new Date(time).getMinutes() : new Date(time).getMinutes()}   `
      }
      case '1小时': {
        return `${new Date(time).getMonth() < 9 ? '0' + (new Date(time).getMonth() + 1) : (new Date(time).getMonth() + 1)}/${new Date(time).getDate() < 10 ? '0' + new Date(time).getDate() : new Date(time).getDate()} ${new Date(time).getHours() < 10 ? '0' + new Date(time).getHours() : new Date(time).getHours()}     `
      }
      case '1天': {
        return `${new Date(time).getFullYear().toString().slice(2)}年-${new Date(time).getMonth() < 9 ? '0' + (new Date(time).getMonth() + 1) : (new Date(time).getMonth() + 1)}/${new Date(time).getDate() < 10 ? '0' + new Date(time).getDate() : new Date(time).getDate()}      `
      }
      case '1周': {
        return `${new Date(time).getFullYear().toString().slice(2)}年-${new Date(time).getMonth() < 9 ? '0' + (new Date(time).getMonth() + 1) : (new Date(time).getMonth() + 1)}/${new Date(time).getDate() < 10 ? '0' + new Date(time).getDate() : new Date(time).getDate()}      `
      }
    }
    return `${new Date(time).getMonth() + 1}/${new Date(time).getDate() < 10 ? '0' + new Date(time).getDate() : new Date(time).getDate()} ${new Date(time).getHours() < 10 ? '0' + new Date(time).getHours() : new Date(time).getHours()}:${new Date(time).getMinutes() < 10 ? '0' + new Date(time).getMinutes() : new Date(time).getMinutes()}`
  }

  const generateInvokeLineChartOption = ()=>({
    ...MONITOR_LINE_CHART_OPTION_CONFIG,
    grid: {
      left: '16',
      right: '16',
      bottom: '16',
      top: '120',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: (lineData as InvokeData)?.date?.map((x:string) => {
        return `${new Date(x).getFullYear()}/${new Date(x).getMonth() + 1}/${new Date(x).getDate()} ${new Date(x).getHours()}:${new Date(x).getMinutes()}              `
      }) || [],
      axisLabel: {
        showMaxLabel: true,
        formatter: (value:string) => {
          return value ? getTimeFormatter(value) : ''
        }
      },
      axisTick: {
        show: false
      },
      boundaryGap: false
    },
    yAxis: [{
      type: 'value',
      name: (lineData as InvokeData)?.date.length > 0 ? $t('(0)调用量',[yAxisTitle]) : '',
      nameLocation: 'end',
      nameTextStyle: {
        align: 'left'
      },
      min: 0,
      max: 'dataMax',
      axisLabel: {
        formatter: (value:number) => {
          return yUnitFormatter(value)
        }
      }
    },
    {
      type: 'value',
      name: (lineData as InvokeData)?.date.length > 0 ? $t('(0)调用成功率',[yAxisTitle])  : '',
      position: 'right',
      min: 0,
      max: 100,
      show: (lineData as InvokeData)?.date.length > 0,
      interval: 20,
      axisLabel: {
        formatter: '{value} %'
      },
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      }
    }],
    series: [
      { type: 'line', symbol: 'none', name: $t('请求总数'), data: (lineData as InvokeData)?.requestTotal, yAxisIndex: 0 },
      { type: 'line', symbol: 'none', name: $t('请求成功率'), data: (lineData as InvokeData)?.requestRate?.map((x) => Number((Number(x) * 100).toFixed(2))) || [], yAxisIndex: 1 },
      { type: 'line', symbol: 'none', name: $t('转发总数'), data: (lineData as InvokeData)?.proxyTotal, yAxisIndex: 0 },
      { type: 'line', symbol: 'none', name: $t('转发成功率'), data: (lineData as InvokeData)?.proxyRate?.map((x) => Number((Number(x) * 100).toFixed(2))) || [], yAxisIndex: 1 },
      { type: 'line', symbol: 'none', lineStyle: { type: 'dashed' }, name: $t('状态码4xx数'), data: (lineData as InvokeData)?.status_4xx, yAxisIndex: 0 },
      { type: 'line', symbol: 'none', lineStyle: { type: 'dashed' }, name: $t('状态码5xx数'), data: (lineData as InvokeData)?.status_5xx, yAxisIndex: 0 }
    ]
  })

  const generateInvokeCompareLineChartOption = ()=>({
    ...MONITOR_LINE_CHART_OPTION_CONFIG,
    tooltip: {
      formatter: (params:Array<Record<string,unknown>>) => {
        const startHtml = '<div><section style="align-items: center;display:flex; justify-content: space-between;flex-wrap: nowrap;"><span> ' + (params[0].seriesIndex === 0 ? modalTitle : dataTitle + '调用总体趋势') + '</span>&nbsp&nbsp&nbsp<span>' + params[0].axisValue + '</span></div>'
        const listArr = []
        for (let i = 0; i < params.length; i++) {
          const item = params[i]
          // echarts会根据你定义的颜色返回一个生成好的带颜色的标记，直接实用即可
          let str = ''
          if (i === Math.floor(params.length / 2)) {
            str = '<br/><div><section style="align-items: center;display:flex; justify-content: space-between;flex-wrap: nowrap;"><span> ' + (params[0].seriesIndex === 0 ? dataTitle + $t('调用总体趋势') :modalTitle) + '</span>&nbsp&nbsp&nbsp<span>' + params[0].axisValue + '</span></div><div><section style="align-items: center;display:flex; justify-content: space-between;flex-wrap: nowrap;"><span> ' + item.marker
          } else {
            str = '<div><section style="align-items: center;display:flex; justify-content: space-between;flex-wrap: nowrap;"><span> ' + item.marker
          }
          if (item.seriesName === $t('请求成功率') || item.seriesName === $t('转发成功率')) {
            str += (item.seriesName + '&nbsp&nbsp&nbsp </span><span style="font-weight:bold"> ' + item.value + '% </span></section></div>')
          } else {
            str += (item.seriesName + '&nbsp&nbsp&nbsp </span><span style="font-weight:bold"> ' + item.value + '</span></section></div>')
          }
          listArr.push(str)
        }
        return startHtml + listArr.join('')
      },
      trigger: 'axis',
      axisPointer: {
        link: [{
          xAxisIndex: 'all'
        }]
      }
    },
    axisPointer: {
      link: [{
        xAxisIndex: 'all'
      }]
    },
    grid: [
      {
        left: '16',
        right: '16',
        top: '120',
        containLabel: true,
        bottom: '50%'
      },
      {
        left: '16',
        right: '16',
        bottom: '16',
        containLabel: true,
        top: '60%'
      }
    ],
    xAxis: [{
      type: 'category',
      data: (lineData as InvokeData)?.date?.map((x:string) => {
        return `${new Date(x).getFullYear()}/${new Date(x).getMonth() + 1}/${new Date(x).getDate()} ${new Date(x).getHours()}:${new Date(x).getMinutes()}              `
      }) || [],
      axisLabel: {
        showMaxLabel: true,
        formatter: (value:string) => {
          return value ? getTimeFormatter(value) : ''
        }
      },
      axisTick: {
        show: false
      }
    },
    {
      gridIndex: 1,
      type: 'category',
      data: (lineData as InvokeData)?.date?.map((x:string) => {
        return `${new Date(x).getFullYear()}/${new Date(x).getMonth() + 1}/${new Date(x).getDate()} ${new Date(x).getHours()}:${new Date(x).getMinutes()}              `
      }) || [],
      axisLabel: {
        showMaxLabel: true,
        formatter: (value:string) => {
          return value ? getTimeFormatter(value) : ''
        }
      }
    }
    ],
    yAxis: [
      {
        type: 'value',
        name: (lineData as InvokeData)?.date.length > 0 ? $t('(0)调用量',[yAxisTitle]) : '',
        nameLocation: 'end',
        nameTextStyle: {
          align: 'left'
        },
        min: 0,
        max: 'dataMax',
        axisLabel: {

          formatter: (value:number) => {
            return yUnitFormatter(value)
          }
        }
      },
      {
        type: 'value',
        name: (lineData as InvokeData)?.date.length > 0 ? $t('(0)调用成功率',[yAxisTitle]) : '',
        position: 'right',
        min: 0,
        max: 100,
        show: (lineData as InvokeData)?.date.length > 0,

        interval: 20,
        axisLabel: {
          formatter: '{value} %'
        },
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        }
      },
      {
        gridIndex: 1,
        type: 'value',
        name: (lineData as InvokeData)?.date.length > 0 ? $t('(0)调用量',[yAxisTitle]) : '',
        nameLocation: 'end',
        nameTextStyle: {
          align: 'left'
        },
        min: 0,
        max: 'dataMax',
        axisLabel: {

          formatter: (value:number) => {
            return yUnitFormatter(value)
          }
        }
      },
      {
        gridIndex: 1,
        type: 'value',
        name: (lineData as InvokeData)?.date.length > 0 ? $t('(0)调用成功率',[yAxisTitle]): '',
        position: 'right',
        min: 0,
        max: 100,
        show: (lineData as InvokeData)?.date.length > 0,

        interval: 20,
        axisLabel: {
          formatter: '{value} %'
        },
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        }
      }],
    series: [
      { type: 'line', symbol: 'none', name: $t('请求总数'), data: (lineData as InvokeData)?.requestTotal, xAxisIndex: 0, yAxisIndex: 0 },
      { type: 'line', symbol: 'none', name: $t('请求成功率'), data: (lineData as InvokeData)?.requestRate?.map((x) => Number((Number(x) * 100).toFixed(2))) || [], xAxisIndex: 0, yAxisIndex: 1 },
      { type: 'line', symbol: 'none', name: $t('转发总数'), data: (lineData as InvokeData)?.proxyTotal, xAxisIndex: 0, yAxisIndex: 0 },
      { type: 'line', symbol: 'none', name: $t('转发成功率'), data: (lineData as InvokeData)?.proxyRate?.map((x) => Number((Number(x) * 100).toFixed(2))) || [], xAxisIndex: 0, yAxisIndex: 1 },
      { type: 'line', lineStyle: { type: 'dashed' }, symbol: 'none', name: $t('状态码4xx数'), data: (lineData as InvokeData)?.status_4xx, xAxisIndex: 0, yAxisIndex: 0 },
      { type: 'line', lineStyle: { type: 'dashed' }, symbol: 'none', name: $t('状态码5xx数'), data: (lineData as InvokeData)?.status_5xx, xAxisIndex: 0, yAxisIndex: 0 },
      { type: 'line', symbol: 'none', name: $t('请求总数'), data: (compareData as InvokeData)?.requestTotal, xAxisIndex: 1, yAxisIndex: 2 },
      { type: 'line', symbol: 'none', name: $t('请求成功率'), data: (compareData as InvokeData)?.requestRate?.map((x) => Number((Number(x) * 100).toFixed(2))) || [], xAxisIndex: 1, yAxisIndex: 3 },
      { type: 'line', symbol: 'none', name: $t('转发总数'), data: (compareData as InvokeData)?.proxyTotal, xAxisIndex: 1, yAxisIndex: 2 },
      { type: 'line', symbol: 'none', name: $t('转发成功率'), data: (compareData as InvokeData)?.proxyRate?.map((x) => Number((Number(x) * 100).toFixed(2))) || [], xAxisIndex: 1, yAxisIndex: 3 },
      { type: 'line', lineStyle: { type: 'dashed' }, symbol: 'none', name: $t('状态码4xx数'), data: (compareData as InvokeData)?.status_4xx, xAxisIndex: 1, yAxisIndex: 2 },
      { type: 'line', lineStyle: { type: 'dashed' }, symbol: 'none', name: $t('状态码5xx数'), data: (compareData as InvokeData)?.status_5xx, xAxisIndex: 1, yAxisIndex: 2 }
    ]
  })

  const generateInvokeServiceLineChartOption = ()=>({
    ...MONITOR_LINE_CHART_OPTION_CONFIG,
    legend: {
      orient: 'horizontal',
      top: '50',
      selected: {
        转发总数: true,
        转发成功率: true,
        状态码4xx数: false,
        状态码5xx数: false
      }
    },
    grid: {
      left: '16',
      right: '16',
      bottom: '16',
      top: '120',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: (lineData as InvokeData)?.date?.map((x:string) => {
        return `${new Date(x).getFullYear()}/${new Date(x).getMonth() + 1}/${new Date(x).getDate()} ${new Date(x).getHours()}:${new Date(x).getMinutes()}              `
      }) || [],
      axisLabel: {
        showMaxLabel: true,
        formatter: (value:string) => {
          return getTimeFormatter(value)
        }
      },
      axisTick: {
        show: false
      }
    },
    yAxis: [
      {
        type: 'value',
        name: (lineData as InvokeData)?.date.length > 0 ?$t('(0)调用量',[yAxisTitle]) : '',
        nameLocation: 'end',
        nameTextStyle: {
          align: 'left'
        },

        min: 0,
        max: 'dataMax',
        axisLabel: {

          formatter: (value:number) => {
            return yUnitFormatter(value)
          }
        }
      },
      {
        type: 'value',
        name: (lineData as InvokeData)?.date.length > 0 ? $t('(0)调用成功率',[yAxisTitle]) : '',
        position: 'right',
        min: 0,
        max: 100,
        show: (lineData as InvokeData)?.date.length > 0,
        interval: 20,
        axisLabel: {
          formatter: '{value} %'
        },
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        }
      }],
    series: [
      { type: 'line', symbol: 'none', name: $t('转发总数'), data: (lineData as InvokeData)?.proxyTotal, yAxisIndex: 0 },
      { type: 'line', symbol: 'none', name: $t('转发成功率'), data: (lineData as InvokeData)?.proxyRate?.map((x) => Number((Number(x) * 100).toFixed(2))) || [], yAxisIndex: 1 },
      { type: 'line', lineStyle: { type: 'dashed' }, symbol: 'none', name: $t('状态码4xx数'), data: (lineData as InvokeData)?.status_4xx, yAxisIndex: 0 },
      { type: 'line', lineStyle: { type: 'dashed' }, symbol: 'none', name: $t('状态码5xx数'), data: (lineData as InvokeData)?.status_5xx, yAxisIndex: 0 }
    ]})

  const generateInvokeServiceCompareLineChartOption = ()=>({
    ...MONITOR_LINE_CHART_OPTION_CONFIG,
    legend: {
      orient: 'horizontal',
      top: '50',
      selected: {
        转发总数: true,
        转发成功率: true,
        状态码4xx数: false,
        状态码5xx数: false
      }
    },
    grid: [
      {
        left: '16',
        right: '16',
        top: '120',
        containLabel: true,
        bottom: '50%'
      },
      {
        left: '16',
        right: '16',
        bottom: '16',
        containLabel: true,
        top: '60%'
      }
    ],
    tooltip: {
      trigger: 'axis',
      formatter: (params:Array<Record<string,unknown>>) => {
        const startHtml = '<div><section style="align-items: center;display:flex; justify-content: space-between;flex-wrap: nowrap;"><span> ' + (params[0].seriesIndex === 0 ? modalTitle : dataTitle + $t('调用总体趋势')) + '</span>&nbsp&nbsp&nbsp<span>' + params[0].axisValue + '</span></div>'
        const listArr = []
        for (let i = 0; i < params.length; i++) {
          const item = params[i]
          // echarts会根据你定义的颜色返回一个生成好的带颜色的标记，直接实用即可
          let str = ''
          if (i === Math.floor(params.length / 2)) {
            str = '<br/><div><section style="align-items: center;display:flex; justify-content: space-between;flex-wrap: nowrap;"><span> ' + (params[0].seriesIndex === 0 ? dataTitle + $t('调用总体趋势') : modalTitle) + '</span>&nbsp&nbsp&nbsp<span>' + params[0].axisValue + '</span></div><div><section style="align-items: center;display:flex; justify-content: space-between;flex-wrap: nowrap;"><span> ' + item.marker
          } else {
            str = '<div><section style="align-items: center;display:flex; justify-content: space-between;flex-wrap: nowrap;"><span> ' + item.marker
          }
          if (item.seriesName === $t('请求成功率') || item.seriesName === $t('转发成功率')) {
            str += (item.seriesName + '&nbsp&nbsp&nbsp </span><span style="font-weight:bold"> ' + item.value + '% </span></section></div>')
          } else {
            str += (item.seriesName + '&nbsp&nbsp&nbsp </span><span style="font-weight:bold"> ' + item.value + '</span></section></div>')
          }
          listArr.push(str)
        }
        return startHtml + listArr.join('')
      }
    },
    axisPointer: {
      link: [{
        xAxisIndex: 'all'
      }]
    },
    xAxis: [{
      type: 'category',
      data: (lineData as InvokeData)?.date?.map((x:string) => {
        return `${new Date(x).getFullYear()}/${new Date(x).getMonth() + 1}/${new Date(x).getDate()} ${new Date(x).getHours()}:${new Date(x).getMinutes()}              `
      }) || [],
      axisLabel: {
        showMaxLabel: true,
        formatter: (value:string) => {
          return getTimeFormatter(value)
        }
      },
      axisTick: {
        show: false
      }
    },
    {
      gridIndex: 1,
      type: 'category',
      data: (lineData as InvokeData)?.date?.map((x:string) => {
        return `${new Date(x).getFullYear()}/${new Date(x).getMonth() + 1}/${new Date(x).getDate()} ${new Date(x).getHours()}:${new Date(x).getMinutes()}              `
      }) || [],
      splitNumber: 5,
      axisLabel: {
        showMaxLabel: true,
        formatter: (value:string) => {
          return getTimeFormatter(value)
        }
      },
      axisTick: {
        show: false
      }
    }],
    yAxis: [
      {
        type: 'value',
        name: (lineData as InvokeData)?.date.length > 0 ?  $t('(0)调用量',[yAxisTitle]) : '',
        nameLocation: 'end',
        nameTextStyle: {
          align: 'left'
        },
        min: 0,
        max: 'dataMax',
        axisLabel: {

          formatter: (value:number) => {
            return yUnitFormatter(value)
          }
        }
      },
      {
        type: 'value',
        name: (lineData as InvokeData)?.date.length > 0 ?  $t('(0)调用成功率',[yAxisTitle])  : '',
        position: 'right',
        min: 0,
        max: 100,
        show: (lineData as InvokeData)?.date.length > 0,

        interval: 20,
        axisLabel: {
          formatter: '{value} %'
        },
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        }
      },
      {
        gridIndex: 1,
        type: 'value',
        name: (lineData as InvokeData)?.date.length > 0 ? $t('(0)调用量',[yAxisTitle]): '',
        nameLocation: 'end',
        nameTextStyle: {
          align: 'left'
        },
        min: 0,
        max: 'dataMax',
        axisLabel: {

          formatter: (value:number) => {
            return yUnitFormatter(value)
          }
        }
      },
      {
        gridIndex: 1,
        type: 'value',
        name: (lineData as InvokeData)?.date.length > 0 ? $t('(0)调用成功率',[yAxisTitle]) : '',
        position: 'right',
        min: 0,
        max: 100,
        show: (lineData as InvokeData)?.date.length > 0,

        interval: 20,
        axisLabel: {
          formatter: '{value} %'
        },
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        }
      }],
    series: [
      { type: 'line', symbol: 'none', name: $t('转发总数'), data: (lineData as InvokeData)?.proxyTotal, xAxisIndex: 0, yAxisIndex: 0 },
      { type: 'line', symbol: 'none', name: $t('转发成功率'), data: (lineData as InvokeData)?.proxyRate, xAxisIndex: 0, yAxisIndex: 1 },
      { type: 'line', symbol: 'none', lineStyle: { type: 'dashed' }, name: $t('状态码4xx数'), data: (lineData as InvokeData)?.status_4xx, xAxisIndex: 0, yAxisIndex: 0 },
      { type: 'line', symbol: 'none', lineStyle: { type: 'dashed' }, name: $t('状态码5xx数'), data: (lineData as InvokeData)?.status_5xx, xAxisIndex: 0, yAxisIndex: 0 },
      { type: 'line', symbol: 'none', name: $t('转发总数'), data: (compareData as InvokeData)?.proxyTotal, xAxisIndex: 1, yAxisIndex: 2 },
      { type: 'line', symbol: 'none', name: $t('转发成功率'), data: (compareData as InvokeData)?.proxyRate, xAxisIndex: 1, yAxisIndex: 3 },
      { type: 'line', symbol: 'none', lineStyle: { type: 'dashed' }, name: $t('状态码4xx数'), data: (compareData as InvokeData)?.status_4xx, xAxisIndex: 1, yAxisIndex: 2 },
      { type: 'line', symbol: 'none', lineStyle: { type: 'dashed' }, name: $t('状态码5xx数'), data: (compareData as InvokeData)?.status_5xx, xAxisIndex: 1, yAxisIndex: 2 }
    ]})

  const generateTrafficLineChartOption = ()=>({
    ...MONITOR_LINE_CHART_OPTION_CONFIG,
    legend: {
      orient: 'horizontal',
      top: '50',
      selected: {...MONITOR_LINE_CHART_BASIC_MESSAGE_SELECTED}
    },
    grid: {
      left: '16',
      right: '16',
      bottom: '20',
      top: '120',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: (lineData as MessageData)?.date?.map((x:string) => {
        return `${new Date(x).getFullYear()}/${new Date(x).getMonth() + 1}/${new Date(x).getDate()} ${new Date(x).getHours()}:${new Date(x).getMinutes()}              `
      }) || [],
      axisLabel: {
        showMaxLabel: true,
        formatter: (value:string) => {
          return getTimeFormatter(value)
        }
      },
      axisTick: {
        show: false
      }
    },
    yAxis: [{
      type: 'value',
      name: (lineData as MessageData)?.date.length > 0 ? `${yAxisTitle}报文量（KB）` : '',
      nameLocation: 'end',
      nameTextStyle: {
        align: 'left'
      },
      axisTick: {
        length: 6
      },

      min: 0,
      max: 'dataMax',
      axisLabel: {

        formatter: (value:number) => {
          return yUnitFormatter(value)
        }
      }
    },
    {
      type: 'value',
      name: (lineData as InvokeData)?.date.length > 0 ? $t('(0)调用成功率',[yAxisTitle]) : '',
      position: 'right',
      min: 0,
      max: 100,
      show: false,

      interval: 20,
      axisLabel: {
        formatter: '{value} %'
      },
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      }
    }],
    series: [
      { type: 'line', symbol: 'none', name: $t('请求报文量'), data: (lineData as MessageData).requestMessage, yAxisIndex: 0 },
      { type: 'line', symbol: 'none', name: $t('响应报文量'), data: (lineData as MessageData).responseMessage, yAxisIndex: 0 }
    ]})

    
  const option:EChartsOption = useMemo(()=>{
    const generateBasicOption = ()=>{
      switch(type){
        case 'invoke':
          return compare ? generateInvokeCompareLineChartOption() : generateInvokeLineChartOption()
        case 'invokeService':
          return compare ? generateInvokeServiceCompareLineChartOption() : generateInvokeServiceLineChartOption()
        case 'traffic':
          return generateTrafficLineChartOption()
      }
    }

    const getOption = ()=>{
      const option = generateBasicOption()

      option.title = {
        text: titles[0],
        left: 'center',
        top: '0',
        textStyle: {
          fontSize: 16,
          fontWeight: 500
        }
      }
       // 当勾选请求成功率或转发成功率其中之一时，显示右侧y轴
      if (legendSelected && lineData?.date && lineData?.date.length > 0) {
        if (!legendSelected[$t('转发成功率')] && !legendSelected[$t('请求成功率')] && (option.yAxis as Array<unknown>)?.length > 1 && option.yAxis[1].show !== false) {
          option.yAxis[1].show = false
        } else if ((legendSelected[$t('转发成功率')] || legendSelected[$t('请求成功率')]) && (option.yAxis as Array<unknown>)?.length > 1 && option.yAxis[1].show !== true) {
          option.yAxis[1].show = true
        }
      }
      option.legend = { ...option.legend, selected: legendSelected || undefined }
      option.yAxis[0] = calculateYAxisInterval(lineData,option, option.yAxis[0], legendSelected)
      if(compare){option.yAxis[2] = calculateYAxisInterval(compareData!, option,option.yAxis[2], legendSelected)}
      return option
    }
    return getOption()

  },[compare, type,lineData,yAxisTitle,titles,legendSelected])



  // const handleWindowResize = useCallback(debounce(() => {
  //   if (containerRef.current && graphRef.current && !graphRef.current.get('destroyed')) {
  //     echarts. (
  //       containerRef.current.offsetWidth,
  //       containerRef.current.offsetHeight,
  //     );
  //   }
  // }, 400), []);
  
  return (
    <div ref={containerRef} className={`${className} m-btnbase mb-mbase rounded`}>
      <ECharts ref={chartRef} option={option} style={{ height: compare ? '672px' :'320px', width: '100%',minWidth:'300px' }} onEvents={{'legendselectchanged':handleLegendSelectChange}}/>
    </div>
    )
};

export default MonitorLineGraph;