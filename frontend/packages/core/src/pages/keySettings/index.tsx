import { ActionType } from '@ant-design/pro-components'
import InsidePage from '@common/components/aoplatform/InsidePage'
import PageList, { PageProColumns } from '@common/components/aoplatform/PageList'
import TableBtnWithPermission from '@common/components/aoplatform/TableBtnWithPermission'
import { BasicResponse, RESPONSE_TIPS, STATUS_CODE } from '@common/const/const'
import { useFetch } from '@common/hooks/http'
import { $t } from '@common/locales'
import AIProviderSelect from '@core/components/AIProviderSelect'
import { Divider, message, Space, Typography } from 'antd'
import React, { useEffect, useRef, useState } from 'react'
import ApiKeyModal from './components/ApiKeyModal'
import { APIKey } from './types'

const KeySettings: React.FC = () => {
  const pageListRef = useRef<ActionType>(null)
  const [selectedProvider, setSelectedProvider] = useState<string>('openai')
  const [providerName, setProviderName] = useState<string>('')
  const [modalVisible, setModalVisible] = useState(false)
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add')
  const [editingKey, setEditingKey] = useState<APIKey | null>(null)
  const [apiKeys, setApiKeys] = useState<APIKey[]>([])
  const { fetchData } = useFetch()
  const [searchWord, setSearchWord] = useState<string>('')

  useEffect(() => {
    pageListRef.current?.reload()
    fetchProviderName()
  }, [selectedProvider])

  const fetchProviderName = async () => {
    try {
      const response = await fetchData<{ code: number; data: { providers: { id: string; name: string }[] } }>(
        'simple/ai/providers',
        { method: 'GET' }
      )
      if (response.code === STATUS_CODE.SUCCESS) {
        const provider = response.data.providers.find((p) => p.id === selectedProvider)
        if (provider) {
          setProviderName(provider.name)
        }
      }
    } catch (error) {
      console.error('Failed to fetch provider name:', error)
    }
  }

  useEffect(() => {}, [])

  const handleEdit = (record: APIKey) => {
    setEditingKey(record)
    setModalMode('edit')
    setModalVisible(true)
  }

  const handleAdd = () => {
    setModalMode('add')
    setModalVisible(true)
  }

  const handleModalCancel = () => {
    setModalVisible(false)
    setEditingKey(null)
  }

  const handleSave = (values: any) => {
    if (modalMode === 'edit' && editingKey) {
      const newKeys: APIKey[] = apiKeys.map((key) =>
        key.id === editingKey.id
          ? {
              ...key,
              key: values.name,
              expire_time: values.expire_time,
              status: values.enabled ? 'normal' : 'disabled'
            }
          : key
      )
      setApiKeys(newKeys)
    } else {
      // Handle add case
      const newKey: APIKey = {
        id: String(Date.now()),
        name: values.name,
        status: 'normal',
        expire_time: values.expire_time,
        priority: apiKeys.length + 1,
        can_delete: true,
        use_token: 0,
        update_time: ''
      }
      setApiKeys([...apiKeys, newKey])
    }
    setModalVisible(false)
    setEditingKey(null)
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetchData<BasicResponse<any>>('ai/resource/key', {
        method: 'DELETE',
        eoParams: {
          provider: selectedProvider,
          id: id,
          branchID: 0
        },
        eoApiPrefix: 'http://uat.apikit.com:11204/mockApi/aoplatform/api/v1/'
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
        },
        eoApiPrefix: 'http://uat.apikit.com:11204/mockApi/aoplatform/api/v1/'
      })

      if (response.code === STATUS_CODE.SUCCESS) {
        message.success(newStatus === 'disable' ? $t('停用成功') : $t('启用成功'))
        setApiKeys(
          apiKeys.map((key) =>
            key.id === id
              ? ({
                  ...key,
                  status: newStatus === 'disable' ? 'disabled' : 'normal'
                } as APIKey)
              : (key as APIKey)
          )
        )
      } else {
        message.error(response.msg || RESPONSE_TIPS.error)
      }
    } catch (error) {
      message.error(RESPONSE_TIPS.error)
    }
  }

  const handleDragSortEnd = async (beforeIndex: number, afterIndex: number, newDataSource: APIKey[]) => {
    try {
      const response = await fetchData<BasicResponse<any>>('ai/resource/key/sort', {
        method: 'PUT',
        eoParams: {
          origin: newDataSource[beforeIndex].id,
          target: newDataSource[afterIndex].id,
          sort: afterIndex > beforeIndex ? 'before' : 'after'
        },
        eoApiPrefix: 'http://uat.apikit.com:11204/mockApi/aoplatform/api/v1/'
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
    try {
      const response = await fetchData<BasicResponse<{ data: APIKey[] }>>('ai/resource/keys', {
        method: 'GET',
        eoParams: {
          provider: selectedProvider,
          page_size: params.pageSize,
          keyword: searchWord,
          page: params.current
        },
        eoApiPrefix: 'http://uat.apikit.com:11204/mockApi/aoplatform/api/v1/'
      })

      if (response.code === STATUS_CODE.SUCCESS) {
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

        <TableBtnWithPermission
          access="system.settings.ai_key_resource.manager"
          key="delete"
          btnType="delete"
          onClick={() => handleDelete(entity.id)}
          btnTitle={$t('删除')}
        />
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
        return entity.expire_time === '0' ? $t('永不过期') : entity.expire_time
      }
    },
    ...operation
  ]

  return (
    <InsidePage
      className="overflow-y-auto gap-4 pb-PAGE_INSIDE_B pr-PAGE_INSIDE_X"
      pageTitle={$t('APIKey 资源池')}
      description={
        <>
          {$t('支持单个 API 模型供应商下创建多个 APIKey APIKey 进行智能负载均衡')}
          <div className="mt-4">
            <AIProviderSelect value={selectedProvider} onChange={setSelectedProvider} />
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
          searchPlaceholder={$t('请输入名称搜索')}
          columns={columns}
          dragSortKey="drag"
          onDragSortEnd={handleDragSortEnd}
          addNewBtnTitle={$t('添加 APIKey')}
          onAddNewBtnClick={handleAdd}
        />
        <ApiKeyModal
          visible={modalVisible}
          mode={modalMode}
          onCancel={handleModalCancel}
          onSave={handleSave}
          providerName={providerName}
          initialValues={
            editingKey
              ? {
                  id: editingKey.id,
                  name: editingKey.name,
                  expire_time: editingKey.expire_time
                }
              : undefined
          }
          defaultKeyNumber={apiKeys.length + 1}
        />
      </div>
    </InsidePage>
  )
}

export default KeySettings
