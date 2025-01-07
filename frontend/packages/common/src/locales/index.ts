import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
// i18next-browser-languagedetector插件 这是一个 i18next 语言检测插件，用于检测浏览器中的用户语言，
import crc32 from 'crc/crc32'
import LanguageDetector from 'i18next-browser-languagedetector'
// 引入需要实现国际化的简体、繁体、英文三种数据的json文件
import enUS from 'antd/locale/en_US'
import jaJP from 'antd/locale/ja_JP'
import zhCN from 'antd/locale/zh_CN'
import zhTW from 'antd/locale/zh_TW'
import localEn_US from './scan/en-US.json' // 本地翻译英文文件
import localJa_JP from './scan/ja-JP.json' // 本地翻译英文文件
import localZh_CN from './scan/zh-CN.json' // 本地翻译中文文件
import localZh_TW from './scan/zh-TW.json' // 本地翻译英文文件
// import config from '../../../../i18next-scanner.config.js';

const resources = {
  'zh-CN': {
    translation: localZh_CN,
    ...zhCN
  },
  'en-US': {
    translation: localEn_US,
    ...enUS
  },
  'zh-TW': {
    translation: localZh_TW,
    ...zhTW
  },
  'ja-JP': {
    translation: localJa_JP,
    ...jaJP
  }
}

i18n
  .use(LanguageDetector) // 嗅探当前浏览器语言 zh-CN
  .use(initReactI18next) // 将 i18n 向下传递给 react-i18next
  .init({
    // 初始化
    resources, // 本地多语言数据
    // fallbackLng: config.lang, // 默认当前环境的语言
    detection: {
      caches: ['localStorage', 'sessionStorage', 'cookie']
    }
  })

// --------这里是i18next-scanner新增的配置-------------
export const $t = (key: string, params?: any[]): string => {
  const hashKey = `K${crc32(key).toString(16)}` // 将中文转换成crc32格式去匹配对应的json语言包
  let words = i18n.t(hashKey)
  // const { t } = useTranslation();  // 通过hooks
  // let words = t(hashKey);
  if (words === hashKey) {
    words = key
  }

  // 配置传递参数的场景, 目前仅支持数组，可在此拓展
  if (Array.isArray(params)) {
    const reg = /\((\d)\)/g
    words = words.replace(reg, (a: string, b: number) => {
      return params[b]
    })
  }
  return words
}

export default i18n
