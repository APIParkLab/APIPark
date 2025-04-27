export type BarData = {
  title: string
  value: string
  date: string[]
  data: any[]
}
export const setBarChartInfoData = ({ title, value, data, date }: BarData) => {
  // 首先获取所有的键名（假设所有对象的键名都一样）
  if (data.length === 0) {
    return {
      title,
      value,
      date,
      data: []
    }
  }
  if (typeof data[0] !== 'object') {
    return {
      title,
      value,
      date,
      data
    }
  }
  // 从第一个对象中获取所有键名
  const keys = Object.keys(data[0])
  // 定义颜色映射
  const colorMap: Record<string, string> = {
    '2xx': '#7EC26A',
    '4xx': '#F2CF59',
    '5xx': '#F17975',
    '200': '#7EC26A',
    '400': '#F2CF59',
    '500': '#F17975'
  }

  // 为每个键创建一个数据集
  const transformedData = keys.map((key, index) => {
    // 为没有映射颜色的键生成随机颜色
    const color =
      colorMap[key] ||
      `#${Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, '0')}`

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
    data: transformedData
  }
}
