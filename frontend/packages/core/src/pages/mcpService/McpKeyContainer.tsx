import InsidePage from '@common/components/aoplatform/InsidePage'
import { IconButton } from '@common/components/postcat/api/IconButton'
import { $t } from '@common/locales/index.ts'
import { Button, Card, App } from 'antd'
import { useFetch } from '@common/hooks/http'
import { BasicResponse, RESPONSE_TIPS, STATUS_CODE } from '@common/const/const'
import { useEffect, useRef, useState } from 'react'
import AddMcpKey, { addMcpKeysHandle } from './AddMcpKey'
import { useGlobalContext } from '@common/contexts/GlobalStateContext'

const McpKeyContainer = () => {
  const { fetchData } = useFetch()
  const { message, modal } = App.useApp()
  const [keys, setKeys] = useState<any[]>([])
  const [, forceUpdate] = useState<unknown>(null)
  const { state } = useGlobalContext()
  const addMcpKeyModalRef = useRef<addMcpKeysHandle>(null)

  /**
   * 新增 API Key
   */
  const addKey = () => {
    modal.confirm({
      title: $t('新增 API Key'),
      content: <AddMcpKey ref={addMcpKeyModalRef}></AddMcpKey>,
      onOk: () => {
        return addMcpKeyModalRef.current?.save().then((res) => {
          if (res) {
            getKeysList()
          }
        })
      },
      width: 600,
      okText: $t('确认'),
      cancelText: $t('取消'),
      closable: true,
      icon: <></>
    })
  }

  /**
   * 获取 API Key 列表
   */
  const getKeysList = () => {
    fetchData<BasicResponse<null>>('system/apikeys', {
      method: 'GET'
    })
      .then((response) => {
        const { code, msg, data } = response
        if (code === STATUS_CODE.SUCCESS) {
          setKeys(data.apikeys || [])
        } else {
          message.error(msg || $t(RESPONSE_TIPS.error))
        }
      })
      .catch((errorInfo) => {
        message.error(errorInfo || $t(RESPONSE_TIPS.error))
      })
  }

  /**
   * 复制 API Key
   */
  const copyCode = async (value: string): Promise<void> => {
    if (value) {
      await navigator.clipboard.writeText(value)
      message.success($t(RESPONSE_TIPS.copySuccess))
    }
  }

  /**
   * 删除 API Key
   */
  const deleteKey = (id: string) => {
    modal.confirm({
      title: $t('删除'),
      content: $t('确定删除吗？'),
      onOk: async () => {
        try {
          const response = await fetchData<BasicResponse<'success'>>('system/apikey', {
            method: 'DELETE',
            eoParams: { apikey: id }
          })
          if (response.code === STATUS_CODE.SUCCESS) {
            message.success($t('删除成功'))
            getKeysList()
          }
        } catch (error) {
          message.error($t('删除失败'))
        }
      },
      width: 600,
      okText: $t('确认'),
      cancelText: $t('取消'),
      closable: true,
      icon: <></>
    })
  }

  /**
   * 编辑 API Key
   */
  const editKey = (key: any) => {
    modal.confirm({
      title: $t('编辑'),
      content: (
        <AddMcpKey ref={addMcpKeyModalRef} name={key.name} value={key.value} apikey={key.id} type={'edit'}></AddMcpKey>
      ),
      onOk: () => {
        return addMcpKeyModalRef.current?.save().then((res) => {
          if (res) {
            getKeysList()
          }
        })
      },
      width: 600,
      okText: $t('确认'),
      cancelText: $t('取消'),
      closable: true,
      icon: <></>
    })
  }

  useEffect(() => {
    getKeysList()
  }, [])
  useEffect(() => {
    forceUpdate({})
  }, [state.language])
  return (
    <>
      <InsidePage
        pageTitle={$t('API Key')}
        description={$t('API 密钥可用于调用系统级 Open API 和 MCP。')}
        showBorder={false}
        scrollPage={false}
      >
        <Button type="primary" onClick={addKey}>
          {$t('新增 API Key')}
        </Button>
        <div className="api-key-container mt-[20px]">
          {keys.map((key, index) => (
            <Card style={{ width: 600, borderRadius: '10px' }} key={index} className="mt-[10px]">
              <div className="flex">
                <div className="flex-1">
                  <p className="text-[14px] font-bold">{key.name}</p>
                  <div className="flex">
                    <span className="h-[26px] leading-[28px]">{key.value}</span>
                    <IconButton
                      name="copy"
                      onClick={() => {
                        copyCode(key?.value)
                      }}
                      sx={{
                        color: '#333',
                        transition: 'none',
                        '&.MuiButtonBase-root:hover': {
                          background: 'transparent',
                          color: '#3D46F2',
                          transition: 'none'
                        }
                      }}
                    ></IconButton>
                  </div>
                </div>
                <div className="w-[30px] flex justify-center items-center">
                  <IconButton
                    name="edit"
                    onClick={() => {
                      editKey(key)
                    }}
                    sx={{
                      color: '#333',
                      transition: 'none',
                      '&.MuiButtonBase-root:hover': { background: 'transparent', color: '#3D46F2', transition: 'none' }
                    }}
                  ></IconButton>
                  <IconButton
                    name="delete"
                    onClick={() => {
                      deleteKey(key.id)
                    }}
                    sx={{
                      color: '#333',
                      transition: 'none',
                      '&.MuiButtonBase-root:hover': { background: 'transparent', color: 'red', transition: 'none' }
                    }}
                  ></IconButton>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </InsidePage>
    </>
  )
}

export default McpKeyContainer
