// 导入主题配置
import themeJson from './apipark-chart-palette.json'

// 导出主题配置
export const apiparkTheme = themeJson

// 导出颜色列表，方便单独使用
export const chartColors = themeJson.color

// 导出默认颜色
export const defaultColor = chartColors[0]
