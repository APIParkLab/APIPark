import TimeRangeSelector, { RangeValue, TimeRange } from '@common/components/aoplatform/TimeRangeSelector'
import { useState } from 'react'

export type TimeOption = '' | 'hour' | 'day' | 'threeDays' | 'sevenDays'
const DateSelectFilter = ({
  selectCallback,
  defaultTime,
  customClassNames
}: {
  selectCallback: (timeRange: TimeRange) => void
  defaultTime: TimeOption
  customClassNames?: string
}) => {
  /** 默认时间 */
  const [timeButton, setTimeButton] = useState<TimeOption>(defaultTime || 'hour')
  /** 日期选择 */
  const [datePickerValue, setDatePickerValue] = useState<RangeValue>()
  /** 时间范围变化 */
  const handleTimeRangeChange = (timeRange: TimeRange) => {
    selectCallback(timeRange)
  }

  return (
    <div>
      <TimeRangeSelector
        labelSize="small"
        customClassNames={customClassNames}
        initialTimeButton={timeButton}
        onTimeButtonChange={setTimeButton}
        initialDatePickerValue={datePickerValue}
        onTimeRangeChange={handleTimeRangeChange}
      />
    </div>
  )
}

export default DateSelectFilter
