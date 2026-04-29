export type BarData = {
  title: string
  value?: string
  date: string[]
  data: any[]
  showXAxis?: boolean
}
export const setBarChartInfoData = ({ title, value, data, date, showXAxis }: BarData) => {
  // 首先获取所有的键名（假设所有对象的键名都一样）
  if (data.length === 0) {
    return {
      title,
      value,
      date,
      data: [],
      showXAxis: !!showXAxis
    }
  }
  if (typeof data[0] !== 'object') {
    return {
      title,
      value,
      date,
      data,
      showXAxis: !!showXAxis
    }
  }
  // 从第一个对象中获取所有键名
  const keys = Object.keys(data[0])
  // 定义颜色映射
  const colorMap: Record<string, string> = {
    '2xx': '#3ba272',
    '4xx': '#ffc404',
    '5xx': '#b92325'
  }

  // 为每个键创建一个数据集
  const transformedData = keys.map((key) => {
    // 为没有映射颜色的键生成随机颜色
    const color = colorMap[key]

    return {
      name: key,
      color: color,
      value: data.map((item) => item[key])
    }
  })
  return {
    title,
    value,
    date,
    data: transformedData,
    showXAxis: !!showXAxis
  }
}
