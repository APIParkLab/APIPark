import { DeleteOutlined, EditOutlined } from '@ant-design/icons'
import { ActionType } from '@ant-design/pro-components'
import InsidePage from '@common/components/aoplatform/InsidePage'
import PageList from '@common/components/aoplatform/PageList'
import { BasicResponse, RESPONSE_TIPS, STATUS_CODE } from '@common/const/const'
import { useFetch } from '@common/hooks/http'
import { $t } from '@common/locales'
import { Badge, Button, message, Select, Space, Tooltip } from 'antd'
import React, { useEffect, useRef, useState } from 'react'
import EditKeyModal from './components/EditKeyModal'
import StatusFilter from './components/StatusFilter'

interface APIKey {
  id: string
  key: string
  status: 'normal' | 'exceeded' | 'expired' | 'disabled' | 'error'
  expirationDate: string
  priority: number
  isDefault: boolean
}

const KeySettings: React.FC = () => {
  const actionRef = useRef<ActionType>()
  const [selectedProvider, setSelectedProvider] = useState<string>('openai')
  const [statusFilter, setStatusFilter] = useState<string[]>([])
  const [editModalVisible, setEditModalVisible] = useState(false)
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

  const statusColors = {
    normal: '#52c41a',
    exceeded: '#ff4d4f',
    expired: '#faad14',
    disabled: '#d9d9d9',
    error: '#ff4d4f'
  }

  const handleEdit = (record: APIKey) => {
    setEditingKey(record)
    setEditModalVisible(true)
  }

  const handleSave = (values: any) => {
    if (editingKey) {
      const newKeys = apiKeys.map((key) =>
        key.id === editingKey.id
          ? {
              ...key,
              key: values.key,
              expirationDate: values.expirationDate,
              status: values.enabled ? 'normal' : 'disabled'
            }
          : key
      )
      setApiKeys(newKeys)
    }
    setEditModalVisible(false)
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

  const columns = [
    {
      title: $t('API Key'),
      dataIndex: 'key',
      render: (text: string, record: APIKey) => (
        <Space>
          {text}
          {record.isDefault && <Badge count={$t('Default')} style={{ backgroundColor: statusColors.normal }} />}
        </Space>
      )
    },
    {
      title: $t('状态'),
      dataIndex: 'status',
      render: (status: keyof typeof statusColors) => (
        <Badge
          status="processing"
          text={status.charAt(0).toUpperCase() + status.slice(1)}
          style={{ color: statusColors[status] }}
        />
      )
    },
    {
      title: $t('过期时间'),
      dataIndex: 'expirationDate'
    },
    {
      title: $t('优先级'),
      dataIndex: 'priority'
    },
    {
      title: $t('操作'),
      key: 'actions',
      render: (_: unknown, record: APIKey) => (
        <Space>
          <Tooltip title={$t('Edit')}>
            <Button
              type="text"
              icon={<EditOutlined />}
              disabled={record.isDefault}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title={$t('Delete')}>
            <Button
              type="text"
              icon={<DeleteOutlined />}
              disabled={record.isDefault}
              danger
              onClick={() => handleDelete(record.id)}
            />
          </Tooltip>
        </Space>
      ),
      width: 120,
      btnNums: 2
    }
  ]

  // const filteredKeys = statusFilter.length > 0 ? apiKeys.filter((key) => statusFilter.includes(key.status)) : apiKeys
  const filteredKeys = apiKeys

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
      className="overflow-y-auto pb-PAGE_INSIDE_B"
      pageTitle={$t('APIKey 资源池')}
      description={$t('支持单个 API 模型供应商下创建多个 APIKey，并可对多个 APIKEY 进行智能负载均衡')}
      showBorder={false}
      scrollPage={false}
    >
      <PageList
        actionRef={actionRef}
        columns={columns}
        dataSource={filteredKeys}
        dragSortKey="sort"
        onDragSortEnd={handleDragSortEnd}
        beforeSearchNode={beforeSearchNode}
        addNewBtnTitle={$t('添加 API Key')}
        onAddNewBtnClick={() => {
          setEditingKey(null)
          setEditModalVisible(true)
        }}
        rowKey="id"
      />

      <EditKeyModal
        visible={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false)
          setEditingKey(null)
        }}
        onSave={handleSave}
        initialValues={
          editingKey
            ? {
                key: editingKey.key,
                expirationDate: editingKey.expirationDate,
                enabled: editingKey.status !== 'disabled'
              }
            : undefined
        }
      />
    </InsidePage>
  )
}

export default KeySettings
