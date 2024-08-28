import {FC, useMemo} from 'react';
import ECharts,{EChartsOption} from 'echarts-for-react';
import { changeNumberUnit } from '../utils/dashboard';
import { $t } from '@common/locales';
import { useGlobalContext } from '@common/contexts/GlobalStateContext';

type PieGraphProps = {
  className?:string,
  title:string, 
  pieData:{ [key: string]: number }, 
  labelName:string, 
  labelValue:string, 
  subText:string, 
  subValue:unknown
  status4xxCount?: number;
  status5xxCount?: number;
}

const MonitorPieGraph: FC<PieGraphProps> = ({ className,title, pieData, labelName, labelValue, subText, subValue,status4xxCount,status5xxCount }) => {
    const {state} = useGlobalContext()
  const transferData: (value:{[key:string]:number})=>Array<{name:string, value:number}>  = (value:{[key:string]:number})=> {
    const res:Array<{name:string, value:number}> = []
    const keys = Object.keys(value)
    for (const item of keys) {
      res.push({ name: item, value: value[item] })
    }
    return res
  }

  const option: EChartsOption = useMemo(()=>({
    tooltip: {
      trigger: 'item',
      formatter: (params:Array<Record<string,unknown>>) => {
        const startHtml = '<div><section style="align-items: center;display:flex; justify-content: space-between;flex-wrap: nowrap;"><span> ' + $t(title) + '</span></div>'
        return startHtml + ($t(params.name || '-')  + '&nbsp&nbsp&nbsp </span><span style="font-weight:bold"> ' + params.value + '</span></section></div>')
      }
    },
    title: [
      {
        right: '10',
        subtext: `{title|${$t(subText)}}{percent|${subValue}}`,
        top: '15%',
        subtextStyle: {
          rich: {
            title: { fontSize: 14, color: '#666666', lineHeight: 22, padding: [8, 0, 8, 0] },
            percent: { fontSize: 14, color: '#666666', width: 60, lineHeight: 22, align: 'right', padding: [8, 0, 8, 8] }
          },
          fontSize: 14,
          color: '#666666',
          lineHeight: 22,
          padding: [8, 0, 8, 0]
        }
      },
    ],
    legend: [
      {
        top: 'center',
        right: '10',
        orient: 'vertical',
        formatter: (name) => {
          return `{title|${$t(name)}}{percent|${changeNumberUnit(pieData[name]).value ? (changeNumberUnit(pieData[name]).value + $t(changeNumberUnit(pieData[name]).unit)) : '0'}}`;
        },
        textStyle: {
          rich: {
            title: { fontSize: 14, color: '#666666', lineHeight: 22, padding: [8, 0, 8, 0] },
            percent: { fontSize: 14, color: '#666666', width: 60, lineHeight: 22, align: 'right', padding: [8, 0, 8, 8] }
          }
        }
      },
    ],
    series: [
      {
        center: ['25%', '50%'],
        name: title,
        type: 'pie',
        color: ['#1890FF', '#13c2c2'],
        radius: ['50%', '75%'],
        avoidLabelOverlap: false,
        label: {
          show: true,
          position: 'center',
          formatter: '{text|' + $t(labelName) + '}\n{value|' + labelValue + '}',
          rich: {
            text: { fontSize: 14, color: '#666666', lineHeight: 22, padding: [0, 0, 6, 0] },
            value: { fontSize: 20, color: '#333333', lineHeight: 32, padding: [0, 0, 6, 0] },
          },
        },
        labelLine: {
          show: false,
        },
        data: transferData(pieData),
      },
    ],
  }),[state.language])
  
  return (
  <div className={`${className} min-w-[570px] p-[16px] relative text-DESC_TEXT overflow-x-auto rounded`}>
    <div className="font-medium text-[16px] text-DESC_TEXT">{title}</div>
      <div className="flex">
        <ECharts option={option} style={{ height: '230px', width: '70%' }} />
        
        <div className="w-[30%] flex white-nowrap text-[14px]">
          <div className="absolute flex items-center top-[calc(31%+1px)] text-gray-300 border-0 border-l-[1px] border-solid  border-gray-200 space-y-[16px] pl-[10px]">
            <ul className="list-none truncate my-0 ps-[10px]">
              <li className="h-[18px]"></li>
              <li className="text-[#999999] mt-[16px]">
                {$t('状态码4XX数')}
                <span className="text-[#999999] inline-block w-[50px] ml-[10px] text-right">
                  {changeNumberUnit(status4xxCount).value + $t(changeNumberUnit(status4xxCount).unit)}
                  </span>
              </li>
              <li className="text-[#999999]  mt-[18px]">
                {$t('状态码5XX数')}
                <span className="text-[#999999] inline-block w-[50px] ml-[10px] text-right">
                  {changeNumberUnit(status5xxCount).value + $t(changeNumberUnit(status5xxCount).unit)}
                </span>
              </li>
            </ul>
          </div>
        </div>
    </div>
  </div>);
};

export default MonitorPieGraph;