import { STATUS_CODE } from '@common/const/const'
import { usePluginEventHub } from '@common/contexts/PluginEventHubContext'

const urlWhiteList = [/api.example.com\/users/, /api.example2.com\/products/] // 正则白名单

function shouldNotTransform(url: string) {
  return urlWhiteList.some((regex) => regex.test(url))
}

function toCamel(s: string) {
  return s.replace(/(_\w)/g, (k) => k[1].toUpperCase())
}

function toSnake(s: string) {
  return s.replace(/([A-Z])/g, '_$1').toLowerCase()
}

function isObject(obj: unknown) {
  return obj === Object(obj) && !Array.isArray(obj) && typeof obj !== 'function'
}

// 将对象的键从下划线转为驼峰
function keysToCamel(o: unknown, transformKeys: string[]): unknown {
  if (isObject(o)) {
    const n: { [k: string]: unknown } = {}
    Object.keys(o as object).forEach((k) => {
      const newKey = transformKeys.includes(k) ? toCamel(k) : k
      n[newKey] = keysToCamel((o as { [k: string]: unknown })[k], transformKeys)
    })
    return n
  } else if (Array.isArray(o)) {
    return o.map((i) => keysToCamel(i, transformKeys))
  }
  return o
}

// 将对象的键从驼峰转为下划线
function keysToSnake(o: unknown, transformKeys: string[]): unknown {
  if (isObject(o)) {
    const n: { [k: string]: unknown } = {}
    Object.keys(o as object).forEach((k) => {
      const newKey = transformKeys.includes(k) ? toSnake(k) : k
      n[newKey] = keysToSnake((o as { [k: string]: unknown })[k], transformKeys)
    })
    return n
  } else if (Array.isArray(o)) {
    return o.map((i) => keysToSnake(i, transformKeys))
  }
  return o
}

// 将查询字符串的键从驼峰转换为下划线
function convertQueryParamsToSnake(
  params: { [k: string]: unknown },
  shouldTransformKeys: boolean,
  transformKeys: string[]
) {
  const newParams = new URLSearchParams()

  for (const key in params) {
    if (shouldTransformKeys && transformKeys?.includes(key)) {
      const newKey = toSnake(key)
      const value = params[key]
      appendParam(newParams, newKey, value as Array<string> | string)
    } else {
      appendParam(newParams, key, params[key] as Array<string> | string)
    }
  }

  return newParams
}

function appendParam(params: URLSearchParams, key: string, value: Array<string> | string) {
  if (value !== undefined && value !== null) {
    if (Array.isArray(value)) {
      value.forEach((item) => params.append(key, item))
    } else {
      params.append(key, value as string)
    }
  }
}

function isJsonHttp(headers: Headers | { [k: string]: string }): boolean {
  const contentType = headers instanceof Headers ? headers.get('Content-Type') : headers['Content-Type']
  return contentType?.includes('application/json') ?? false
}

const trimStringValuesInObject = (obj: unknown): unknown => {
  if (typeof obj === 'string') {
    return (obj as string).trim()
  }
  if (Array.isArray(obj)) {
    return obj.map(trimStringValuesInObject)
  }
  if (typeof obj === 'object' && obj !== null) {
    return Object.fromEntries(Object.entries(obj).map(([key, value]) => [key, trimStringValuesInObject(value)]))
  }
  return obj
}

const processQueryParams = (url: string, options: EoRequest, shouldTransformKeys: boolean) => {
  if (options.eoParams) {
    const cleanParams = Object.fromEntries(
      Object.entries(options.eoParams)
        .filter(([, value]) => value !== undefined)
        .map(([key, value]) => [key, typeof value === 'string' ? value.trim() : value])
    )
    const queryParams = convertQueryParamsToSnake(cleanParams, shouldTransformKeys, options.eoTransformKeys as string[])
    const queryString = queryParams.toString()
    url += (url.includes('?') ? '&' : '?') + queryString // 添加查询字符串到URL
  }
  return url
}

const processRequestBody = (options: EoRequest, headers: EoHeaders, shouldTransformKeys: boolean) => {
  let newBody: { [k: string]: unknown } | undefined
  if (shouldTransformKeys && isJsonHttp(headers) && options.eoBody) {
    newBody = keysToSnake(options.eoBody, options.eoTransformKeys as string[]) as { [k: string]: unknown }
  }

  if (isJsonHttp(headers) && (newBody || options.eoBody)) {
    options.body = JSON.stringify(trimStringValuesInObject(newBody || options.eoBody))
  }
  return options.body
}

const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  namespace: 'default'
}

type EoRequest = RequestInit & {
  eoParams?: { [k: string]: unknown }
  eoTransformKeys?: string[]
  eoApiPrefix?: string
  eoBody?: { [k: string]: unknown } | Array<unknown> | string
}

type EoHeaders = Headers | { [k: string]: string }

export function useFetch() {
  // plugin cannot use usePluginEventHub directly, so we need to pass it as a parameter
  const pluginEventHub = usePluginEventHub()

  function fetchData<T>(url: string, options: EoRequest) {
    // 合并传入的headers与默认headers
    const headers = { ...(options.body ? {} : DEFAULT_HEADERS), ...options.headers }

    // 检查是否需要转换键
    const shouldTransformKeys =
      !shouldNotTransform(url) && options?.eoTransformKeys && options?.eoTransformKeys?.length > 0

    // 处理URL查询参数
    url = processQueryParams(url, options, !!shouldTransformKeys)

    // 处理请求体, 当请求头为json时，fetch的body应当是json字符串
    options.body = processRequestBody(options, headers as EoHeaders, !!shouldTransformKeys)
    // 全局请求前拦截
    const finalOptions = {
      ...(options || {}),
      headers: {
        ...headers
        // Authorization: 'Bearer your-token', // 示例：添加统一的Token认证
      }
    }

    return fetch(`${options?.eoApiPrefix === undefined ? '/api/v1/' : options.eoApiPrefix}${url}`, finalOptions)
      .then(async (response) => {
        if (response.status === STATUS_CODE.UNANTHORIZED) {
          // 处理401未登录的逻辑，比如跳转到登录页面或弹出登录框
          console.log('Unauthorized access, redirecting to login...')
          window.location.href = '/login' // 示例：重定向到登录

          return // 返回或抛出错误，确保不继续执行后续的响应处理
        }

        if (response.status === STATUS_CODE.FORBIDDEN) {
          // 处理403无权限，比如跳转到登录页面或弹出登录框
          console.log('Unauthorized access, redirecting to login...')
          // window.location.href = '/login' // 示例：重定向到登录

          return // 返回或抛出错误，确保不继续执行后续的响应处理
        }

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        // 如果响应体为JSON且指定了转换键，则转换响应数据
        if (isJsonHttp(response.headers)) {
          const data = await response.json()
          const newData = (await pluginEventHub.emit('httpResponse', { data, continue: true })) as Response
          return shouldTransformKeys ? (keysToCamel(newData, options.eoTransformKeys as string[]) as T) : data
        }

        return response
      })
      .catch((error) => {
        // 全局错误处理
        console.error('Global error handler:', error)
        throw error // 可选择重新抛出错误，让组件处理或显示错误信息
      })
  }
  return { fetchData }
}
