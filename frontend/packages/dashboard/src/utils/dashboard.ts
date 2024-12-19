import { RangeValue } from '@common/components/aoplatform/TimeRangeSelector'
import { $t } from '@common/locales'

export function getTime(
  timeButton: string,
  datePickerValue: RangeValue | [],
  init?: boolean
): { startTime: number; endTime: number } {
  const currentSecond = new Date().getTime() // 当前毫秒数时间戳
  let currentMin = currentSecond - (currentSecond % (60 * 1000)) // 当前分钟数时间戳
  let startMin = currentMin - 60 * 60 * 1000
  if (!init && timeButton) {
    switch (timeButton) {
      case 'hour': {
        startMin = currentMin - 60 * 60 * 1000
        break
      }
      case 'day': {
        startMin = currentMin - 24 * 60 * 60 * 1000
        break
      }
      case 'threeDays': {
        startMin = new Date(new Date().setHours(0, 0, 0, 0)).getTime() - 2 * 24 * 60 * 60 * 1000
        break
      }
      case 'sevenDays': {
        startMin = new Date(new Date().setHours(0, 0, 0, 0)).getTime() - 6 * 24 * 60 * 60 * 1000
        break
      }
    }
  } else if (datePickerValue?.length === 2) {
    startMin = datePickerValue[0]!.startOf('day').unix()
    currentMin = datePickerValue[1]!.endOf('day').unix()
  }

  return { startTime: startMin / 1000, endTime: currentMin / 1000 }
}

export function getTimeUnit(timeInterval: string): string {
  let timeUnit = ''
  // 相差秒数
  switch (timeInterval) {
    case '1m': {
      timeUnit = '每分钟'
      break
    }
    case '5m': {
      timeUnit = '每5分钟'
      break
    }
    case '1h': {
      timeUnit = '每小时'
      break
    }
    case '1d': {
      timeUnit = '每天'
      break
    }
    case '1w': {
      timeUnit = '每周'
      break
    }
  }
  return timeUnit
}

// 当数据超过10万时，保留两个小数点，单位为万，如123212，显示12.32万；
export function changeNumberUnit(value?: number): { value: string; unit: string } {
  if (value && value > 1000000000) {
    return { value: (value && value / 100000000).toFixed(2), unit: '亿' }
  } else if (value && value > 1000000) {
    return { value: (value && value / 10000).toFixed(0), unit: '万' }
  } else if (value && value > 10000) {
    return { value: (value && value / 10000).toFixed(2), unit: '万' }
  }
  return { value: (value ?? '-') + '', unit: ' 次' }
}

export function yUnitFormatter(value: number): string {
  let res: string = ''
  if (value > 100000000) {
    res = (value / 100000000).toFixed(2) + $t('亿')
  } else if (value > 1000000) {
    res = (value / 10000).toFixed(0) + $t('万')
  } else if (value > 100000) {
    res = (value / 10000).toFixed(2) + $t('万')
  } else {
    res = value.toFixed(0)
  }
  return res
}
