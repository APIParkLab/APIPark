// 导入echarts核心模块
import * as echarts from 'echarts/core'
// 导入主题JSON
import themeJson from './apipark-chart-palette.json'

// 全局注册主题
export function registerApiparkTheme() {
  echarts.registerTheme('apipark', themeJson)
}

// 导出主题名称，方便组件使用
export const THEME_NAME = 'apipark'
