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

/**
 * 格式化数字并添加适当的单位后缀
 * 根据数字大小自动选择合适的单位：
 * - 小于1000：原始数字
 * - 千级别(K): 1,000 - 999,999
 * - 百万级别(M): 1,000,000 - 999,999,999
 * - 十亿级别(B): 1,000,000,000 - 999,999,999,999
 * - 万亿级别(T): 1,000,000,000,000及以上
 * @param count 需要格式化的数字
 * @returns 格式化后的字符串，包含单位
 */
export function formatNumberWithUnit(count: number) {
  if (count < 1000) {
    return count.toString() // 小于1000直接返回
  } else if (count < 1_000_000) {
    return (count / 1000).toFixed(1) + 'K' // 千级别，如1.5K
  } else if (count < 1_000_000_000) {
    return (count / 1_000_000).toFixed(1) + 'M' // 百万级别，如2.3M
  } else if (count < 1_000_000_000_000) {
    return (count / 1_000_000_000).toFixed(1) + 'B' // 十亿级别，如4.5B
  } else {
    return (count / 1_000_000_000_000).toFixed(1) + 'T' // 万亿级别，如7.8T
  }
}

/**
 * 格式化浮点数并缩写为带单位的形式
 * 与 formatNumberWithUnit 类似，但对小于1000的数字也进行保留1位小数的格式化
 * - 小于1000：保留1位小数
 * - 千级别(K): 1,000 - 999,999
 * - 百万级别(M): 1,000,000 - 999,999,999
 * - 十亿级别(B): 1,000,000,000 - 999,999,999,999
 * - 万亿级别(T): 1,000,000,000,000及以上
 * @param count 需要格式化的数字
 * @returns 格式化后的字符串，包含单位
 */
export function abbreviateFloat(count: number) {
  if (count < 1000) {
    return count.toFixed(1) // 小于1000的数字保留1位小数，如5.0
  } else if (count < 1_000_000) {
    return (count / 1000).toFixed(1) + 'K' // 千级别，如1.5K
  } else if (count < 1_000_000_000) {
    return (count / 1_000_000).toFixed(1) + 'M' // 百万级别，如2.3M
  } else if (count < 1_000_000_000_000) {
    return (count / 1_000_000_000).toFixed(1) + 'B' // 十亿级别，如4.5B
  } else {
    return (count / 1_000_000_000_000).toFixed(1) + 'T' // 万亿级别，如7.8T
  }
}

/**
 * 格式化时间持续时间，自动选择合适的时间单位
 * 根据持续时间的长度自动选择不同的单位：
 * - 毫秒(ms): < 1000
 * - 秒(s): 1,000 - 999,999
 * - 分钟(min): 1,000,000 - 999,999,999
 * - 小时(hour): 1,000,000,000 - 999,999,999,999
 * - 天(day): ≥ 1,000,000,000,000
 * @param durationNano 时间持续时间数值
 * @returns 格式化后的字符串，包含单位
 */
export function formatDuration(durationNano: number) {
  if (durationNano < 1000) {
    return `${durationNano}ms` // 小于1000，返回毫秒
  }
  if (durationNano < 1_000_000) {
    return (durationNano / 1000).toFixed(1) + 's' // 转换为秒
  }
  if (durationNano < 1_000_000_000) {
    return (durationNano / 1_000_000).toFixed(1) + 'min' // 转换为分钟
  }
  if (durationNano < 1_000_000_000_000) {
    return (durationNano / 1_000_000_000).toFixed(1) + 'hour' // 转换为小时
  }
  return (durationNano / 1_000_000_000_000).toFixed(1) + 'day' // 转换为天
}

/**
 * 格式化数据大小，自动选择合适的单位
 * 根据字节数自动选择适当的单位进行显示：
 * - 字节(B): < 1000
 * - 千字节(KB): 1,000 - 999,999
 * - 兆字节(MB): 1,000,000 - 999,999,999
 * - 吉字节(GB): 1,000,000,000 - 999,999,999,999
 * - 太字节(TB): 1,000,000,000,000 - 999,999,999,999,999
 * - 拉字节(PB): ≥ 1,000,000,000,000,000
 * @param bytes 字节数
 * @returns 格式化后的字符串，包含单位
 */
export function formatBytes(bytes: number) {
  const KB = 1000 // 千字节
  const MB = KB * 1000 // 兆字节
  const GB = MB * 1000 // 吉字节
  const TB = GB * 1000 // 太字节
  const PB = TB * 1000 // 拉字节

  if (bytes < KB) {
    return `${bytes}B` // 直接显示字节
  } else if (bytes < MB) {
    return (bytes / KB).toFixed(1) + 'KB' // 转换为千字节
  } else if (bytes < GB) {
    return (bytes / MB).toFixed(1) + 'MB' // 转换为兆字节
  } else if (bytes < TB) {
    return (bytes / GB).toFixed(1) + 'GB' // 转换为吉字节
  } else if (bytes < PB) {
    return (bytes / TB).toFixed(1) + 'TB' // 转换为太字节
  } else {
    return (bytes / PB).toFixed(1) + 'PB' // 转换为拉字节
  }
}
