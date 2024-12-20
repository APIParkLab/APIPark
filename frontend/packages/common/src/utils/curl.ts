/**
 * Author: wisenchen
 */
export type ParseCurlResult = {
  /* 请求地址 */
  url: string
  /* 请求方法 */
  method: string
  /* 请求头部字段 */
  headers: { [key: string]: string }
  /* 请求 query 参数 */
  query?: { [key: string]: string }
  /* 请求内容类型 */
  contentType?: string
  /* 请求 body 原文 */
  body?: string
  /*  如果是 formData 会解析成对象  */
  requestParams?: { [key: string]: unknown } | string
}
/* parse curl  */

// Forbidden_header_name list https://developer.mozilla.org/en-US/docs/Glossary/Forbidden_header_name
const disabledFiledList = [
  'Accept',
  'Accept-Charset',
  'Accept-Encoding',
  'Access-Control-Request-Headers',
  'Access-Control-Request-Method',
  'Accept-Language',
  'Connection',
  'Content-Length',
  // 'Cookie', cookie 需要保留
  'Date',
  'DNT',
  'Expect',
  'Host',
  'Keep-Alive',
  'Origin',
  'Permissions-Policy',
  /^Proxy-/i,
  /^Sec-/i,
  'Referer',
  'TE',
  'Trailer',
  'Transfer-Encoding',
  'Upgrade',
  'Via',
  'User-Agent'
]

export class ParseCurl {
  private curlStr: string
  /* 解析后的对象 */
  private parseObj: ParseCurlResult = {
    url: '',
    method: '',
    query: {},
    headers: {},
    contentType: '',
    body: ''
  }

  private options = {
    /**
     * 忽略浏览器中禁止修改的 header
     * 参考 https://developer.mozilla.org/en-US/docs/Glossary/Forbidden_header_name
     */
    ignoreDisabledHeaders: false
  }
  /**
   * @param curlStr curl 字符串
   * @param options 配置项
   */
  constructor(
    curlStr: string,
    options?: {
      ignoreDisabledHeaders: boolean
    }
  ) {
    this.curlStr = curlStr
    this.options = options || this.options
    this.validateCurl()
    this.parseCurl()
    this.ignoreDisabledHeader()
    this.resetMethods()
    this.parseObj.requestParams = this.getRequestBody2json()
  }

  /** 基础校验，验证 curl 字符串的合法性 */
  validateCurl(): string | void {
    if (!this.curlStr || typeof this.curlStr !== 'string') {
      throw `curl 字符串为空或不是字符串`
    }
    const trimmedCurl = this.curlStr.trim()
    if (!trimmedCurl.toLowerCase().startsWith('curl')) {
      throw `不是以 curl 开头的字符串`
    }
  }
  /**
   * 解析 curl 字符串后获取到的 body 参数
   */
  getParseBody() {
    return this.parseObj.requestParams
  }
  /**
   * 获取请求参数类型 formData json 等
   */
  getBodyType() {
    return this.parseObj.contentType
  }
  /**
   * 解析 curl 字符串后获取到的 header 参数
   */
  getParseHeader() {
    return this.parseObj.headers
  }

  /**
   * 获取解析后的完整结果
   */
  getParseResult() {
    return this.parseObj
  }

