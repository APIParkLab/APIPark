import { cloneDeep } from 'lodash-es'
import { PARAM_KEY_REF_TYPE, PARAM_TYPE_REF_TYPE } from './code-snippets.type'
import { tranformJson, tranformXml } from './util'
type LANG_TYPE = 'Java' | 'HTTP' | 'shellHttpie' | 'go' | 'NodeJSNative'
type PARAM_HEADER_TYPE = { name: string; value: string }
type PARSE_OPTS_TYPE = {
  filter?: Function
  map?: Function
  init?: Function
  format?: string
  separator?: string
  hasFileParams?: boolean
  langType?: LANG_TYPE
}
export const paramsJsonType: unknown = {
  STRING: 'string',
  FILE: 'file',
  JSON: 'json',
  INT: 'int',
  FLOAT: 'float',
  DATE: 'date',
  DATETIME: 'datetime',
  BOOLEAN: 'boolean',
  BYTE: 'byte',
  SHORT: 'short',
  LONG: 'long',
  ARRAY: 'array',
  OBJECT: 'object',
  NUMBER: 'number',
  NULL: 'null'
}

/**
 * @description 拼接地址栏query参数，返回url
 * @param  {string} url 地址栏url
 * @param  {Object} query 地址栏query对象
 */
export function transfromUrlParam(url: string, query: { [key: string]: string }) {
  const querys: string[] = []
  Object.entries(query).forEach((item: string[]) => {
    querys.push(`${item[0]}=${item[1]}`)
  })
  if (!querys.length) return url
  return `${url}${url.includes('?') ? '&' : '?'}${querys.join('&')}`
}
export function parseUri(protocol: string, url: string) {
  if (!/((http:\/\/)|(https:\/\/))/.test(url)) {
    url = (protocol == 'HTTPS' ? 'https://' : 'http://') + url
  }
  return url
}

/**
 * @description 处理FormData格式请求参数
 * @param  {Object} options {format:生成Formdata格式[option]，separator:组合字符串的分割符[option]}
 * @param  {Array} params 待拼接数组
 */
export function parseFormData(
  params: unknown,
  { map, init, format, separator, langType, hasFileParams }: PARSE_OPTS_TYPE = {}
) {
  if (map) params = cloneDeep(params)
  if (init) params = init(params)
  if (format) {
    //x-www
    const result: unknown = []
    params.map((val: unknown) => {
      if (map) val = map(val)
      result.push(format.replace('${name}', val.name).replace('${value}', val.value))
    })
    return result.join(separator || '&')
  }
  //multipart
  let result: string = ''
  const boundary: string = 'WebKitFormBoundary7MA4YWxkTrZu0gW'
  params.forEach((val: unknown) => {
    if (map) val = map(val)
    if (val.files) {
      if (val.files.length) {
        result += `------${boundary}\r\n`
        val.files.map((childVal: unknown) => {
          result += `content-disposition: form-data; name="${val.name}"; filename="${val.value}"\r\n`
          if (typeof childVal === 'string') {
            result += `Content-Type: ${((childVal.match(/data:(.*);/) || [])[0] || '')
              .replace(/^data:/, '')
              .replace(/;$/, '')}\r\n`
          } else {
            result += `Content-Type: ${(childVal.dataUrl.match(/data:(.*);/)[0] || '')
              .replace(/^data:/, '')
              .replace(/;$/, '')}\r\n`
          }
          result += '\r\n'
        })
      }
    } else {
      result += `------${boundary}\r\n`
      result += `content-disposition: form-data; name="${val.name}"\r\n`
      result += '\r\n'
      result += `${val.value}\r\n`
    }
  })
  result += `------${boundary}--`
  return result
}
export function parseFileValue(params: unknown[]) {
  const tmp = {
    output: ''
  }
  if (params && params.length) {
    for (let i = 0; i < params.length; i++) {
      if (params[i].data_type === 'file') {
        tmp.output = params[i].value || ''
        break
      }
    }
    return tmp.output
  }
}

export function payloadStr(method: string, headers: unknown[]) {
  let tmpStr = ''
  if (method === 'GET') {
    tmpStr = 'params=payload'
  } else {
    headers.forEach((item) => {
      if (item.name === 'Content-Type') {
        switch (item.description || item.value) {
          case 'application/x-www-form-urlencoded':
            tmpStr = 'data=payload'
            break
          case 'application/json':
            tmpStr = 'data=json.dumps(payload)'
            break
          default: {
            tmpStr = 'params=payload'
          }
        }
      }
    })
  }
  return tmpStr
}

export function goCodeParseFormData(params: unknown[]) {
  if (!params.length) return
  let output = ''
  params.forEach((item) => {
    output += `payload.Set("${item.name}", "${item.value}")\r\n    `
  })
  return output
}
export function parseFileType(fileValue: string) {
  const isPng = fileValue.endsWith('.png')
  const isJpeg = fileValue.endsWith('.jpeg')
  const isJpg = fileValue.endsWith('.jpg')
  let result = 'image/jpeg'
  if (isPng) {
    result = 'image/png'
  } else if (isJpg) {
    result = 'image/jpeg'
  } else if (isJpeg) {
    result = 'image/jpeg'
  }
  return result
}
/**
 * @description 处理请求头格式
 * @param  {Object} options {format:生成请求头格式[option]，separator:组合字符串的分割符[option]}
 * @param  {Array} headers 待拼接数组
 */
export function parseHeaders(headers: PARAM_HEADER_TYPE[], { map, filter, format, separator }: PARSE_OPTS_TYPE = {}) {
  const result = []
  if (map) {
    headers = cloneDeep(headers)
  }
  for (const key in headers) {
    let val = headers[key]
    if (map) {
      val = map(val)
    }
    if (filter) {
      if (filter(val)) {
        result.push(format?.replace('${name}', val.name)?.replace('${value}', val.value))
      }
    } else {
      result.push(format?.replace('${name}', val.name)?.replace('${value}', val.value))
    }
  }
  return result.join(separator || '')
}
const keyRefs: PARAM_KEY_REF_TYPE = {
  key: 'name',
  type: 'data_type',
  value: 'value',
  childKey: 'child_list',
  arrayItemKey: 'isArrItem'
}

const typeRefs: PARAM_TYPE_REF_TYPE = paramsJsonType

export const parseRequestBodyToString = ({ requestType, params, apiRequestParamJsonType, raw }: unknown) => {
  let result: string = ''
  switch ((requestType || 'FORAMDATA').toString()) {
    case 'RAW': {
      //raw
      // todo
      result = raw
      break
    }
    case 'JSON': {
      //json
      if (!params[0]?.hasOwnProperty('value')) keyRefs.value = 'name'
      result = tranformJson(params, keyRefs, typeRefs)
      if (apiRequestParamJsonType === 'ARRAY') {
        //array
        result = `[${result}]`
      }
      break
    }
    case 'XML': {
      //xml
      if (!params[0]?.hasOwnProperty('value')) keyRefs.value = 'name'
      result = tranformXml(params, keyRefs, typeRefs)
      break
    }
  }
  return result
}
