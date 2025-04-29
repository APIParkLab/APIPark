import ECharts, { EChartsOption } from 'echarts-for-react'
import { useEffect, useRef, useState } from 'react'
import { $t } from '@common/locales/index.ts'
import { useGlobalContext } from '@common/contexts/GlobalStateContext'

export type BarChartInfo = {
  title: string
  value: string
  date: string[]
  data: {
    name: string
    color: string
    value: number[]
  }[]
  showXAxis?: boolean
}

type ServiceBarCharProps = {
  customClassNames?: string
  dataInfo?: BarChartInfo
  height?: number
}

const ServiceBarChar = ({ customClassNames, dataInfo, height }: ServiceBarCharProps) => {
  const chartRef = useRef<ECharts>(null)
  const [option, setOption] = useState<EChartsOption | undefined>({})
  const [detaultColor] = useState('#5470c6')
  const tokenMap = {
    inputToken: $t('输入 Token'),
    outputToken: $t('输出 Token'),
    totalToken: $t('总 Token')
  }
  const setChartOption = (dataInfo: BarChartInfo) => {
    const isNumberArray = typeof dataInfo.data[0] !== 'object'
    const legendData = isNumberArray ? [dataInfo.title] : dataInfo.data.map((item) => item.name)
    const hasData = dataInfo.data && dataInfo.data.length > 0
    const tooltipFormatter = (params: { name: string; color: string; seriesIndex?: number }) => {
      let tooltipContent = `<div style="min-width:140px;padding:8px;">
                          <div>${isNumberArray ? '' : params.name}</div>`
      const data = isNumberArray
        ? [
            {
              name: params.name,
              color: detaultColor,
              value: dataInfo.data
            }
          ]
        : dataInfo.data
      // 为每个数据系列添加一行
      data.forEach((item, index) => {
        const color = item.color
        const name = tokenMap[item.name as keyof typeof tokenMap] || item.name
        const value = item.value[dataInfo.date.indexOf(params.name)] || 0

        const marker = `<span style="display:inline-block;margin-right:4px;border-radius:10px;width:10px;height:10px;background-color:${color};"></span>`
        tooltipContent += `<div style="margin-top: ${index === 0 ? 8 : 4}px; display: flex; justify-content: space-between; align-items: center;">
                          <div>${marker} ${name}</div> <div style="font-weight:bold; margin-left: 20px;">${value}</div>
                        </div>`
      })

      tooltipContent += '</div>'
      return tooltipContent
    }
    const option: EChartsOption = {
      title: [
        {
          text: '{titleStyle|' + $t(dataInfo.title) + '}\n\n{valueStyle|' + dataInfo.value + '}',
          left: '2%',
          top: '0',
          textStyle: {
            rich: {
              titleStyle: {
                fontSize: 14,
                color: '#999',
                fontWeight: 'normal',
                lineHeight: 20
              },
              valueStyle: {
                fontSize: 32,
                color: '#101010',
                fontWeight: 500,
                lineHeight: 40
              }
            }
          }
        }
      ],
      grid: {
        left: '3%',
        right: '3%',
        bottom: '0%',
        top: '110px',
        containLabel: true
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: function (params: any) {
          // 如果是数组，取第一个参数的name
          const param = Array.isArray(params) ? params[0] : params
          return tooltipFormatter(param)
        }
      },
      legend: {
        show: false,
        data: legendData,
        right: '10px',
        top: '30px',
        itemWidth: 10,
        itemHeight: 10,
        textStyle: {
          color: '#333'
        },
        icon: 'rect'
      },
      xAxis: {
        type: 'category',
        data: dataInfo.date,
        axisTick: {
          show: false
        },
        axisLine: {
          lineStyle: {
            color: '#ccc'
          }
        },
        show: false
      },
      yAxis: {
        type: 'value',
        name: '',
        min: 0,
        minInterval: 1,
        splitLine: {
          lineStyle: {
            type: 'dashed',
            color: '#eee'
          }
        },
        axisLabel: {
          formatter: '{value}'
        }
      },
      // 添加数据缩放组件，实现鼠标放大缩小，后续可能需要
      // dataZoom: [
      //   {
      //     type: 'inside', // 内置的数据区域缩放组件（使用鼠标滚轮缩放）
      //     xAxisIndex: 0, // 设置缩放作用在第一个x轴
      //     filterMode: 'filter',
      //     start: 0,
      //     end: 100
      //   },
      //   {
      //     type: 'slider', // 滑动条型数据区域缩放组件
      //     xAxisIndex: 0,
      //     filterMode: 'filter',
      //     height: 20,
      //     bottom: 0,
      //     start: 0,
      //     end: 100,
      //     handleIcon: 'path://M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
      //     handleSize: '80%',
      //     handleStyle: {
      //       color: '#fff',
      //       shadowBlur: 3,
      //       shadowColor: 'rgba(0, 0, 0, 0.6)',
      //       shadowOffsetX: 2,
      //       shadowOffsetY: 2
      //     },
      //     show: false // 默认隐藏底部的滑动条，可以改为 true 显示
      //   }
      // ],
      // 添加空状态提示
      graphic: !hasData
        ? [
            {
              type: 'text',
              left: 'center',
              top: 'middle',
              style: {
                text: $t('暂无数据'),
                fontSize: 14,
                fill: '#999'
              }
            }
          ]
        : [],
      series: isNumberArray
        ? [
            {
              name: dataInfo.title,
              type: 'bar',
              stack: '总量',
              emphasis: {
                focus: 'series'
              },
              itemStyle: {
                color: detaultColor
              },
              data: dataInfo.data
            }
          ]
        : dataInfo.data.map((item) => ({
            name: item.name,
            type: 'bar',
            stack: '总量',
            emphasis: {
              focus: 'series'
            },
            itemStyle: {
              color: item.color
            },
            data: item.value
          }))
    }
    setOption(option)
  }

  // 使用深度监听来确保图表数据更新
  useEffect(() => {
    if (!dataInfo) return
    
    // 直接获取 ECharts 实例并设置选项
    const echartsInstance = chartRef.current?.getEchartsInstance()
    if (echartsInstance) {
      // 清除已有的图表
      echartsInstance.clear()
      // 重新设置选项
      setChartOption(dataInfo)
    }
  }, [dataInfo, JSON.stringify(dataInfo)])

  // 添加窗口大小变化监听，实现自适应
  useEffect(() => {
    // 定义resize处理函数
    const handleResize = () => {
      const echartsInstance = chartRef.current?.getEchartsInstance()
      if (echartsInstance) {
        echartsInstance.resize()
      }
    }
    
    // 添加监听
    window.addEventListener('resize', handleResize)
    
    // 组件卸载时移除监听
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])
  return (
    <div className={`w-full ${customClassNames}`}>
      <ECharts ref={chartRef} option={option} style={{ height: height || 400 }} opts={{ renderer: 'svg' }} />
    </div>
  )
}

export default ServiceBarChar
