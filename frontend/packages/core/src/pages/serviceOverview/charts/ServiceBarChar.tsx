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
          text: '{titleStyle|' + $t(dataInfo.title) + '}\n{valueStyle|' + dataInfo.value + '}',
          left: '4%',
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
                fontSize: 25,
                color: '#000',
                fontWeight: 500,
                lineHeight: 40
              }
            }
          }
        }
      ],
      grid: {
        left: '5%',
        right: '3%',
        bottom: '5%',
        top: '100px',
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
        }
      },
      yAxis: {
        type: 'value',
        name: '',
        min: 0,
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

  useEffect(() => {
    if (!dataInfo) return
    setChartOption(dataInfo)
  }, [dataInfo])
  return (
    <div className={`w-full ${customClassNames}`}>
      <ECharts ref={chartRef} option={option} style={{ height: height || 400 }} opts={{ renderer: 'svg' }} />
    </div>
  )
}

export default ServiceBarChar
