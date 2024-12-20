import { Collapse } from './api/Collapse'
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { Select, Input, Space } from 'antd'
import { Box, Stack, ThemeProvider, createTheme } from '@mui/material'
import { ApiResponseEditor, ApiResponseEditorApi } from './api/ApiManager/components/ApiResponseEditor'
import { ApiRequestEditor, ApiRequestEditorApi } from './api/ApiManager/components/ApiRequestEditor'
import { ResponseExampleCompo, ResponseExampleCompoEditorApi } from '@common/components/apispace/response-example'
import { ResultListType } from '@common/const/api-detail'
import { SystemApiDetail, SystemInsideApiProxyHandle } from '@core/const/system/type'
import SystemInsideApiProxy from '@core/pages/system/api/SystemInsideApiProxy'
import ApiMatch from './api/ApiPreview/components/ApiMatch'
import { v4 as uuidv4 } from 'uuid'
import { PLACEHOLDER } from '@common/const/const'
import { $t } from '@common/locales'

const PROTOCOL_LIST = ['HTTP', 'HTTPS']
const HTTP_METHOD_LIST = ['POST', 'GET', 'PUT', 'DELETE', 'HEAD', 'OPTIONS', 'PATCH']
export interface ApiEditApi {
  getData: () => Promise<{ apiInfo: Partial<SystemApiDetail> } | string | boolean> | undefined
}

interface DescriptionHandle {
  getData: () => string
}
interface ApiNameProps {
  apiInfo: SystemApiDetail
}

interface ApiNameHandle {
  getData: () => string
}

export const theme = createTheme({
  palette: {
    primary: {
      main: '#3D46F2' // 自定义主色调
    },
    text: {
      primary: '#333', // 主要文字颜色
      secondary: '#333' // 次要文字颜色
    },
    // 添加其他颜色配置，如错误色、背景色等
    error: {
      main: '#d32f2f'
    },
    background: {
      paper: '#fff',
      default: '#f7f8fa'
    }
  },
  transitions: {
    create: () => 'none'
  },
  components: {
    MuiInput: {
      styleOverrides: {
        root: {
          '&::placeholder': {
            color: '#BBB' // 设置 placeholder 的颜色
          },
          '&:hover:not(.Mui-disabled):not(.Mui-focused):not(.Mui-error)': {
            borderColor: '#3D46F2', // 设置 hover 时的边框颜色
            borderWidth: '1px' // 设置边框粗细
          },
          '&.Mui-focused': {
            borderColor: '#3D46F2', // 设置选中时的边框颜色
            borderWidth: '1px' // 设置边框粗细
          }
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '&::placeholder': {
            color: '#BBB' // 设置 placeholder 的颜色
          },
          '&:hover  .MuiOutlinedInput-notchedOutline': {
            borderColor: '#3D46F2', // 设置选中时的边框颜色
            borderWidth: '1px' // 设置边框粗细
          }
        }
      }
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'transparent' // 设置 hover 时的背景色为透明
          },
          '&:hover:before': {
            backgroundColor: 'transparent' // 确保不透明度也为透明
          },
          transition: 'none' // 取消过渡效果
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          '&': {
            marginLeft: '0px',
            padding: '3px 12px',
            borderRadius: '4px'
          }
        }
      }
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          '&:hover:not(.Mui-disabled):not(.Mui-focused):not(.Mui-error)': {
            borderColor: '#3D46F2',
            borderWidth: '1px'
          },
          '&:hover:not(.Mui-disabled):not(.Mui-focused):not(.Mui-error) .MuiOutlinedInput-notchedOutline': {
            borderColor: '#3D46F2',
            borderWidth: '1px'
          },
          '&.Mui-focused': {
            borderColor: '#3D46F2',
            borderWidth: '1px'
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#3D46F2',
            borderWidth: '1px'
          }
        }
      }
    },
    MuiMenu: {
      styleOverrides: {
        root: {
          '.MuiMenuItem-root:hover': {
            backgroundColor: '#EBEEF2'
          },
          '.MuiMenuItem-root.Mui-selected': {
            backgroundColor: '#EBEEF2'
          }
        }
      }
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: '#BBB' // 设置 label 的颜色为灰色
        }
      }
    }
  }
})

