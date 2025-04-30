import { useEffect, useRef, useState } from 'react'
import ECharts, { EChartsOption } from 'echarts-for-react'
import { $t } from '@common/locales'

type AreaChartInfo = {
  title: string
  value: string
  date: string[]
  data: number[]
  max: string
  min: string
  showXAxis?: boolean
}

type ServiceAreaCharProps = {
  customClassNames?: string
  dataInfo?: AreaChartInfo
  height?: number
}

const ServiceAreaChart = ({ customClassNames, dataInfo, height }: ServiceAreaCharProps) => {
  const chartRef = useRef<ECharts>(null)
  const [option, setOption] = useState<EChartsOption | undefined>({})
  const [hasData, setHasData] = useState(true)
  const setChartOption = (dataInfo: AreaChartInfo) => {
    const dataExists = dataInfo.data && dataInfo.data.length > 0
    // 更新hasData状态
    setHasData(dataExists)
    const option = {
      tooltip: dataExists ? {
        trigger: 'axis',
        formatter: function (value: any) {
          // 如果是数组，取第一个参数的name
          const param = Array.isArray(value) ? value[0] : value
          let tooltipContent = `<div style="min-width:140px;padding:8px;">`
          const marker = `<span style="display:inline-block;margin-right:4px;border-radius:10px;width:10px;height:10px;background-color:${param.color};"></span>`
          tooltipContent += `<div style="margin-top: 8px; display: flex; justify-content: space-between; align-items: center;">
                            <div style="margin-right: 4px;">${marker}</div>${param.name} <div style="font-weight:bold; margin-left: 20px;">${param.value}</div>
                          </div>`
          tooltipContent += '</div>'
          return tooltipContent
        }
      } : {
        show: false // 没有数据时不显示tooltip
      },
      title: [
        {
          text: '{titleStyle|' + $t(dataInfo.title) + '}\n\n{valueStyle|' + dataInfo.value + '}',
          left: '2%',
          top: '0',
          textStyle: {
            rich: {
              titleStyle: {
                fontSize: 14,
                color: '#999999',
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
      toolbox: {
        show: false
      },
      grid: {
        left: '3%',
        right: '3%',
        bottom: '0%',
        top: '110px',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
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
        boundaryGap: [0, '5%'],
        show: dataExists, // 没有数据时不显示Y轴
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          show: false
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
      //     handleIcon:
      //       'path://M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
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
      silent: !dataExists,
      graphic: !dataExists
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
      series: [
        {
          name: dataInfo.title,
          type: 'line',
          symbol: 'none',
          sampling: 'lttb',
          itemStyle: {
            color: 'rgb(255, 70, 131)'
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                {
                  offset: 0,
                  color: 'rgb(255, 158, 68)'
                },
                {
                  offset: 1,
                  color: 'rgb(255, 70, 131)'
                }
              ]
            }
          },
          data: dataInfo.data
        }
      ]
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
      <div className="absolute top-[10px] left-[10px] w-full">
        <div className="relative top-[5px]">
          <div className="absolute top-[23px] right-[5%] grid grid-cols-[auto_auto] justify-items-end">
            <div className="flex justify-center items-center">
              <span className="text-[#FE564D] text-[9px]">▲</span>
            </div>
            <span className="ml-1 text-right">{dataInfo?.max}</span>
            <div className="flex justify-center items-center">
              <span className="text-[#27B148] text-[9px]">▼</span>
            </div>
            <span className="ml-1 text-right">{dataInfo?.min}</span>
          </div>
        </div>
      </div>
      <div style={!hasData ? { cursor: 'default', pointerEvents: 'none' } : {}}>
        <ECharts ref={chartRef} option={option} theme="apipark" style={{ height: height || 400 }} opts={{ renderer: 'svg' }} />
      </div>
    </div>
  )
}

export default ServiceAreaChart
