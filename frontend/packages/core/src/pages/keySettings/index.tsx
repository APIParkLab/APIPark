import { ActionType, ProColumns } from '@ant-design/pro-components'
import InsidePage from '@common/components/aoplatform/InsidePage'
import PageList, { PageProColumns } from '@common/components/aoplatform/PageList'
import TableBtnWithPermission from '@common/components/aoplatform/TableBtnWithPermission'
import { BasicResponse, RESPONSE_TIPS, STATUS_CODE } from '@common/const/const'
import { useFetch } from '@common/hooks/http'
import { $t } from '@common/locales'
import { Divider, message, Select, Space, Typography } from 'antd'
import React, { useEffect, useRef, useState } from 'react'
import ApiKeyModal from './components/ApiKeyModal'
import StatusFilter from './components/StatusFilter'

interface APIKey {
  id: string
  name: string
  status: 'normal' | 'exceeded' | 'expired' | 'disabled' | 'error'
  use_token: number
  update_time: string
  expire_time: string
  can_delete: string
  priority: number
}

const KeySettings: React.FC = () => {
  const actionRef = useRef<ActionType>()
  const [selectedProvider, setSelectedProvider] = useState<string>('openai')
  const [statusFilter, setStatusFilter] = useState<string[]>([])
  const [modalVisible, setModalVisible] = useState(false)
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add')
  const [editingKey, setEditingKey] = useState<APIKey | null>(null)
  const [apiKeys, setApiKeys] = useState<APIKey[]>([])
  const { fetchData } = useFetch()

  useEffect(() => {
    fetchData<BasicResponse<{ data: APIKey[] }>>('ai/resource/keys', {
      method: 'GET',
      eoApiPrefix: 'http://uat.apikit.com:11204/mockApi/aoplatform/api/v1/'
    }).then((response) => {
      const { code, data, msg } = response
      if (code === STATUS_CODE.SUCCESS) {
        setApiKeys(data.keys)
      } else {
        message.error(msg || $t(RESPONSE_TIPS.error))
      }
    })
  }, [])

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
      const newKeys = apiKeys.map((key) =>
        key.id === editingKey.id
          ? {
              ...key,
              key: values.apiKey,
              expirationDate: values.expirationDate,
              status: values.enabled ? 'normal' : 'disabled'
            }
          : key
      )
      setApiKeys(newKeys)
    } else {
      // Handle add case
      const newKey = {
        id: String(Date.now()),
        key: values.apiKey,
        status: 'normal',
        expirationDate: values.expirationDate,
        priority: apiKeys.length + 1,
        isDefault: apiKeys.length === 0
      }
      setApiKeys([...apiKeys, newKey])
    }
    setModalVisible(false)
    setEditingKey(null)
  }

  const handleDelete = (id: string) => {
    setApiKeys(apiKeys.filter((key) => key.id !== id))
  }

  const handleDragSortEnd = async (beforeIndex: number, afterIndex: number, newDataSource: APIKey[]) => {
    setApiKeys(
      newDataSource.map((item, index) => ({
        ...item,
        priority: index + 1
      }))
    )
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
      btnNums: 3,
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
        <Divider type="vertical" className="mx-0" key="div3" />,
        <TableBtnWithPermission
          access="system.settings.ai_key_resource.manager"
          key="delete"
          btnType="delete"
          onClick={() => handleDelete(entity.id)}
          btnTitle={$t('删除')}
        />
        // <Tooltip title={$t('编辑')}>
        //   <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(entity)} />
        // </Tooltip>,
        // entity.can_delete && (
        //   <Tooltip title={$t('删除')}>
        //     <Button type="text" icon={<DeleteOutlined />} danger onClick={() => handleDelete(entity.id)} />
        //   </Tooltip>
        // )
      ]
    }
  ]

  const columns: ProColumns<APIKey>[] = [
    {
      title: $t('调用优先级'),
      dataIndex: 'priority',
      width: '100px'
    },
    {
      title: $t('名称'),
      dataIndex: 'name',
      render: (text: string, record: APIKey) => <Space>{text}</Space>
    },
    {
      title: $t('状态'),
      dataIndex: 'status',
      ellipsis: true,
      valueType: 'select',
      filters: true,
      onFilter: true,
      valueEnum: statusEnum,
      render: (status: APIKey['status']) => statusEnum[status]?.text || status
    },
    {
      title: $t('已用 Token'),
      dataIndex: 'use_token',
      render: (value: number) => value.toLocaleString()
    },
    {
      title: $t('编辑时间'),
      dataIndex: 'update_time'
    },
    {
      title: $t('过期时间'),
      dataIndex: 'expire_time',
      render: (expireTime: string) => (expireTime === '0' ? $t('永不过期') : expireTime)
    },
    ...operation
  ]

  const beforeSearchNode = [
    <Select
      key="provider"
      value={selectedProvider}
      onChange={setSelectedProvider}
      style={{ width: 200 }}
      options={[
        { label: 'OpenAI', value: 'openai' },
        { label: 'Anthropic', value: 'anthropic' }
      ]}
    />,
    <StatusFilter key="status" value={statusFilter} onChange={setStatusFilter} />
  ]

  return (
    <InsidePage
      className="overflow-y-auto pb-PAGE_INSIDE_B pr-PAGE_INSIDE_X"
      pageTitle={$t('APIKey 资源池')}
      description={$t('支持单个 API 模型供应商下创建多个 APIKey，并可对多个 APIkey 进行智能负载均衡')}
      showBorder={false}
      scrollPage={false}
    >
      <PageList
        actionRef={actionRef}
        rowKey="id"
        request={async (params) => {
          try {
            const response = await fetchData<BasicResponse<{ data: APIKey[] }>>('ai/resource/keys', {
              method: 'GET',
              eoParams: {
                provider: selectedProvider,
                status: statusFilter,
                ...params
              },
              eoApiPrefix: 'http://uat.apikit.com:11204/mockApi/aoplatform/api/v1/'
            })

            if (response.code === STATUS_CODE.SUCCESS) {
              return {
                data: response.data.keys,
                success: true,
                total: response.data.keys.length
              }
            } else {
              message.error(response.msg || $t(RESPONSE_TIPS.error))
              return {
                data: [],
                success: false,
                total: 0
              }
            }
          } catch (error) {
            return {
              data: [],
              success: false,
              total: 0
            }
          }
        }}
        columns={columns}
        search={false}
        dragSortKey="sort"
        onDragSortEnd={handleDragSortEnd}
        beforeSearchNode={beforeSearchNode}
        addNewBtnTitle={$t('添加 APIKey')}
        onAddNewBtnClick={handleAdd}
      />

      <ApiKeyModal
        visible={modalVisible}
        mode={modalMode}
        onCancel={handleModalCancel}
        onSave={handleSave}
        vendorName={selectedProvider}
        initialValues={
          editingKey
            ? {
                keyName: editingKey.key,
                apiKey: editingKey.key,
                expirationDate: editingKey.expirationDate,
                enabled: editingKey.status === 'normal'
              }
            : undefined
        }
        defaultKeyNumber={apiKeys.length + 1}
      />
    </InsidePage>
  )
}

export default KeySettings
