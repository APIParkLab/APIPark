
import { useEffect, useState } from 'react';
import { Radio, DatePicker, GetProps, RadioChangeEvent } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import "../../index.css"
import { $t } from '@common/locales';

type RangePickerProps = GetProps<typeof DatePicker.RangePicker>;
export type RangeValue = [Dayjs | null, Dayjs | null] | null;

dayjs.extend(customParseFormat);

export type TimeRange = {
  start: number | null
  end: number | null
}

export type TimeRangeButton = '' | 'hour' | 'day' | 'threeDays' | 'sevenDays';

type TimeRangeSelectorProps = {
  initialTimeButton?: TimeRangeButton,
  initialDatePickerValue?: RangeValue
  onTimeRangeChange?: (timeRange: TimeRange) => void
  hideTitle?: boolean
  onTimeButtonChange: (time: TimeRangeButton) => void
  labelSize?: 'small' | 'default'
  bindRef?: any
  hideBtns?: TimeRangeButton[]
  defaultTimeButton?: TimeRangeButton
}
const TimeRangeSelector = (props: TimeRangeSelectorProps) => {
  const { initialTimeButton, initialDatePickerValue, onTimeRangeChange, hideTitle, onTimeButtonChange, labelSize = 'default', bindRef, hideBtns = [], defaultTimeButton = 'hour' } = props
  const [timeButton, setTimeButton] = useState(initialTimeButton || '');
  const [datePickerValue, setDatePickerValue] = useState<RangeValue>(initialDatePickerValue || [null, null]);
  useEffect(() => {
    if (bindRef) {
      bindRef({ reset });
    }
  }, [bindRef])
  // 根据选择的时间范围计算开始和结束时间
  const calculateTimeRange = (curBtn: TimeRangeButton) => {
    const currentSecond = Math.floor(Date.now() / 1000); // 当前秒级时间戳
    let startMin = currentSecond - 60 * 60
    switch (curBtn) {
      case 'hour': {
        startMin = currentSecond - 60 * 60
        break
      }
      case 'day': {
        startMin = currentSecond - 24 * 60 * 60
        break
      }
      case 'threeDays': {
        startMin =
          Math.floor(new Date().setHours(0, 0, 0, 0) / 1000) -
          2 * 24 * 60 * 60
        break
      }
      case 'sevenDays': {
        startMin =
          Math.floor(new Date().setHours(0, 0, 0, 0) / 1000) -
          6 * 24 * 60 * 60
        break
      }
    }
    if (onTimeRangeChange) {
      onTimeRangeChange({ start: startMin, end: currentSecond });
    }
  };

  // 处理单选按钮的变化
  const handleRadioChange = (e: RadioChangeEvent) => {
    setTimeButton(e.target.value);
    onTimeButtonChange?.(e.target.value)
    setDatePickerValue(null)
    calculateTimeRange(e.target.value);
  };
  const reset = () => {
    setTimeButton(defaultTimeButton)
    calculateTimeRange(defaultTimeButton)
    setDatePickerValue(null)
  }

  // 处理日期选择器的变化
  const handleDatePickerChange = (dates: RangeValue) => {
    setTimeButton(dates ? '' : defaultTimeButton)
    onTimeButtonChange?.(dates ? '' : defaultTimeButton)
    setDatePickerValue(dates);
    if (dates && Array.isArray(dates) && dates.length === 2) {
      const [startDate, endDate] = dates;
      const start = startDate!.startOf('day').unix(); // 开始日期的00:00:00
      const end = endDate!.endOf('day').unix(); // 结束日期的23:59:59
      if (onTimeRangeChange) {
        onTimeRangeChange({ start, end });
      }
    }
    if (!dates) {
      calculateTimeRange(defaultTimeButton)
    }
  };



  const disabledDate: RangePickerProps['disabledDate'] = (current) => {
    // Can not select days before today and today
    return current && current.valueOf() > dayjs().startOf('day').valueOf();
  };

  return (
    <div className="flex flex-nowrap items-center  pt-btnybase mr-btnybase">
      {!hideTitle && <label className={`whitespace-nowrap `}>{$t('时间')}：</label>}
      <Radio.Group className="whitespace-nowrap" value={timeButton} onChange={handleRadioChange} buttonStyle="solid">
        {hideBtns?.length && hideBtns.includes('hour') ? null : <Radio.Button value="hour">{$t('近1小时')}</Radio.Button>}
        {hideBtns?.length && hideBtns.includes('day') ? null : <Radio.Button value="day">{$t('近24小时')}</Radio.Button>}
        {hideBtns?.length && hideBtns.includes('threeDays') ? null : <Radio.Button value="threeDays">{$t('近3天')}</Radio.Button>}
        {hideBtns?.length && hideBtns.includes('sevenDays') ? null : <Radio.Button className="rounded-e-none" value="sevenDays">{$t('近7天')}</Radio.Button>}
      </Radio.Group>
      <DatePicker.RangePicker
        value={datePickerValue}
        className="rounded-s-none ml-[-1px]"
        disabledDate={disabledDate}
        onChange={handleDatePickerChange}
        onOpenChange={(open) => {
          if (!open && datePickerValue && datePickerValue.length > 2) {
            setTimeButton('')
            onTimeButtonChange?.('')
          }
        }}
      />
    </div>
  );
};

export default TimeRangeSelector;