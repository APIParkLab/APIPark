import { cloneDeep } from 'lodash-es'
import { parseFormData, parseFileValue, parseFileType, parseHeaders, parseRequestBodyToString, parseUri, payloadStr, goCodeParseFormData } from './transform'
// import { getJson } from '../.@common/utils/';
import { ApiBodyType } from '@common/const/api-detail';
import { $t } from '@common/locales';

function sameNameToParams(params: unknown) {
  params = cloneDeep(params)
  const output: unknown = []
  const keyMUI: unknown = []
  params.forEach((val: unknown) => {
    const paramIndex = keyMUI.indexOf(val.name)
    if (paramIndex == -1) {
      output.push(val)
      keyMUI.push(val.name)
    } else if (Object.prototype.toString.call(output[paramIndex].value) == '[object Array]') {
      output[paramIndex].value.push(val.value || '')
    } else {
      output[paramIndex].value = [output[paramIndex].value, val.value]
    }
  })
  return output
}
function stringifyParams(val: unknown) {
  val.name = JSON.stringify(val.name)
  val.value = JSON.stringify(val.example || '')
  return val
}
function stringifyHeaders(val: unknown) {
  val.name = JSON.stringify(val.name)
  val.value = JSON.stringify(val.value || '')
  return val
}
function encodeURIComponentParams(val: unknown) {
  val.name = encodeURIComponent(val.name)
  val.value = encodeURIComponent(val.example || '')
  return val
}
function enrichParams(params: unknown) {
  const result = cloneDeep(params)
  result.forEach((val: unknown) => {
    val.valueQuery = []
    let defaultIndex = 0
    val.value_list?.forEach((child: unknown, index: number) => {
      if (child.is_default) defaultIndex = index
      //@ts-ignore
      val.valueQuery.push(child.value)
    })
    val.value = val.example || val.valueQuery[defaultIndex] || val.value || ''
    val.value = val.value === null ? '' : val.value || ''
  })
  return result
}
export function generateCode(
  type: string,
  multipart: boolean,
  { protocol, URL, headers, params, method, requestType, apiRequestParamJsonType, raw }: unknown,
) {
  requestType=ApiBodyType[requestType]
  let code: string = ''
  const indent = '    '
  let urlObj: unknown = {}
  try {
    urlObj = new window.URL(parseUri(protocol, decodeURIComponent(URL)))
  } catch (URL_PARSE_ERROR) {
    urlObj = {
      protocol: 'http',
      href: URL,
      pathname: '',
      search: '',
      host: '',
      searchParams: [],
      hostname: ''
    }
  }

  const requestParam: string = parseRequestBodyToString({
    requestType,
    params,
    apiRequestParamJsonType,
    raw
  })

  const langTmp: unknown = {
    headerStr: '',
    paramsStr: ''
  }
  params = enrichParams(params)
  headers = enrichParams(headers)

  switch (type) {
    // HTTP
    case '1': {
      let nullHost = false
      langTmp.headerStr = parseHeaders(headers, {
        format: '${name}:${value}\r\n'
      })
      switch (requestType || 'FORMDATA') {
        case 'FORMDATA': {
          if (multipart) {
            langTmp.paramsStr = parseFormData(params, {
              langType: 'HTTP',
              map: encodeURIComponentParams
            })
          } else {
            langTmp.paramsStr = parseFormData(params, {
              format: '${name}=${value}',
              separator: '&',
              map: encodeURIComponentParams
            })
          }
          break
        }
        default: {
          langTmp.paramsStr = requestParam || ''
        }
      }
      if (URL === `/${urlObj.host}${urlObj.pathname}` || URL === `/${urlObj.host}`) {
        nullHost = true
      }
      if (multipart) {
        code =
          `${method}  ${nullHost ? `/${urlObj.host}${urlObj.pathname}` : urlObj.pathname || ''}${
            urlObj.search || ''
          } HTTP/1.1\r\n` +
          `Host: ${nullHost ? '' : urlObj.host || ''}\r\n` +
          `${langTmp.headerStr}` +
          'Content-Length: 392\r\n' +
          'Content-Type:  multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW\r\n\r\n' +
          `${langTmp.paramsStr}\r\n`
      } else {
        code =
          `${method}  ${nullHost ? `/${urlObj.host}${urlObj.pathname}` : urlObj.pathname || ''}${
            urlObj.search || ''
          } HTTP/1.1\r\n` +
          `Host: ${nullHost ? '' : urlObj.host || ''}\r\n` +
          `${langTmp.headerStr ? langTmp.headerStr + '\r\n' : ''}` +
          `${langTmp.paramsStr}\r\n`
      }
      break
    }
    // cURL
    case '2': {
      let cookieStr = null
      langTmp.headerStr = parseHeaders(headers, {
        format: "  -H '${name}:${value}'",
        separator: ' \\\r\n',
        filter(header: unknown) {
          if (!multipart) return true
          if ('content-type'.indexOf(header.name.toLowerCase()) === -1) {
            return true
          } else {
            return false
          }
        }
      })
      for (let i = 0; i < headers.length; i++) {
        const { name } = headers[i]
        if (name.toLowerCase() === 'cookie') {
          cookieStr = `  -b ${headers[i].value}`
        }
      }
      switch (requestType || 'FORMDATA') {
        case 'FORMDATA': {
          if (multipart) {
            let tmpOutput: unknown = ''
            params.map((val: unknown) => {
              if (val.data_type === 'file') {
                tmpOutput = `  --form '${val.name}=@"${val.value}"'  \\`
              }
              // if (val.files) {
              //   const filesArr = val.value.split(',')
              //   if (val.files.length) {
              //     val.files.map((childVal: unknown, childKey: unknown) => {
              //       tmpOutput.push(`  -F '${val.name}=@${filesArr[childKey]}'`)
              //     })
              //   }
              // } else {
              //   tmpOutput.push(`  -F '${val.name}=${val.value}'`)
              // }
            })
            langTmp.paramsStr = tmpOutput
          } else {
            const tmpOutput: unknown = parseFormData(params, {
              format: '${name}=${value}',
              separator: '&',
              map: encodeURIComponentParams
            })
            langTmp.paramsStr = tmpOutput ? `  -d '${tmpOutput}'` : ''
          }
          break
        }
        default: {
          langTmp.paramsStr = requestParam ? `  -d '${requestParam}'` : ''
        }
      }
      code =
        `curl -X ${method}  \\\r\n` +
        `${urlObj.href ? `  '${urlObj.href}' \\\r\n` : ''}` +
        `${langTmp.headerStr}` +
        `${cookieStr ? ` \\\r\n${cookieStr}` : ''}` +
        `${langTmp.paramsStr ? ` \\\r\n${langTmp.paramsStr}` : ''}`
      break
    }
    // JavaScript>Jquery AJAX
    case '4': {
      const langTmp: unknown = {
        headerStr: '',
        paramsStr: ''
      }
      langTmp.headerStr = parseHeaders(headers, {
        format: `${indent + indent}\${name}:\${value}`,
        separator: ',\r\n',
        map: stringifyHeaders
      })
      switch (requestType || 'FORMDATA') {
        case 'FORMDATA': {
          if (multipart) {
            langTmp.paramsStr = `var data = new FormData();\r\n${parseFormData(params, {
              format: 'data.append(${name},${value});',
              separator: '\r\n',
              map: stringifyParams
            })}`
          } else {
            langTmp.paramsStr = `var data = {\n${parseFormData(params, {
              format: `${indent}\${name}: \${value}`,
              separator: ',\r\n',
              init: sameNameToParams,
              map: stringifyParams
            })}\r\n}`
          }
          break
        }
        default: {
          langTmp.paramsStr = `var data = ${JSON.stringify(requestParam)}`
        }
      }
      code =
        `${langTmp.paramsStr}\r\n\r\n` +
        '$.ajax({\r\n' +
        `${indent}"url":"${urlObj.href || ''}",\r\n` +
        `${indent}"method": "${method}",\r\n` +
        `${indent}"headers": {\r\n` +
        `${langTmp.headerStr ? `${langTmp.headerStr}\r\n` : ''}` +
        `${indent}},\r\n` +
        `${
          multipart ? `${indent}"processData": false,\r\n${indent}"contentType": false,\r\n` : ''
        }` +
        `${indent}"data": data,\r\n` +
        `${indent}"crossDomain": true\r\n` +
        '})\r\n' +
        `${indent}.done(function(response){})\r\n` +
        `${indent}.fail(function(jqXHR){})\r\n`
      break
    }
    // JavaScript>XHR
    case '5': {
      langTmp.headerStr = parseHeaders(headers, {
        format: 'xhr.setRequestHeader(${name},${value});',
        separator: '\r\n',
        map: stringifyHeaders
      })
      switch (requestType || 'FORMDATA') {
        case 'FORMDATA': {
          if (multipart) {
            langTmp.paramsStr = `var data = new FormData();\r\n${parseFormData(params, {
              format: 'data.append(${name},${value});',
              separator: '\r\n',
              map: stringifyParams
            })}`
          } else {
            langTmp.paramsStr = `var data = ${JSON.stringify(
              parseFormData(params, {
                format: '${name}=${value}',
                separator: '&',
                map: encodeURIComponentParams
              })
            )};`
          }
          break
        }
        default: {
          langTmp.paramsStr = `var data = ${JSON.stringify(requestParam)}`
        }
      }
      code =
        `${langTmp.paramsStr}\r\n\r\n` +
        'var xhr = new XMLHttpRequest();\r\n' +
        'xhr.withCredentials = false;\r\n\r\n' +
        'xhr.addEventListener("readystatechange", function () {\r\n' +
        `${indent}if (this.readyState === 4) {\r\n` +
        `${indent}${indent}console.log(this.responseText);\r\n` +
        `${indent}}\r\n` +
        '});\r\n\r\n' +
        `xhr.open("${method}", "${urlObj.href || ''}");\r\n` +
        `${langTmp.headerStr}\r\n\r\n` +
        'xhr.send(data);'
      break
    }
    // NodeJS>Native
    case '7': {
      langTmp.headerStr = parseHeaders(headers, {
        format: `${indent + indent}\${name}:\${value}`,
        separator: ',\r\n',
        map: stringifyHeaders
      })
      switch (requestType || 'FORMDATA') {
        case 'FORMDATA': {
          if (multipart) {
            langTmp.paramsStr = parseFormData(params, {
              langType: 'NodeJSNative'
            })
          } else {
            langTmp.paramsStr = `qs.stringify({\n${parseFormData(params, {
              format: `${indent + indent}\${name}: \${value}`,
              separator: ',\r\n',
              init: sameNameToParams,
              map: stringifyParams
            })}\r\n})`
          }
          break
        }
        default: {
          langTmp.paramsStr = JSON.stringify(requestParam)
        }
      }
      if (multipart) {
        code =
          'const http = require("http");\r\n' +
          'const fs = require("fs");\r\n' +
          'const path = require("path");\r\n' +
          'const FormData = require("form-data"); \r\n\r\n' +
          `${langTmp.paramsStr}\r\n\r\n` +
          'var requestInfo={\r\n' +
          `${indent}"method": "${method}",\r\n` +
          `${urlObj.hostname ? `${indent}"hostname": "${urlObj.hostname}",\r\n` : ''}` +
          `${
            urlObj.port ? `${indent}"port": "${urlObj.port}",\r\n` : ''
          }` +
          `${
            urlObj.pathname || urlObj.search
              ? `${indent}"path": "${urlObj.pathname || ''}${
                urlObj.search || ''
                }",\r\n`
              : ''
          }` +
          `${indent}"headers": {\r\n` +
          `${langTmp.headerStr ? `${langTmp.headerStr},\r\n` : ''}` +
          '        ...form.getHeaders()\r\n' +
          '   }\r\n' +
          '};\r\n\r\n' +
          'var req = http.request(requestInfo, function (res) {\r\n' +
          `${indent}var chunks = [];\r\n\r\n` +
          `${indent}res.on("data", function (chunk) {\r\n` +
          `${indent}${indent}chunks.push(chunk);\r\n` +
          `${indent}});\r\n\r\n` +
          `${indent}res.on("end", function () {\r\n` +
          `${indent}${indent}var body = Buffer.concat(chunks);\r\n` +
          `${indent}${indent}console.log(body.toString());\r\n` +
          `${indent}});\r\n` +
          '});\r\n\r\n' +
          'form.pipe(req);'
      } else {
        code =
          'var qs = require("querystring");\r\n' +
          `var http = require("${urlObj.protocol.replace(':', '')}");\r\n` +
          'var requestInfo={\r\n' +
          `${indent}"method": "${method}",\r\n` +
          `${
            urlObj.hostname
              ? `${indent}"hostname": "${urlObj.hostname}",\r\n`
              : ''
          }` +
          `${
            urlObj.port ? `${indent}"port": "${urlObj.port}",\r\n` : ''
          }` +
          `${
            urlObj.pathname || urlObj.search
              ? `${indent}"path": "${urlObj.pathname || ''}${
                  urlObj.search || ''
                }",\r\n`
              : ''
          }` +
          `${indent}"headers": {\r\n` +
          `${langTmp.headerStr ? `${langTmp.headerStr}\r\n` : ''}` +
          '   }\r\n' +
          '};\r\n\r\n' +
          'var req = http.request(requestInfo, function (res) {\r\n' +
          `${indent}var chunks = [];\r\n\r\n` +
          `${indent}res.on("data", function (chunk) {\r\n` +
          `${indent}${indent}chunks.push(chunk);\r\n` +
          `${indent}});\r\n\r\n` +
          `${indent}res.on("end", function () {\r\n` +
          `${indent}${indent}var body = Buffer.concat(chunks);\r\n` +
          `${indent}${indent}console.log(body.toString());\r\n` +
          `${indent}});\r\n` +
          '});\r\n\r\n' +
          `req.write(${langTmp.paramsStr});\r\n` +
          'req.end();'
      }
      break
    }
    // NodeJS>Request
    case '8': {
      langTmp.headerStr = parseHeaders(headers, {
        format: '      ${name}:${value}',
        separator: ',\r\n',
        map: stringifyHeaders
      })
      switch (requestType || 'FORMDATA') {
        case 'FORMDATA': {
          if (multipart) {
            langTmp.paramsStr = `   formData: {\r\n${parseFormData(params, {
              format: '      ${name}: ${value}',
              separator: ',\r\n',
              map(val: unknown) {
                if (val.files && val.files.length) {
                  const fileNameArr = val.value.split(',')
                  val.value = `{value:fs.createReadStream(${JSON.stringify(fileNameArr[0])})}`
                } else {
                  val.value = JSON.stringify(val.value)
                }
                val.name = JSON.stringify(val.name)
                return val
              }
            })}\r\n   }`
          } else {
            langTmp.paramsStr = `   form: {\n${parseFormData(params, {
              format: '      ${name}: ${value}',
              separator: ',\r\n',
              init: sameNameToParams,
              map: stringifyParams
            })}\r\n   }`
          }
          break
        }
        default: {
          langTmp.paramsStr = `   body: ${JSON.stringify(requestParam)}`
        }
      }
      code =
        `${
          (requestType || 'FORMDATA') === 'FORMDATA' && multipart
            ? 'var fs = require("fs");\r\n'
            : ''
        }` +
        'var request = require("request");\r\n' +
        'var requestInfo={\r\n' +
        `   method: "${method}",\r\n` +
        `   url: "${urlObj.href}",\r\n` +
        '   headers: {\r\n' +
        `${langTmp.headerStr ? `${langTmp.headerStr}\r\n` : ''}` +
        '   },\r\n' +
        `${langTmp.paramsStr}` +
        '\r\n};\r\n\r\n' +
        'request(requestInfo, function (error, response, body) {\r\n' +
        '    if (error) throw new Error(error);\r\n' +
        '    console.log(body);\r\n' +
        '});'
      break
    }
    // PHP>pecl_http
    case '10': {
      langTmp.headerStr = parseHeaders(headers, {
        format: '  ${name} => ${value}',
        separator: ',\r\n',
        map: stringifyHeaders
      })
      switch (requestType || 'FORMDATA') {
        case 'FORMDATA': {
          if (multipart) {
            params = sameNameToParams(params)
            let tmpOutput: unknown = ''
            params.map((val: unknown, key: number) => {
              if(val.data_type === 'file') {
                tmpOutput +=
                  `  "${val.name}" =>array(\r\n` +
                  `       "type" => "${parseFileType(val.value)}",\r\n` +
                  '       "content" => fopen($file_path, "r"),\r\n' +
                  '       "name" => $file_name,\r\n' +
                  `  )${key === params.length - 1 ? '' : ','}\r\n`
              } else {
                tmpOutput += `  ${JSON.stringify(val.name)} => ${JSON.stringify(val.value)}\r`

              }
            })
            langTmp.paramsStr =
            'addForm(' + `${tmpOutput.length ? `array(\r\n${tmpOutput})` : ''}` + '\r\n);'
            langTmp.fileValue = parseFileValue(params)
          } else {
            langTmp.paramsStr = `append(new http\\QueryString(array({\r\n${parseFormData(params, {
              format: '  ${name} => ${value}',
              separator: ',\r\n',
              init: sameNameToParams,
              map(val: unknown) {
                val.name = JSON.stringify(val.name)
                if (Object.prototype.toString.call(val.value) == '[object Array]') {
                  const InfoStr: unknown = []
                  val.value.forEach((val: unknown) => {
                    InfoStr.push(`  ${val}`)
                  })
                  val.value = `array(\r\n${InfoStr.join(',\r\n')} \r\n  )`
                } else {
                  val.value = JSON.stringify(val.value)
                }
                return val
              }
            })}\r\n))));`
          }
          break
        }
        default: {
          langTmp.paramsStr = `append(${JSON.stringify(requestParam)});`
        }
      }
      const tmpOutput: unknown = []
      urlObj.searchParams.forEach((val: unknown, key: unknown) => {
        tmpOutput.push(`  ${JSON.stringify(key)} => ${JSON.stringify(val)}`)
        langTmp.queryStr = `$request->setQuery(new http\\QueryString(array(\r\n${tmpOutput.join(
          ',\r\n'
        )}\r\n)));`
      })
      if (multipart) {
        code =
          '<?php\r\n' +
          `//${$t('获取文件,需填路径')} \r\n` +
          '$file_path = "";\r\n' +
          `$file_name = "${langTmp.fileValue}";\r\n` +
          '$client = new http\\Client;\r\n' +
          '$request = new http\\Client\\Request;\r\n\r\n' +
          '$body = new http\\Message\\Body;\r\n' +
          `$request->setRequestUrl("${urlObj.host + urlObj.pathname}");\r\n` +
          `$request->setRequestMethod("${method}");\r\n` +
          '$request->setBody($body);\r\n\r\n' +
          `$request->getBody()->${langTmp.paramsStr}\r\n\r\n` +
          '$request->setHeaders(array(\r\n' +
        `${langTmp.headerStr ?  `${langTmp.headerStr}\r\n` : ''}` +
          '  "Content-Type":"multipart/form-data"\r\n' +
          '));\r\n\r\n' +
          '$client->enqueue($request)->send();\r\n' +
          '$response = $client->getResponse();\r\n\r\n' +
          'echo $response->getBody();\r\n'
      } else {
        code =
          '<?php\r\n\r\n' +
          '$client = new http\\Client;\r\n' +
          '$request = new http\\Client\\Request;\r\n\r\n' +
          '$body = new http\\Message\\Body;\r\n' +
          `$body->${langTmp.paramsStr}\n\r` +
          `$request->setRequestUrl("${urlObj.host + urlObj.pathname}");\r\n` +
          `$request->setRequestMethod("${method}");\r\n` +
          '$request->setBody($body);\r\n\r\n' +
          `${langTmp.queryStr ? `${langTmp.queryStr}\r\n\r\n` : ''}` +
          '$request->setHeaders(array(\r\n' +
          `${langTmp.headerStr ?  `${langTmp.headerStr}\r\n` : ''}` +
          '));\r\n\r\n' +
          '$client->enqueue($request)->send();\r\n' +
          '$response = $client->getResponse();\r\n\r\n' +
          'echo $response->getBody();\r\n'
      }
      break
    }
    // PHP>cURL
    case '11': {
      langTmp.headerStr = parseHeaders(headers, {
        format: '    "${name}:${value}"',
        separator: ',\r\n'
      })
      switch (requestType || 'FORMDATA') {
        case 'FORMDATA': {
          if (multipart) {
            let tmpOutput = ''
            params.map((val: unknown, key: number) => {
              if (val.data_type === 'file') {
                tmpOutput += `    "${val.name}" => new CURLFile($file_path)${
                  key === params.length - 1 ? '' : ','
                }\r\n`
              } else {
                tmpOutput += `    ${JSON.stringify(val.name)} => ${JSON.stringify(val.value)}\r`
              }
            })
            langTmp.paramsStr = `${tmpOutput.length ? `array(\r\n${tmpOutput}  )` : ''}`
            langTmp.fileValue = parseFileValue(params)
            langTmp.paramsStr = JSON.stringify(parseFormData(params))
          } else {
            langTmp.paramsStr = JSON.stringify(
              parseFormData(params, {
                format: '${name}=${value}',
                separator: '&',
                map: encodeURIComponentParams
              })
            )
          }
          break
        }
        default: {
          langTmp.paramsStr = JSON.stringify(requestParam)
        }
      }
      if (multipart) {
        code =
          '<?php\r\n\r\n' +
          `//${$t('获取文件,需填路径')} \r\n` +
          '$file_path = "";  \r\n\r\n' +
          '$curl = curl_init();\r\n\r\n' +
          'curl_setopt_array($curl, array(\r\n' +
          `${urlObj.port ? `  CURLOPT_PORT => "${urlObj.port}",\r\n` : ''}` +
          `  CURLOPT_URL => "${urlObj.href}",\r\n` +
          '  CURLOPT_RETURNTRANSFER => true,\r\n' +
          '  CURLOPT_ENCODING => "",\r\n' +
          '  CURLOPT_MAXREDIRS => 10,\r\n' +
          '  CURLOPT_TIMEOUT => 30,\r\n' +
          '  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,\r\n' +
          `  CURLOPT_CUSTOMREQUEST => "${method}",\r\n` +
          `  CURLOPT_POSTFIELDS => ${langTmp.paramsStr},\r\n` +
          '  CURLOPT_HTTPHEADER => array(\r\n' +
          `${langTmp.headerStr ?  `${langTmp.headerStr},\r\n` : ''}` +
          '    "Content-Type:multipart/form-data"' +
          '\r\n  ),\r\n' +
          '));\r\n\r\n' +
          '$response = curl_exec($curl);\r\n\r\n' +
          '$err = curl_error($curl);\r\n\r\n' +
          'curl_close($curl);\r\n\r\n' +
          'if ($err) {\r\n' +
          '  echo "cURL Error #:" . $err;\r\n' +
          '} else {\r\n' +
          '  echo $response;\r\n' +
          '}\r\n'
      } else {
        code =
          '<?php\r\n\r\n' +
          '$curl = curl_init();\r\n\r\n' +
          'curl_setopt_array($curl, array(\r\n' +
          `${urlObj.port ? `  CURLOPT_PORT => "${urlObj.port}",\r\n` : ''}` +
          `  CURLOPT_URL => "${urlObj.href}",\r\n` +
          '  CURLOPT_RETURNTRANSFER => true,\r\n' +
          '  CURLOPT_ENCODING => "",\r\n' +
          '  CURLOPT_MAXREDIRS => 10,\r\n' +
          '  CURLOPT_TIMEOUT => 30,\r\n' +
          '  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,\r\n' +
          `  CURLOPT_CUSTOMREQUEST => "${method}",\r\n` +
          `  CURLOPT_POSTFIELDS => ${langTmp.paramsStr},\r\n` +
          `  CURLOPT_HTTPHEADER => array(\r\n${langTmp.headerStr}` +
          '\r\n  ),\r\n' +
          '));\r\n\r\n' +
          '$response = curl_exec($curl);\r\n\r\n' +
          '$err = curl_error($curl);\r\n\r\n' +
          'curl_close($curl);\r\n\r\n' +
          'if ($err) {\r\n' +
          '  echo "cURL Error #:" . $err;\r\n' +
          '} else {\r\n' +
          '  echo $response;\r\n' +
          '}\r\n'
      }
      break
    }
    // Python>http.client(Python 3)
    case '13': {
      langTmp.headerStr = parseHeaders(headers, {
        format: '    ${name}:${value}',
        separator: ',\r\n',
        map: stringifyHeaders
      })
      switch (requestType || 'FORMDATA') {
        case 'FORMDATA': {
          if (multipart) {
            langTmp.paramsStr = parseFormData(params, {
              hasFileParams: true,
              format: `${indent}\${name}: \${value}`,
              separator: ',\r\n',
              init: sameNameToParams,
              map: stringifyParams
            })
            langTmp.fileValue = parseFileValue(params)
          } else {
            langTmp.paramsStr = JSON.stringify(
              parseFormData(params, {
                format: '${name}=${value}',
                separator: '&',
                map: encodeURIComponentParams
              })
            )
          }
          break
        }
        case 'JSON': {
          langTmp.paramsStr = requestParam
          break
        }
        default: {
          langTmp.paramsStr = JSON.stringify(requestParam)
        }
      }
      if (multipart) {
        code =
          'import http.client\r\n' +
          'import mimetypes\r\n' +
          'from requests_toolbelt.multipart.encoder import MultipartEncoder\r\n\r\n' +
          `conn = http.client.HTTPSConnection("${urlObj.host}")\r\n` +
          `headers = {\r\n${langTmp.headerStr}\r\n` +
          '}\r\n\r\n' +
          'payload = { \r\n' +
          `${langTmp.paramsStr}\r\n` +
          '} \r\n' +
          'encoder = MultipartEncoder(payload)\r\n' +
          'headers["Content-Type"] = encoder.content_type\r\n' +
          'print(encoder.content_type)\r\n' +
          `conn.request("${method}",${`"${urlObj.pathname}${urlObj.search}"`}, body=encoder.to_string(), headers=headers)\r\n` +
          'res = conn.getresponse()\r\n' +
          'data = res.read()\r\n' +
          'print(data.decode("utf-8"))\r\n'
      } else {
        code =
          'import http.client\r\n\r\n' +
          `conn = http.client.HTTPSConnection("${urlObj.host}")\r\n\r\n` +
          `payload = ${langTmp.paramsStr}\r\n\r\n` +
          `headers = {\r\n${langTmp.headerStr}` +
          '\r\n}\r\n\r\n' +
          `conn.request("${method}",${`"${urlObj.pathname}${urlObj.search}"`}, payload, headers)\r\n\r\n` +
          'res = conn.getresponse()\r\n\r\n' +
          'data = res.read()\r\n\r\n' +
          'print(data.decode("utf-8"))\r\n'
      }
      break
    }
    // Python>Requests
    case '14': {
      langTmp.headerStr = parseHeaders(headers, {
        format: '    ${name}:${value}',
        separator: ',\r\n',
        map: stringifyHeaders
      })
      switch (requestType || 'FORMDATA') {
        case 'FORMDATA': {
          if (multipart) {
            langTmp.paramsStr = parseFormData(params, {
              format: `${indent}\${name}: \${value}`,
              separator: ',\r\n',
              init: sameNameToParams,
              map: stringifyParams
            })
            langTmp.fileValue = parseFileValue(params)
          } else {
            langTmp.paramsStr = JSON.stringify(
              parseFormData(params, {
                format: '${name}=${value}',
                separator: '&',
                map: encodeURIComponentParams
              })
            )
            // langTmp.paramsStr = JSON.stringify(
            //   getJson(params, {
            //     ignoreCheckbox: true
            //   })
            // )
          }
          break
        }
        case 'JSON': {
          langTmp.paramsStr = requestParam
          break
        }
        default: {
          langTmp.paramsStr = JSON.stringify(requestParam)
        }
      }
      const tmpOutput: unknown = []
      urlObj.searchParams.forEach((val: unknown, key: unknown) => {
        tmpOutput.push(`${JSON.stringify(key)} : ${JSON.stringify(val)}`)
        // langTmp.querystring = `querystring={${tmpOutput.join(',')}};`
        langTmp.querystring = `{${tmpOutput.join(',')}}`

      })
      if(multipart) {
        code = 
        'import requests \r\n\r\n' +
            'headers = {\r\n' +
            `${langTmp.headerStr}\r\n` +
            '}\r\n' +
            `url = "${method === 'GET' ? urlObj.origin + urlObj.pathname :  urlObj.href}"\r\n` +
            '//获取文件,需填路径 \r\n' +
            "file_path = '' \r\n" +
            `filename = "${langTmp.fileValue}" \r\n` +
            `filetype = "${langTmp.fileType}" \r\n` +
            'data = { \r\n' +
            `${langTmp.paramsStr}\r\n` +
            '} \r\n' +
            'files = {"file": (filename, open(file_path, "rb"), filetype)} \r\n' +
            `response=requests.${method.toLowerCase()}(url, files=files, headers=headers, data=data)\r\n` +
            'print(response.text)\r\n'
      } else {
        code = 
        'import requests\r\n\r\n' +
        `url = "${method === 'GET' ? urlObj.origin + urlObj.pathname :  urlObj.href}"\r\n\r\n` +
        `payload = ${
          langTmp.querystring ? langTmp.querystring : langTmp.paramsStr
        }\r\n\r\n` +
        `headers = {\r\n${langTmp.headerStr}` +
        '\r\n}\r\n\r\n' +
        `response=requests.request("${method}", url, ${payloadStr(method, headers)}, headers=headers)\r\n\r\n` +
        'print(response.text)\r\n'
      }
      break
    }
    // Ruby(Net:Http)
    case '15': {
      langTmp.headerStr = parseHeaders(headers, {
        format: 'request[${name}] = ${value}',
        separator: '\r\n',
        map: stringifyHeaders
      })
      switch (requestType || 'FORMDATA') {
        case 'FORMDATA': {
          if (multipart) {
            let tmpOutput = ''
            params.map((val: unknown, key: number) => {
              if (val.data_type === 'file') {
                tmpOutput += `    "${val.name}" => new CURLFile($file_path)${
                  key === params.length - 1 ? '' : ','
                }\r\n`
              } else {
                tmpOutput += `    ${JSON.stringify(val.name)} => ${JSON.stringify(val.value)}\r`
              }
            })
            langTmp.paramsStr = `${tmpOutput.length ? `array(\r\n${tmpOutput}  )` : ''}`
            langTmp.fileValue = parseFileValue(params)
          } else {
            langTmp.paramsStr = JSON.stringify(
              parseFormData(params, {
                format: '${name}=${value}',
                separator: '&',
                map: encodeURIComponentParams
              })
            )
          }
          break
        }
        default: {
          langTmp.paramsStr = JSON.stringify(requestParam)
        }
      }
      code =
        "require 'uri'\r\n" +
        "require 'net/http'\r\n\r\n" +
        `url = URI("${urlObj.href}")\r\n\r\n` +
        'http = Net::HTTP.new(url.host, url.port)\r\n\r\n' +
        `request = Net::HTTP::${method.toLowerCase().replace(/^\S/, (s: string) => {
          return s?.toUpperCase()
        })}.new(url)\r\n` +
        `${langTmp.headerStr ?  `${langTmp.headerStr}\r\n` : ''}` +
        `request.body = ${langTmp.paramsStr}\r\n\r\n` +
        'response = http.request(request)\r\n' +
        'puts response.read_body'
      break
    }
    // Shell>Httpie
    case '17': {
      langTmp.headerStr = parseHeaders(headers, {
        format: '  ${name}:${value}',
        separator: ' \\\r\n'
      })
      switch (requestType || 'FORMDATA') {
        case 'FORMDATA': {
          if (multipart) {
            langTmp.paramsStr = parseFormData(params, {
              langType: 'shellHttpie'
            })
            // langTmp.paramsStr = `echo '${parseFormData(params)}' |  \\`
          } else {
            langTmp.paramsStr = parseFormData(params, {
              format: '  ${name}=${value}',
              separator: ' \\\r\n',
              map(val: unknown) {
                val.value = JSON.stringify(val.value)
                return val
              }
            })
          }
          break
        }
        default: {
          langTmp.paramsStr = `${requestParam}`
        }
      }
      code =
        `${
          requestType === 'JSON' ? `printf '${langTmp.paramsStr}'|` : ''
        } http  ${
          (requestType || 'FORMDATA').toString() === 'FORMDATA' &&
          !multipart
            ? '--form'
            : (requestType || 'JSON').toString() === 'JSON' &&
              !multipart
            ? '--follow'
            : ''
        } ${multipart ? '--ignore-stdin --form --follow' : ''}  ${method}  '${
          urlObj.href
        }' ${multipart ? '\\\r' : '\\'}` +
        `${multipart ? langTmp.paramsStr : ''}\r` +
        `${langTmp.headerStr}` +
        `${
          (requestType || 'FORMDATA').toString() === 'FORMDATA' &&
          !multipart &&
          langTmp.paramsStr
            ? ` \\\r\n${langTmp.paramsStr}`
            : ''
        }`
      break
    }
    // Shell>cUrl
    case '18': {
      langTmp.headerStr = parseHeaders(headers, {
        format: "  --header  '${name}:${value}'",
        separator: ' \\\r\n'
      })
      switch (requestType || 'FORMDATA') {
        case 'FORMDATA': {
          if (multipart) {
            let tmpOutput = ''
            params.forEach((val: unknown, key: number) => {
              if (val.data_type === 'file') {
                tmpOutput = `  --form '${val.name}=@"${val.value}"'  \\`
              }
            })
            langTmp.paramsStr = tmpOutput
           
          } else {
            const tmpOutput = parseFormData(params, {
              format: '${name}=${value}',
              separator: '&',
              map: encodeURIComponentParams
            })
            langTmp.paramsStr = tmpOutput ? `  --data '${tmpOutput}'` : ''
          }
          break
        }
        default: {
          langTmp.paramsStr = requestParam ? `  --data '${requestParam}'` : ''
        }
      }
      code =
        `curl --request ${method} \\\r\n` +
        `  --url ${`'${urlObj.href}'` || ''} \\\r\n` +
        `${langTmp.headerStr}` +
        `${langTmp.paramsStr ? `\\\r\n${langTmp.paramsStr}` : ''}`
      break
    }
    // Go
    case '19': {
      langTmp.headerStr = parseHeaders(headers, {
        format: '    req.Header.Add(${name},${value})',
        separator: '\r\n',
        map: stringifyHeaders
      })
      switch (requestType) {
        case 'FORMDATA': {
          if (multipart) {
            langTmp.paramsStr = parseFormData(params, { langType: 'go' })
            code =
              'package main\r\n\r\n' +
              'import (\r\n' +
              '    "bytes"\r\n' +
              '    "fmt"\r\n' +
              '    "io"\r\n' +
              '    "mime/multipart"\r\n' +
              '    "net/http"\r\n' +
              '    "os"\r\n' +
              ')\r\n\r\n' +
              'const ( \r\n' +
              '  TextType = "text"\r\n' +
              '  FileType = "file"\r\n' +
              ')\r\n\r\n' +
              'type param struct { \r\n' +
              '  key string\r\n' +
              '  value string\r\n' +
              '  typ string\r\n' +
              '}\r\n\r\n' +
              'func main() {\r\n' +
              '    body, err := request()\r\n' +
              '    if err != nil {\r\n' +
              '      fmt.Println(err)\r\n' +
              '      return\r\n' +
              '    }\r\n' +
              '    fmt.Println(string(body))\r\n' +
              '}\r\n\r\n' +
              'func writeFile(file string, writer io.Writer) error {\r\n' +
              '    src, err := os.Open(file)\r\n' +
              '    if err != nil {\r\n' +
              '      return err\r\n' +
              '    }\r\n' +
              '    defer src.Close()\r\n' +
              '    _, err = io.Copy(writer, src)\r\n' +
              '    if err != nil {\r\n' +
              '      return err\r\n' +
              '    }\r\n' +
              '    return nil\r\n' +
              '}\r\n\r\n' +
              'func request() ([]byte, error) {\r\n' +
              '    params := []*param{\r\n' +
              `${langTmp.paramsStr}` +
              '    }\r\n' +
              '    body := new(bytes.Buffer)\r\n' +
              '    writer := multipart.NewWriter(body)\r\n' +
              '    for _, p := range params {\r\n' +
              '      switch p.typ { \r\n' +
              '        case TextType: \r\n' +
              '          writer.WriteField(p.key, p.value)\r\n' +
              '        case FileType: \r\n' +
              '          part, err := writer.CreateFormFile(p.key, p.value)\r\n' +
              '          if err != nil {\r\n' +
              '           return nil, err\r\n' +
              '          }\r\n' +
              '          err = writeFile(p.value, part)\r\n' +
              '          if err != nil {\r\n' +
              '           return nil, err\r\n' +
              '          }\r\n' +
              '      }\r\n' +
              '    }\r\n\r\n' +
              '    err := writer.Close()\r\n' +
              '    if err != nil {\r\n' +
              '    return nil, err\r\n' +
              '    }\r\n' +
              `    req, err := http.NewRequest("${method}","${urlObj.href}", body)\r\n\r\n` +
              '    if err != nil {\r\n' +
              '      return nil, err\r\n' +
              '    }\r\n' +
              `${langTmp.headerStr ?  `${langTmp.headerStr}\r\n` : ''}` +
              '    req.Header.Add("Content-Type", writer.FormDataContentType())\r\n\r\n' +
              '    client := &http.Client{}\r\n' +
              '    resp, err := client.Do(req)\r\n' +
              '    if err != nil {\r\n' +
              '     return nil, err\r\n' +
              '    }\r\n' +
              '    defer resp.Body.Close()\r\n' +
              '    return io.ReadAll(resp.Body)\r\n' +
              '}'
          } else {
            langTmp.paramsStr = goCodeParseFormData(params)
            code =
              'package main\r\n\r\n' +
              'import (\r\n' +
              '    "fmt"\r\n' +
              '    "io/ioutil"\r\n' +
              '    "net/http"\r\n' +
              '    "net/url"\r\n' +
              '    "strings"\r\n' +
              ')\r\n\r\n' +
              'func main() {\r\n' +
              '    body, err := request()\r\n' +
              '    if err != nil {\r\n' +
              '      fmt.Println(err)\r\n' +
              '      return\r\n' +
              '    }\r\n' +
              '    fmt.Println(string(body))\r\n' +
              '}\r\n\r\n' +
              'func request() ([]byte, error) {\r\n' +
              `    uri := "${urlObj.href}"\r\n\r\n` +
              '    payload := url.Values{}\r\n' +
              `  ${langTmp.paramsStr ? `  ${langTmp.paramsStr}` : ''}` +
              `req, _ := http.NewRequest("${method}", uri, strings.NewReader(payload.Encode()))\r\n\r\n` +
              `${langTmp.headerStr}\r\n\r\n` +
              '    res, err := http.DefaultClient.Do(req)\r\n' +
              '    if err != nil {\r\n' +
              '      return nil, err\r\n' +
              '    }\r\n' +
              '    defer res.Body.Close()\r\n' +
              '    return ioutil.ReadAll(res.Body)\r\n' +
              '}'
          }
          break
        }
        default: {
          langTmp.paramsStr = requestParam ? JSON.stringify(requestParam) : ''
          code = 
            'package main\r\n\r\n' +
            'import (\r\n' +
            '    "bytes"\r\n' +
            '    "encoding/json"\r\n' +
            '    "fmt"\r\n' +
            '    "io/ioutil"\r\n' +
            '    "net/http"\r\n' +
            ')\r\n\r\n' +
            'func main() {\r\n' +
            '    body, err := request()\r\n' +
            '    if err != nil {\r\n' +
            '     fmt.Println(err)\r\n' +
            '     return\r\n' +
            '    }\r\n' +
            '    fmt.Println(string(body))\r\n' +
            '}\r\n\r\n' +
            'func request() ([]byte, error) {\r\n' +
            `    uri := "${urlObj.href}"\r\n\r\n` +
            `  ${
               langTmp.paramsStr
                ? `  payload := map[string]interface{}${langTmp.paramsStr}`
                : '  payload := strings.NewReader("")'
            }\r\n\r\n` +
            `    req, _ := http.NewRequest("${method}", uri, bytes.NewBuffer(data))\r\n\r\n` +
            `${langTmp.headerStr}\r\n\r\n` +
            '    res, err := http.DefaultClient.Do(req)\r\n' +
            '    if err != nil {\r\n' +
            '      return nil, err\r\n' +
            '    }\r\n' +
            '    defer res.Body.Close()\r\n' +
            '    return ioutil.ReadAll(res.Body)\r\n' +
            '}'
        }
      }
      break
    }
    // Java>OK HTTP
    case '20': {
      langTmp.headerStr = parseHeaders(headers, {
        format: '  .addHeader(${name},${value})',
        separator: '\r\n',
        map: stringifyHeaders
      })
      let mediaType = 'application/octet-stream'
      switch ( (requestType || 'FORMDATA').toUpperCase()) {
        case 'FORMDATA': {
          if (multipart) {
            mediaType = 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW'
            langTmp.paramsStr = parseFormData(params, {
              langType: 'Java',
              map: encodeURIComponentParams
            })

            langTmp.fileValue = parseFileValue(params)
            langTmp.fileType = parseFileType(langTmp.fileValue)
          } else {
            mediaType = 'application/x-www-form-urlencoded'
            langTmp.paramsStr = JSON.stringify(
              parseFormData(params, {
                format: '${name}=${value}',
                separator: '&',
                map: encodeURIComponentParams
              })
            )
          }
          break
        }
        case 'JSON': {
          mediaType = 'application/json'
          langTmp.paramsStr = JSON.stringify(requestParam)
          break
        }
        case 'XML': {
          mediaType = 'application/xml'
          langTmp.paramsStr = JSON.stringify(requestParam)
          break
        }
        default: {
          langTmp.paramsStr = JSON.stringify(requestParam)
          break
        }
      }
      if(multipart) {
        code = 
          'OkHttpClient client = new OkHttpClient();\r\n\r\n' +
          '//获取文件,需填路径 \r\n' +
          'File file = new File(""); \r\n\r\n' +
          `RequestBody fileBody = RequestBody.create(MediaType.parse("${langTmp.fileType}"), file); \r\n\r\n` +
          'MultipartBody.Builder builder = new MultipartBody.Builder()\r\n' +
          '  .setType(MultipartBody.FORM)\r\n' +
          `${langTmp.paramsStr ? `${langTmp.paramsStr}\r\n` : ''}` +
          'Request request = new Request.Builder()\r\n' +
          `  .url("${urlObj.href}")\r\n` +
          `${langTmp.headerStr ? `${langTmp.headerStr}\r\n` : ''}` +
          '  .post(builder.build())\r\n' +
          '  .build();\r\n\r\n' +
          'Response response = client.newCall(request).execute();\r\n' +
          'String result = response.body().string();\r\n' +
          'System.out.println(result);\r\n'
      } else {
        code =
          'OkHttpClient client = new OkHttpClient().newBuilder().build();\r\n' +
          `MediaType mediaType = MediaType.parse("${mediaType}");\r\n` +
          `${
            method === 'GET'
              ? ''
              : `RequestBody body = RequestBody.create(mediaType, ${langTmp.paramsStr});\r\n`
          }` +
          'Request request = new Request.Builder()\r\n' +
          `  .url("${urlObj.href}")\r\n` +
          `  .method("${method}",${method === 'GET' ? 'null' : 'body'})\r\n` +
          `${langTmp.headerStr ? `${langTmp.headerStr}\r\n` : ''}` +
          '  .build();\r\n\r\n' +
          'Response response = client.newCall(request).execute();\r\n' +
          'System.out.println(response.body().string());\r\n'
      }
      
      break
    }

    // 微信小程序
    case '21': {
      const langTmp: unknown = {
        headerStr: '',
        paramsStr: ''
      }
      langTmp.headerStr = parseHeaders(headers, {
        format: `${indent + indent}\${name}:\${value}`,
        separator: ',\r\n',
        map: stringifyHeaders
      })
      switch (requestType || 'FORMDATA') {
        case 'FORMDATA': {
          if (multipart) {
            langTmp.paramsStr = `var data = new FormData();\r\n${parseFormData(params, {
              format: 'data.append(${name},${value});',
              separator: '\r\n',
              map: stringifyParams
            })}`
          } else {
            langTmp.paramsStr = `var data = {\n${parseFormData(params, {
              format: `${indent}\${name}: \${value}`,
              separator: ',\r\n',
              init: sameNameToParams,
              map: stringifyParams
            })}\r\n}`
          }
          break
        }
        default: {
          langTmp.paramsStr = `var data = ${JSON.stringify(requestParam)}`
        }
      }
      code =
        `${langTmp.paramsStr}\r\n\r\n` +
        'wx.request({\r\n' +
        `${indent}"url":"${urlObj.href || ''}",\r\n` +
        `${indent}"method": "${method}",\r\n` +
        `${indent}"header": {\r\n` +
        `${langTmp.headerStr}\r\n` +
        `${indent}},\r\n` +
        `${
          multipart ? `${indent}"processData": false,\r\n${indent}"contentType": false,\r\n` : ''
        }` +
        `${langTmp.paramsStr ? `${indent}"data": data,\r\n` : ''}` +
        `${indent}"success": (response)=> {\r\n` +
        `${indent + indent}console.log(response.data)\r\n` +
        `${indent}}\r\n` +
        '})\r\n'
      break
    }
    default: {
      break
    }
  }
  return code
}
