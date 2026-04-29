import { Random } from 'mockjs'
import {
  PARAM_KEY_REF_TYPE,
  PARAM_LIST_TYPE,
  PARAM_LIS_ITEM_TYPE,
  PARAM_TYPE,
  PARAM_TYPE_REF_TYPE
} from './code-snippets.type'
const DEFAULT_PARAM_KEY_REF: PARAM_KEY_REF_TYPE = {
  key: 'key',
  type: 'type',
  value: 'value'
}

/**
 * 将自定义列表转换为 xml
 * @param list 列表
 * @param keyRefs 关键词映射
 * @param random 是否随机值
 * @returns xml 字符串
 */
export function tranformXml(
  list: PARAM_LIST_TYPE,
  keyRefs: PARAM_KEY_REF_TYPE = DEFAULT_PARAM_KEY_REF,
  typeRefs: PARAM_TYPE_REF_TYPE = {},
  random: boolean = false,
  root: boolean = true,
  parent?: boolean
) {
  const { key, attribute, value, childKey, filter, type, arrayItemKey } = keyRefs
  let result: string = root ? '<?xml version="1.0" encoding="UTF-8" ?>' : ''
  list.forEach((item: unknown) => {
    if (filter && item[filter]) return
    const tab: string = item[key]
    if (!tab) return
    const itemType: PARAM_TYPE = typeRefs[item[type]]
    let text: string = ''
    if (['array', 'object'].includes(itemType) && childKey && item[childKey]) {
      //存在子层级
      text = tranformXml(item[childKey], keyRefs, typeRefs, random, false, itemType === 'array')
    } else {
      text = random === true ? getRandomDataByType(itemType) : item[value]
    }
    if (arrayItemKey && item[arrayItemKey]) {
      result += `${text}`
    } else {
      result += `<${tab}${attribute && item[attribute] ? ` ${item[attribute]}` : ''}>${text}</${tab}>`
    }
  })
  return result
}
export function tranformJson(
  list: PARAM_LIST_TYPE,
  keyRefs: PARAM_KEY_REF_TYPE = DEFAULT_PARAM_KEY_REF,
  typeRefs: PARAM_TYPE_REF_TYPE = {},
  random: boolean = false,
  parent?: boolean
) {
  const { key, value, childKey, type, filter, arrayItemKey } = keyRefs
  const result: string[] = []
  list.forEach((item: PARAM_LIS_ITEM_TYPE) => {
    if (filter && item[filter]) return
    const tab: string = item[key]
    if (!tab) return
    const itemType: PARAM_TYPE = typeRefs[item[type]]
    let text: string = ''
    if (['array', 'object'].includes(itemType) && childKey && item[childKey]) {
      //存在子层级
      text = tranformJson(item[childKey], keyRefs, typeRefs, random, itemType === 'array')
    } else {
      text = random === true ? getRandomDataByType(itemType) : item[value]
      //将所有内容都转成字符串，用于后面注入
      if (typeof text === 'undefined') text = '' //用于兼容边界数据
      if (itemType === 'string') text = JSON.stringify(text)
    }
    if (arrayItemKey && item[arrayItemKey]) result.push(`${text}`)
    else result.push(`"${tab}":${text}`)
  })
  if (parent) return `[${result.join(',')}]`
  return `{${result.join(',')}}`
}

/**
 * 将自定义列表转换为地址栏参数
 * @param list 列表
 * @param keyRefs 关键词映射
 * @param random 是否随机值
 * @returns key-value 结构字符串
 */
export function tranformUrlParam(
  list: PARAM_LIST_TYPE,
  keyRefs: PARAM_KEY_REF_TYPE = DEFAULT_PARAM_KEY_REF,
  typeRefs: PARAM_TYPE_REF_TYPE = {},
  random: boolean = false
) {
  const { key, value, filter, type } = keyRefs
  const result: string[] = []
  list.forEach((item: unknown) => {
    if (filter && item[filter]) return
    const tab: string = item[key]
    if (!tab) return
    const itemType: PARAM_TYPE = typeRefs[item[type]]

    const text: string = random === true ? getRandomDataByType(itemType) : item[value]
    result.push(`${tab}=${text}`)
  })
  return result.join('&') //分隔符为&
}
/**
 * 将自定义列表转换为 key-value 结构
 * @param list 列表
 * @param keyRefs 关键词映射
 * @param random 是否随机值
 * @returns
 */
export function tranformKeyValue(
  list: PARAM_LIST_TYPE,
  keyRefs: PARAM_KEY_REF_TYPE = DEFAULT_PARAM_KEY_REF,
  typeRefs: PARAM_TYPE_REF_TYPE = {},
  random: boolean = false
) {
  const { key, value, filter, type } = keyRefs
  const result: string[] = []
  list.forEach((item: unknown) => {
    if (filter && item[filter]) return
    const tab: string = item[key]
    if (!tab) return
    const itemType: PARAM_TYPE = typeRefs[item[type]]

    const text: string = random === true ? getRandomDataByType(itemType) : item[value]
    result.push(`${tab}:${text}`)
  })
  return result.join('\n') //分隔符会换行
}
export function getRandomDataByType(type: PARAM_TYPE) {
  return Random[Object.keys(Random).includes(type) ? type : 'string'](0, 5)
}
