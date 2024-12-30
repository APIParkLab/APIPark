import { ActionType } from '@ant-design/pro-components'
import InsidePage from '@common/components/aoplatform/InsidePage'
import PageList, { PageProColumns } from '@common/components/aoplatform/PageList'
import TableBtnWithPermission from '@common/components/aoplatform/TableBtnWithPermission'
import { BasicResponse, RESPONSE_TIPS, STATUS_CODE } from '@common/const/const'
import { useGlobalContext } from '@common/contexts/GlobalStateContext'
import { useFetch } from '@common/hooks/http'
import { $t } from '@common/locales'
import AIProviderSelect, { AIProvider } from '@core/components/AIProviderSelect'
import { App, Divider, Space, Typography } from 'antd'
import dayjs from 'dayjs'
import React, { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { APIKey } from './types'

const KeySettings: React.FC = () => {
  const pageListRef = useRef<ActionType>(null)
  const { modal, message } = App.useApp()
  const [searchParams] = useSearchParams()
  const [selectedProvider, setSelectedProvider] = useState<string>(searchParams.get('modelId') || '')
  const [provider, setProvider] = useState<AIProvider | undefined>()
  const [apiKeys, setApiKeys] = useState<APIKey[]>([])
  const { fetchData } = useFetch()
  const [searchWord, setSearchWord] = useState<string>('')
  const [total, setTotal] = useState<number>(0)
  const modalRef = useRef<any>()
  const { accessData } = useGlobalContext()

  useEffect(() => {
    pageListRef.current?.reload()
  }, [selectedProvider])

  const handleEdit = (record: APIKey) => {}

  const handleAdd = () => {}

  const handleDelete = async (id: string) => {
    try {
      const response = await fetchData<BasicResponse<any>>('ai/resource/key', {
        method: 'DELETE',
        eoParams: {
          provider: selectedProvider,
          id: id,
          branchID: 0
        }
        // eoApiPrefix: 'http://uat.apikit.com:11204/mockApi/aoplatform/api/v1/'
      })

      if (response.code === STATUS_CODE.SUCCESS) {
        message.success($t('删除成功'))
        pageListRef.current?.reload()
      } else {
        message.error(response.msg || RESPONSE_TIPS.error)
      }
    } catch (error) {
      message.error(RESPONSE_TIPS.error)
    }
  }

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'normal' ? 'disable' : 'enable'
      const response = await fetchData<BasicResponse<any>>(`ai/resource/key/${newStatus}`, {
        method: 'PUT',
        eoParams: {
          provider: selectedProvider,
          id: id
        }
        // eoApiPrefix: 'http://uat.apikit.com:11204/mockApi/aoplatform/api/v1/'
      })

      if (response.code === STATUS_CODE.SUCCESS) {
        message.success(newStatus === 'disable' ? $t('停用成功') : $t('启用成功'))
        pageListRef.current?.reload()
      } else {
        message.error(response.msg || RESPONSE_TIPS.error)
      }
    } catch (error) {
      message.error(RESPONSE_TIPS.error)
    }
  }

  const handleDragSortEnd = async (beforeIndex: number, afterIndex: number, newDataSource: APIKey[]) => {
    console.log(beforeIndex, afterIndex, newDataSource)
    try {
      const response = await fetchData<BasicResponse<any>>('ai/resource/key/sort', {
        method: 'PUT',
        eoParams: {
          origin: newDataSource[beforeIndex].id,
          target: newDataSource[afterIndex].id,
          sort: afterIndex > beforeIndex ? 'before' : 'after'
        }
        // eoApiPrefix: 'http://uat.apikit.com:11204/mockApi/aoplatform/api/v1/'
      })

      if (response.code === STATUS_CODE.SUCCESS) {
        message.success($t('排序成功'))
        pageListRef.current?.reload()
      } else {
        message.error(response.msg || RESPONSE_TIPS.error)
      }
    } catch (error) {
      message.error(RESPONSE_TIPS.error)
    }
  }

  const requestApiKeys = async (params: any) => {
    if (!selectedProvider) return
    try {
      const response = await fetchData<BasicResponse<{ data: APIKey[] }>>('ai/resource/keys', {
        method: 'GET',
        eoParams: {
          provider: selectedProvider,
          page_size: params.pageSize,
          keyword: searchWord,
          page: params.current
        }
        // eoApiPrefix: 'http://uat.apikit.com:11204/mockApi/aoplatform/api/v1/'
      })

      if (response.code === STATUS_CODE.SUCCESS) {
        setTotal(response.data.total)
        return {
          data: response.data.keys,
          success: true,
          total: response.data.total
        }
      } else {
        message.error(response.msg || $t(RESPONSE_TIPS.error))
        return {
          data: [],
          success: false,
          total: response.data.total
        }
      }
    } catch (error) {
      return {
        data: [],
        success: false,
        total: 0
      }
    }
  }
  const statusEnum = {
    normal: { text: <Typography.Text type="success">{$t('正常')}</Typography.Text> },
    exceeded: { text: <Typography.Text type="warning">{$t('超额')}</Typography.Text> },
    expired: { text: <Typography.Text type="secondary">{$t('过期')}</Typography.Text> },
    disabled: { text: <Typography.Text type="warning">{$t('停用')}</Typography.Text> },
    error: { text: <Typography.Text type="danger">{$t('错误')}</Typography.Text> }
  }

  const operation: PageProColumns<APIKey>[] = [
    {
      title: '',
      key: 'option',
      btnNums: 4,
      fixed: 'right',
      valueType: 'option',
      render: (_: React.ReactNode, entity: APIKey) => [
        <TableBtnWithPermission
          access="system.settings.ai_key_resource.manager"
          key="edit"
          btnType="edit"
          onClick={() => handleEdit(entity)}
          btnTitle={$t('编辑')}
        />,
        <Divider type="vertical" className="mx-0" key="div1" />,
        entity.status !== 'expired' && entity.status !== 'error' && (
          <>
            <TableBtnWithPermission
              access="system.settings.ai_key_resource.manager"
              key="toggle"
              btnType={entity.status === 'normal' ? 'disable' : 'enable'}
              onClick={() => handleToggleStatus(entity.id, entity.status)}
              btnTitle={entity.status === 'normal' ? $t('停用') : $t('启用')}
            />
            <Divider type="vertical" className="mx-0" key="div2" />
          </>
        ),
        entity.can_delete !== false && (
          <TableBtnWithPermission
            access="system.settings.ai_key_resource.manager"
            key="delete"
            btnType="delete"
            onClick={() => handleDelete(entity.id as string)}
            btnTitle={$t('删除')}
          />
        )
      ]
    }
  ]

  const columns: PageProColumns<APIKey>[] = [
    {
      title: '',
      dataIndex: 'drag',
      width: '40px'
    },
    {
      title: $t('调用优先级'),
      dataIndex: 'priority',
      width: '100px'
    },
    {
      title: $t('名称'),
      dataIndex: 'name',
      render: (dom: React.ReactNode, entity: APIKey) => <Space>{entity.name}</Space>
    },
    {
      title: $t('状态'),
      dataIndex: 'status',
      ellipsis: true,
      valueType: 'select',
      filters: true,
      onFilter: true,
      valueEnum: statusEnum,
      render: (dom: React.ReactNode, entity: APIKey) => statusEnum[entity.status]?.text || entity.status
    },
    {
      title: $t('已用 Token'),
      dataIndex: 'use_token',
      render: (dom: React.ReactNode, entity: APIKey) => {
        const value = entity.use_token
        return value.toLocaleString()
      }
    },
    {
      title: $t('编辑时间'),
      dataIndex: 'update_time'
    },
    {
      title: $t('过期时间'),
      dataIndex: 'expire_time',
      render: (dom: React.ReactNode, entity: APIKey) => {
        return entity.expire_time === 0
          ? $t('永不过期')
          : dayjs(Number(entity.expire_time)).format('YYYY-MM-DD HH:mm:ss')
      }
    },
    ...operation
  ]

  return (
    <InsidePage
      className="overflow-y-auto gap-4 pb-PAGE_INSIDE_B pr-PAGE_INSIDE_X"
      pageTitle={$t('AI API 列表')}
      description={
        <>
          {$t('支持查看调用某个 AI 供应商的所有 AI 服务 API 清单')}
          <div className="mt-4">
            <AIProviderSelect
              value={selectedProvider}
              onChange={(value: string, provider: AIProvider) => {
                setSelectedProvider(value)
                setProvider(provider)
              }}
            />
          </div>
        </>
      }
      showBorder={false}
      scrollPage={false}
    >
      <div className="h-[calc(100%-1rem-36px)]">
        <PageList
          ref={pageListRef}
          rowKey="id"
          request={requestApiKeys}
          onSearchWordChange={(e) => {
            setSearchWord(e.target.value)
          }}
          showPagination={true}
          searchPlaceholder={$t('请输入 APIURL 搜索')}
          columns={columns}
          dragSortKey="drag"
          onDragSortEnd={handleDragSortEnd}
          addNewBtnTitle={$t('添加 APIKey')}
          onAddNewBtnClick={handleAdd}
        />
      </div>
    </InsidePage>
  )
}

export default KeySettings