  /* 获取解析后的请求 url  */
  getParseUrl() {
    return this.parseObj.url
  }
  /* 获取解析后的请求 url  */
  getParseMethod() {
    return this.parseObj.method
  }
  /* 获取解析后的请求 query */
  getParseQuery() {
    return this.parseObj.query
  }
  /**
   * 重置 methods， 由于像浏览器里中复制的 curl 字符串，可能不会存在 -X  或者 --request 参数，导致无法获取到 method 所以这里只能根据上下文推断
   */
  resetMethods() {
    // 如果已经获取到 method 不需要再推断
    if (this.parseObj.method) {
      return
    }
    if (this.parseObj.body) {
      // 存在请求参数推断为 post 请求
      this.parseObj.method = 'POST'
      return
    }
    // 默认为 GET
    this.parseObj.method = 'GET'
  }
  parseCurl() {
    const result = this.parseObj
    // 零宽空格（zero-width space） 需要去除掉
    this.curlStr = this.curlStr.replace(/\u200B/g, '')
    const args = rewrite(split(this.curlStr))
    let state = ''
    args.forEach((arg: string) => {
      switch (true) {
        case isURL(arg):
          this.parseObj.url = arg
          this.parseObj.query = parseUrl2QueryParams(arg)
          break

        case arg === '-A' || arg === '--user-agent':
          state = 'user-agent'
          break

        case arg === '-H' || arg === '--header':
          state = 'header'
          break

        // 请求体
        case ['-d', '--data', '--data-ascii', '--data-raw', '--data-binary', '--data-urlencode'].includes(arg):
          state = 'data'
          break

        case arg === '-u' || arg === '--user':
          state = 'user'
          break

        case arg === '-I' || arg === '--head':
          result.method = 'HEAD'
          break

        case arg === '-X' || arg === '--request':
          state = 'method'
          break

        case arg === '-b' || arg === '--cookie':
          state = 'cookie'
          break

        case arg === '--compressed':
          result.headers['Accept-Encoding'] = result.headers['Accept-Encoding'] || 'deflate, gzip'
          break

        /**
         * State handler
         */
        case !!arg:
          switch (state) {
            case 'header': {
              const field = parseField(arg)
              result.headers[field[0]] = field[1]
              state = ''
              break
            }
            case 'user-agent':
              result.headers['User-Agent'] = arg
              state = ''
              break
            case 'data':
              if (result.method === 'GET' || result.method === 'HEAD') result.method = 'POST'

              if (!result.headers['content-Type'] && !result.headers['Content-Type']) {
                result.headers['content-type'] =
                  result.headers['Content-Type'] ||
                  result.headers['content-type'] ||
                  'application/x-www-form-urlencoded'
              }
              result.body = result.body ? `${result.body}&${arg}` : arg.replace(/^\$/, '')
              state = ''
              break
            case 'user':
              result.headers['Authorization'] = `Basic ${btoa(arg)}`
              state = ''
              break
            case 'method':
              result.method = arg
              state = ''
              break
            case 'cookie':
              result.headers['Set-Cookie'] = arg
              state = ''
              break
          }
          break
      }
    })
    result.headers['Content-Type'] = result.headers['Content-Type'] || result.headers['content-type'] || ''
    delete result.headers['content-type']
    result.contentType = result.headers['Content-Type']
    if (result.contentType.includes('multipart/form-data')) {
      result.contentType = 'multipart/form-data'
      result.headers['Content-Type'] = 'multipart/form-data'
    }
    this.parseObj = result
  }

  getRequestBody2json() {
    if (!this.parseObj.body) {
      return
    }
    // const reg = /Content-Disposition: form-data; name=(\^\^.*?\^\^)[\s\S]+?\^([\s\S]+?)\^/g
    // const reg = /Content-Disposition: form-data; name=\^\^(.*?)\^\^[\s\S]+?\^\s(\S+?)\^/g // 匹配 cmd curl
    /**
     * 这个正则需要兼容 cmd 和 bash 两种格式的 multipart/form-data 参数
     */

    const contentType = this.parseObj.contentType || ''
    const body = this.parseObj.body

    if (contentType.includes('multipart/form-data')) {
      // 匹配 multipart/form-data 参数的正则表达式
      // 这个正则需要兼容 cmd 和 bash 两种格式的 multipart/form-data 参数
      // const matchMultipartFormDataReg =
      //   /Content-Disposition: form-data; name=[\^"]*(.*?)[\^";]+[\\r\\n\^\s;]{0,16}(.*?)[\^\s\\n\\r]+(------)?/g

      const requestParams: { [key: string]: unknown } = body
        .split(/[\\r\\n\s]*------WebKitForm\w+[\\r\\n\s]*/g)
        .filter((str) => str.includes('name="'))
        .reduce((prev, curr) => {
          const [, key, value] = curr.match(/[\\r\\n\s]*name="([^"]+)";?[\\r\\n\s]*(.*)/) || []
          return Object.assign({}, prev, {
            [key]: value.includes('filename=') ? { type: 'file' } : decodeURIComponent(value)
          })
        }, {})

      // 将解析得到的请求参数存入解析对象
      return requestParams
    }

