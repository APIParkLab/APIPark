
import { useState } from 'react';
import { Radio, DatePicker, GetProps, RadioChangeEvent } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import "../../index.css"

type RangePickerProps = GetProps<typeof DatePicker.RangePicker>;
export type RangeValue = [Dayjs | null, Dayjs | null] | null;

dayjs.extend(customParseFormat);

export type TimeRange = {
    start:number|null
    end:number|null
}

export type TimeRangeButton = ''| 'hour' | 'day' | 'threeDays' | 'sevenDays';

type TimeRangeSelectorProps = {
    initialTimeButton?:TimeRangeButton,
     initialDatePickerValue?:RangeValue
     onTimeRangeChange?:(timeRange:TimeRange) =>void
     hideTitle?:boolean
     onTimeButtonChange:(time:TimeRangeButton) =>void
     labelSize?:'small'|'default'
    }
const TimeRangeSelector = (props:TimeRangeSelectorProps) => {
    const {initialTimeButton,initialDatePickerValue,onTimeRangeChange,hideTitle,onTimeButtonChange,labelSize='default'} = props
  const [timeButton, setTimeButton] = useState(initialTimeButton || '');
  const [datePickerValue, setDatePickerValue] = useState<RangeValue>(initialDatePickerValue || [null,null]);

  // 根据选择的时间范围计算开始和结束时间
  const calculateTimeRange = (curBtn:'hour'|'day'|'threeDays'|'sevenDays') => {
    const currentSecond = new Date().getTime() // 当前毫秒数时间戳
    const currentMin = currentSecond - (currentSecond % (60 * 1000)) // 当前分钟数时间戳
    let startMin = currentMin - 60 * 60 * 1000
    switch (curBtn) {
        case 'hour': {
          startMin = currentMin - 60 * 60 * 1000
          break
        }
        case 'day': {
          startMin = currentMin - 24 * 60 * 60 * 1000
          break
        }
        case 'threeDays': {
          startMin =
            new Date(new Date().setHours(0, 0, 0, 0)).getTime() -
            2 * 24 * 60 * 60 * 1000
          break
        }
        case 'sevenDays': {
          startMin =
            new Date(new Date().setHours(0, 0, 0, 0)).getTime() -
            6 * 24 * 60 * 60 * 1000
          break
        }
      }
    if (onTimeRangeChange) {
      onTimeRangeChange({ start: startMin / 1000, end: currentMin / 1000  });
    }
  };

  // 处理单选按钮的变化
  const handleRadioChange = (e:RadioChangeEvent) => {
    setTimeButton(e.target.value);
    onTimeButtonChange?.(e.target.value)
    setDatePickerValue(null)
    calculateTimeRange(e.target.value);
  };

  // 处理日期选择器的变化
  const handleDatePickerChange = (dates: RangeValue) => {
    setTimeButton(dates ? '' : 'hour')
    onTimeButtonChange?.(dates ? '' : 'hour')
    setDatePickerValue(dates);
    if (dates && Array.isArray(dates) && dates.length === 2) {
      const [startDate, endDate] = dates;
      const start = startDate!.startOf('day').unix(); // 开始日期的00:00:00
      const end = endDate!.endOf('day').unix(); // 结束日期的23:59:59
      if (onTimeRangeChange) {
        onTimeRangeChange({ start, end });
      }
    }
  };

  
 
const disabledDate: RangePickerProps['disabledDate'] = (current) => {
// Can not select days before today and today
    return current && current.valueOf() > dayjs().startOf('day').valueOf();
};

  return (
    <div className="flex flex-nowrap items-center  pt-btnybase mr-btnybase">
    {!hideTitle && <label className={`whitespace-nowrap `}>时间：</label>}
     <Radio.Group className="whitespace-nowrap" value={timeButton} onChange={handleRadioChange} buttonStyle="solid">
                    <Radio.Button value="hour">近1小时</Radio.Button>
                    <Radio.Button value="day">近24小时</Radio.Button>
                    <Radio.Button value="threeDays">近3天</Radio.Button>
                    <Radio.Button className="rounded-e-none" value="sevenDays">近7天</Radio.Button>
                </Radio.Group>
      <DatePicker.RangePicker
        value={datePickerValue}
        className="rounded-s-none ml-[-1px]" 
        disabledDate={disabledDate}
        onChange={handleDatePickerChange}
        onOpenChange={(open)=>{
            if(!open && datePickerValue && datePickerValue.length > 2){
                setTimeButton('')
                onTimeButtonChange?.('')
            }
        }}
      />
    </div>
  );
};

export default TimeRangeSelector;