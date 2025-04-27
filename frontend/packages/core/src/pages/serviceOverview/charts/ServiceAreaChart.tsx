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
}

type ServiceAreaCharProps = {
  customClassNames?: string
  dataInfo?: AreaChartInfo
  height?: number
}

const ServiceAreaChart = ({ customClassNames, dataInfo, height }: ServiceAreaCharProps) => {
  const chartRef = useRef<ECharts>(null)
  const [option, setOption] = useState<EChartsOption | undefined>({})
  const setChartOption = (dataInfo: AreaChartInfo) => {
    const option = {
      tooltip: {
        trigger: 'axis',
        position: function (pt) {
          return [pt[0], '10%']
        }
      },
      title: {
        show: false
      },
      toolbox: {
        show: false
      },
      grid: {
        left: '5%',
        right: '3%',
        bottom: '5%',
        top: '100px',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: dataInfo.date
      },
      yAxis: {
        type: 'value',
        boundaryGap: [0, '5%'],
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
      dataZoom: [],
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
  useEffect(() => {
    if (!dataInfo) return
    setChartOption(dataInfo)
  }, [dataInfo])
  return (
    <div className={`w-full ${customClassNames}`}>
      <div className="absolute top-[10px] left-[10px] w-full">
        <div className="text-[16px] text-[#999]">{$t(dataInfo?.title || '')}</div>
        <div className="relative top-[-6px]">
          <span className="text-[30px] font-bold">{dataInfo?.value}</span>
          <div className="absolute top-[5px] right-[8%] grid grid-cols-[auto_auto] gap-y-1 justify-items-end">
            <div className="flex justify-center items-center">
              <span className="text-[#ff4683] text-[9px]">▲</span>
            </div>
            <span className="ml-1 text-right">{dataInfo?.max}</span>
            <div className="flex justify-center items-center">
              <span className="text-[#4bdb6a] text-[9px]">▼</span>
            </div>
            <span className="ml-1 text-right">{dataInfo?.min}</span>
          </div>
        </div>
      </div>
      <ECharts ref={chartRef} option={option} style={{ height: height || 400 }} opts={{ renderer: 'svg' }} />
    </div>
  )
}

export default ServiceAreaChart