export default function ApiEdit({
  apiInfo,
  editorRef,
  loaded,
  serviceId,
  teamId
}: {
  apiInfo: SystemApiDetail
  editorRef?: React.RefObject<ApiEditApi>
  loaded: boolean
  serviceId: string
  teamId: string
}) {
  const requestRef = useRef<ApiRequestEditorApi>(null)
  const responseRef = useRef<ApiResponseEditorApi>(null)
  const resultListRef = useRef<ResponseExampleCompoEditorApi>(null)
  const protocolOptionList = PROTOCOL_LIST.map((x) => ({ label: x, value: x }))
  const methodOptionList = HTTP_METHOD_LIST.map((x) => ({ label: x, value: x }))
  const [apiName, setApiName] = useState<string>('')
  const [resultList, setResultList] = useState<ResultListType[]>([])
  const proxyRef = useRef<SystemInsideApiProxyHandle>(null)
  const descriptionRef = useRef<DescriptionHandle>(null)
  const apiNameRef = useRef<ApiNameHandle>(null)

  useImperativeHandle(editorRef, () => ({
    getData: () => {
      return proxyRef.current
        ?.validate()
        .then((res) => {
          const name = apiNameRef.current?.getData()
          if (!name) return Promise.reject($t('请填写接口名称'))
          const newData: { apiInfo: Partial<SystemApiDetail> } = {
            apiInfo: {
              info: {
                name,
                description: descriptionRef.current?.getData()
              },
              proxy: res,
              doc: {
                ...apiInfo?.doc,
                requestParams: requestRef.current!.getData()!,
                responseList: responseRef.current!.getData()!,
                resultList: resultListRef.current!.getData()!
              }
            }
          }
          return Promise.resolve(newData)
        })
        .catch((errInfo) => Promise.reject(errInfo))
    }
  }))

  useEffect(() => {
    if (!apiInfo || Object.keys(apiInfo).length === 0) return
    setApiName(apiInfo.name!)
    setResultList(apiInfo?.doc?.resultList || [])
  }, [apiInfo])

  const Description = forwardRef<DescriptionHandle, { initDescription: string | undefined }>((props, ref) => {
    const { initDescription } = props
    const [description, setDescription] = useState<string>(initDescription || '')
    useImperativeHandle(ref, () => ({
      getData: () => description
    }))
    return (
      <Input.TextArea
        className="w-full border-none"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder={$t(PLACEHOLDER.input)}
      />
    )
  })

  const ApiName = forwardRef<ApiNameHandle, ApiNameProps>((props, ref) => {
    const { apiInfo } = props
    const [apiName, setApiName] = useState<string>(apiInfo?.name || '')
    useImperativeHandle(ref, () => ({
      getData: () => apiName
    }))
    return (
      <>
        <Space.Compact className="w-full mb-btnybase">
          <Select
            className="w-[15%] min-w-[100px]"
            value={apiInfo?.protocol || 'HTTP'}
            disabled={true}
            options={protocolOptionList}
          />
          <Select
            className="w-[15%] min-w-[100px]"
            value={apiInfo?.method}
            disabled={true}
            options={methodOptionList}
          />
          <Input className="w-[70%]" value={apiInfo?.path} disabled={true} />
        </Space.Compact>
        <Input value={apiName} onChange={(e) => setApiName(e.target.value)} status={apiName ? '' : 'error'} />
      </>
    )
  })

  return (
    <>
      <ThemeProvider theme={theme}>
        <Box>
          <Box>
            <Stack direction="column" spacing={3}>
              <ApiName apiInfo={apiInfo} ref={apiNameRef} />
              <Collapse key="description" title={$t('详细说明')}>
                <Description initDescription={apiInfo?.description} ref={descriptionRef} />
              </Collapse>
              {apiInfo?.match && apiInfo.match?.length > 0 && (
                <ApiMatch
                  title={$t('高级匹配')}
                  rows={apiInfo?.match.map((x) => {
                    x.id = uuidv4()
                    return x
                  })}
                />
              )}

              <Collapse title={$t('转发配置')} key="proxy">
                <SystemInsideApiProxy
                  className="m-[12px] px-[12px]"
                  initProxyValue={apiInfo?.proxy}
                  serviceId={serviceId!}
                  ref={proxyRef}
                />
              </Collapse>

              <Collapse title={$t('请求参数')} key="request">
                <ApiRequestEditor editorRef={requestRef} apiInfo={apiInfo?.doc} loaded={loaded} />
              </Collapse>
              <Collapse title={$t('返回值')} key="response">
                <ApiResponseEditor editorRef={responseRef} apiInfo={apiInfo?.doc} loaded={loaded} />
              </Collapse>
              <ResponseExampleCompo editorRef={resultListRef} mode="edit" title={$t('返回示例')} detail={resultList} />
            </Stack>
          </Box>
        </Box>
      </ThemeProvider>
    </>
  )
}