    if (contentType.includes('application/x-www-form-urlencoded')) {
      // 解析 application/x-www-form-urlencoded 类型的参数
      const formDataParams = decodeURIComponent(body.replace(/\^/g, ''))
      return parseUrl2QueryParams(formDataParams, false)
    }

    if (contentType.includes('application/json')) {
      // 解析 application/json 类型的参数
      return body.replace(/\^\^/g, '"').replace(/\^({|})/g, '$1')
    }

    // 默认情况下，直接使用 body 作为请求参数
    // 如果没有匹配到特定的内容类型，将 body 视为请求参数
    return body
  }

  /**
   * 过滤掉一些不需要的请求头
   */
  ignoreDisabledHeader() {
    if (this.options.ignoreDisabledHeaders) {
      for (const headerKey in this.parseObj.headers) {
        const isDisabledHeader = disabledFiledList.some((key) =>
          typeof key === 'string' ? headerKey.toLowerCase() === key.toLowerCase() : key.test(headerKey)
        )
        if (isDisabledHeader) {
          delete this.parseObj.headers[headerKey]
        }
      }
    }
  }
}

/**
 * Rewrite args for special cases such as -XPUT.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rewrite(args: any[]) {
  return args.reduce(function (args, a) {
    if (0 === a.indexOf('-X')) {
      args.push('-X')
      args.push(a.slice(2))
    } else {
      args.push(a)
    }

    return args
  }, [])
}

/**
 * Parse header field.
 */

function parseField(s: string) {
  return s.split(/: (.+)/)
}

/**
 * Check if `s` looks like a url.
 */

function isURL(s: string) {
  try {
    const URLObj = new URL(s.trim())
    if (!URLObj.hostname) return false
    return true
  } catch (e) {
    return false
  }
}
const parseUrl2QueryParams = (url: string, isCompleteUrl = true) => {
  const index = url.indexOf('?')
  if (index === -1 && isCompleteUrl) {
    return {}
  }
  const queryStr = url.substring(index + 1)
  const queryParamsArr = queryStr.split('&')
  const res: { [key: string]: string } = {}
  for (const item of queryParamsArr) {
    const [key, value] = item.split('=')
    res[key] = value
  }
  return res
}
// https://github.com/jimmycuadra/shellwords/blob/main/src/shellwords.ts
const scan = (string: string, pattern: RegExp, callback: (match: RegExpMatchArray) => void) => {
  let result = ''

  while (string.length > 0) {
    const match = string.match(pattern)

    if (match && match.index != null && match[0] != null) {
      result += string.slice(0, match.index)
      result += callback(match)
      string = string.slice(match.index + match[0].length)
    } else {
      result += string
      string = ''
    }
  }

  return result
}
/**
 * Splits a string into an array of tokens in the same way the UNIX Bourne shell does.
 *  https://github.com/jimmycuadra/shellwords/blob/main/src/shellwords.ts
 * @param line A string to split.
 * @returns An array of the split tokens.
 */
const split = (line = '') => {
  const words = []
  let field = ''
  scan(line, /\s*(?:([^\s\\'"]+)|'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)"|(\\.?)|(\S))(\s|$)?/, (match) => {
    const [, word, sq, dq, escape, garbage, separator] = match

    if (garbage != null) {
      throw new Error(`Unmatched quote: ${line}`)
    }

    if (word) {
      field += word
    } else {
      let addition

      if (sq) {
        addition = sq
      } else if (dq) {
        addition = dq
      } else if (escape) {
        addition = escape
      }

      if (addition) {
        field += addition.replace(/\\(?=.)/, '')
      }
    }

    if (separator != null) {
      words.push(field)
      field = ''
    }
  })

  if (field) {
    words.push(field)
  }

  return words
}
