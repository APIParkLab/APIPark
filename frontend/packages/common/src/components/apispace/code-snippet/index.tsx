import  { useEffect } from 'react';
import { Cascader } from 'antd';
import CODE_LANG from '@common/const/code/const';
import type { DefaultOptionType } from 'antd/es/cascader';
import { useState } from 'react';
import { cloneDeep } from 'lodash-es';
import {  paramsJsonType } from './code-snippets.type';
import { DOMAIN_SUFIX } from './code-example.type';
import { transfromUrlParam } from './transform';
import { generateCode } from './generate-code';
import {ApiDetail} from "@common/const/api-detail";
import {Codebox} from "@common/components/postcat//api/Codebox";
import {Collapse} from "@common/components/postcat/api/Collapse";
import {Box} from "@mui/material";
import { $t } from '@common/locales';

type CodeSnippetCompoType = {
  title:string
  api:ApiDetail,
  extraTitle:unknown,
  extraContent:unknown,
  minLines:number
}

  const file: unknown[] = []
  const env: unknown = {}
  const loading: boolean = false
  const codeMode: string = 'rust'
  const codeMens: string[] = ['reset', 'copy', 'download', 'newTab', 'search']
  const DOMAIN_REGEX: RegExp = new RegExp(
      `^(((http|ftp|https):\/\/)|)(([\\\w\\\-_]+([\\\w\\\-\\\.]*)?(\\\.(${DOMAIN_SUFIX.join(
          '|'
      )})))|((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]))|(localhost))((\\\/)|(\\\?)|(:)|($))`
  )

  let isMultipart: boolean = false

  export default function CodeSnippetCompo({title,api, extraTitle, extraContent, minLines=15}: CodeSnippetCompoType) {
    // const [tokenState ] = useTokenBasicInfo()
    const pretreatmentRequestInfo = (apiDoc: ApiDetail) =>{
      isMultipart = false
      const result: ApiDetail = cloneDeep(apiDoc)
      const files: unknown = file || []
      let isMuti: boolean = false
      const headers: string[] = []
      let alreadyHadContentType: boolean = false
      result.headers = []
      const originHeader = apiDoc.requestParams?.headerParams
      //处理请求头部
      originHeader?.forEach((header: unknown) => {
        // if (
        //     tokenState?.selected_X_apibee_token &&
        //     originHeader.length &&
        //     originHeader[0].name == 'X-APISpace-Token'
        // ) {
        //   originHeader[0].value = tokenState?.selected_X_apibee_token
        // }
        const { checkbox, name } = header
        if ((checkbox || !header.hasOwnProperty('checkbox')) && name) {
          headers.push(name?.toLowerCase())
          result.headers.push(header)
          if (/content-type/i.test(name)) {
            alreadyHadContentType = true
          }
        }
      })
      const query: unknown = {}

      apiDoc.requestParams?.queryParams?.forEach((query: unknown) => {
        const { checkbox, name } = query
        if ((checkbox || !query.hasOwnProperty('checkbox')) && name) {
          query[name] = query?.paramAttr.example || ''
        }
      })
      result.URL = transfromUrlParam(result.uri, query)

      //处理 restful 参数
      apiDoc.requestParams?.restParams?.forEach((rest: unknown) => {
        if ((rest.checkbox || !rest.hasOwnProperty('checkbox')) && rest.name && rest.paramAttr.example) {
          if (eval(`/:${rest.name}/`).test(result.URL.trim())) {
            result.URL = result.URL.replaceAll(`:${rest.name}`, rest.paramAttr.example )
          } else if (
              result.URL.trim().indexOf(`{{${rest.name}}}`) == -1 &&
              result.URL.trim().indexOf(`{${rest.name}}`) > -1
          ) {
            result.URL = result.URL.replaceAll(`{${rest.name}}`, rest.paramAttr.example)
          }
        }
      })

      result.params = []
      //为请求参数 中的header、reset、body、query 添加 value 和 valueQuery  的值
      switch (result.requestParams?.bodyParams?.[0]?.contentType) {
        case 0: {
          result.requestParams?.bodyParams?.forEach((body: unknown, key: unknown) => {
            if ((body.checkbox || !body.hasOwnProperty('checkbox')) && body.name) {
              if (paramsJsonType[body.dataType] == 'string' && body.paramAttr.example) {
                isMuti = true
                body.files = files[key] || []
              }
              result.params.push(body)
            }
          })
          if (!alreadyHadContentType) {
            if (isMuti) {
              isMultipart = true
              result.headers.push({
                name: 'Content-Type',
                value: 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW',
                checkbox: true
              })
            } else {
              result.headers.push({
                name: 'Content-Type',
                value: 'application/x-www-form-urlencoded',
                checkbox: true
              })
            }
          }
          break
        }
        case 1: {
          result.params = apiDoc.requestParams?.bodyParams
          break
        }
        case 2: {
          result.params = apiDoc.requestParams?.bodyParams
          if (!alreadyHadContentType) {
            result.headers.push({
              name: 'Content-Type',
              value: 'application/json',
              checkbox: true
            })
          }
          break
        }
        case 3: {
          result.params = apiDoc.requestParams?.bodyParams
          if (!alreadyHadContentType) {
            result.headers.push({
              name: 'Content-Type',
              value: 'application/xml',
              checkbox: true
            })
          }
          break
        }
      }
      
      result.requestType = result.requestParams?.bodyParams?.[0]?.contentType || 0
      return result
    }

    const [code, setCode] = useState<string>('')
    const [lang, setLang] = useState<number[]>([20])

    let tempCode = ''
    const getCode = (language: number | string) => {
      if (!['HTTPS', 'HTTP'].includes(api.protocol?.toUpperCase())) {
        tempCode = $t('暂不支持生成非 HTTPS 或非 HTTP 协议的代码示例')
        setCode(tempCode)
        return
      }
      tempCode = generateCode(
          language.toString(),
          isMultipart,
          pretreatmentRequestInfo(cloneDeep(api))
      )
      setCode(tempCode)
    }

    useEffect(() => {
      if(!Object.keys(api).length) return
      getCode(lang[lang.length -1 ])
    }, [api])


    const onChange = (value: number[],record:DefaultOptionType[]) => {
      const num = value[value.length - 1]
      setLang(value)
      if(!Object.keys(api).length) return
      getCode(num)
    };

    const filter = (inputValue: string, path: DefaultOptionType[]) =>
        path.some(
            (option) => (option.label as string).toLowerCase().indexOf(inputValue.toLowerCase()) > -1,
        );

    const [placeholderTxt, setPlaceholderTxt] = useState($t('搜索编程语言...'))
    const [selectItemTxt, setSelectItemTxt ] = useState('')

    return  (

        <Collapse title={title}>
          <Box width="100%">
            <>
            <Codebox extraContent={<><span className="ml-[12px]">{$t('编程语言')}：</span><Cascader
                  options={CODE_LANG}
                  onChange={(value,record) => onChange(value as unknown as number[],record)}
                  placeholder={placeholderTxt}
                  value={lang} // 当前的值
                  showSearch={{ filter }}
                  size="small"
                  allowClear={false}
                  // onDropdownVisibleChange={value => openChange(value)}
              /></>} 
              language={'javascript'} value={code} readOnly={true} height={'250px'} width={'100%'}/>
            </>
          </Box>
        </Collapse>

    )

  }