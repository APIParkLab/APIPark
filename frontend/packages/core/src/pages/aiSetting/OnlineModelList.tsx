import { ActionType } from '@ant-design/pro-components'
import PageList, { PageProColumns } from '@common/components/aoplatform/PageList'
import TableBtnWithPermission from '@common/components/aoplatform/TableBtnWithPermission'
import { BasicResponse, RESPONSE_TIPS, STATUS_CODE } from '@common/const/const'
import { useFetch } from '@common/hooks/http'
import { $t } from '@common/locales'
import { App, Divider, Space, Typography } from 'antd'
import React, { useRef, useState } from 'react'
import { useAiSetting } from './contexts/AiSettingContext'
import { AiSettingListItem, ModelListData } from './types'

const OnlineModelList: React.FC = () => {
  const pageListRef = useRef<ActionType>(null)
  const { message } = App.useApp()
  const { fetchData } = useFetch()
  const [searchWord, setSearchWord] = useState<string>('')
  const [total, setTotal] = useState<number>(0)
  const { openConfigModal } = useAiSetting()

  const handleEdit = (record: ModelListData) => {
    openConfigModal({ id: record.id, defaultLlm: record.defaultLlm } as AiSettingListItem)
  }

  const handleAdd = () => {
    openConfigModal()
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetchData<BasicResponse<any>>('ai/resource/key', {
        method: 'DELETE',
        eoParams: {
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

  const requestList = async (params: any) => {
    try {
      const response = await fetchData<BasicResponse<{ data: ModelListData[] }>>('ai/providers/configured', {
        method: 'GET',
        eoParams: {
          page_size: params.pageSize,
          keyword: searchWord,
          page: params.current
        },
        eoTransformKeys: ['default_llm']
        // eoApiPrefix: 'http://uat.apikit.com:11204/mockApi/aoplatform/api/v1/'
      })

      if (response.code === STATUS_CODE.SUCCESS) {
        console.log(response)
        setTotal(response.data.total)
        return {
          data: response.data.providers,
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
    enabled: { text: <Typography.Text type="success">{$t('正常')}</Typography.Text> },
    disabled: { text: <Typography.Text type="warning">{$t('停用')}</Typography.Text> },
    abnormal: { text: <Typography.Text type="danger">{$t('异常')}</Typography.Text> }
  }

  const operation: PageProColumns<ModelListData>[] = [
    {
      title: '',
      key: 'option',
      btnNums: 4,
      fixed: 'right',
      valueType: 'option',
      render: (_: React.ReactNode, entity: ModelListData) => [
        <TableBtnWithPermission
          access="system.devops.ai_provider.edit"
          key="edit"
          btnType="edit"
          onClick={() => handleEdit(entity)}
          btnTitle={$t('设置')}
        />,
        <Divider type="vertical" className="mx-0" />,
        <TableBtnWithPermission
          access="system.devops.ai_provider.edit"
          key="delete"
          btnType="delete"
          onClick={() => handleDelete(entity.id as string)}
          btnTitle={$t('删除')}
        />
      ]
    }
  ]

  const columns: PageProColumns<ModelListData>[] = [
    {
      title: $t('名称'),
      dataIndex: 'name',
      render: (dom: React.ReactNode, entity: ModelListData) => <Space>{entity.name}</Space>
    },
    {
      title: $t('状态'),
      dataIndex: 'status',
      ellipsis: true,
      valueType: 'select',
      filters: true,
      onFilter: true,
      valueEnum: statusEnum,
      render: (dom: React.ReactNode, entity: ModelListData) => statusEnum[entity.status]?.text || entity.status
    },
    {
      title: $t('默认模型'),
      dataIndex: 'defaultLlm'
    },
    {
      title: $t('Apis'),
      dataIndex: 'api_count'
    },
    {
      title: $t('Keys'),
      dataIndex: 'key_count'
    },
    ...operation
  ]

  return (
    <PageList
      ref={pageListRef}
      rowKey="id"
      request={requestList}
      onSearchWordChange={(e) => {
        setSearchWord(e.target.value)
        pageListRef.current?.reload()
      }}
      showPagination={true}
      searchPlaceholder={$t('请输入名称搜索')}
      columns={columns}
      dragSortKey="drag"
      addNewBtnTitle={$t('添加模型')}
      onAddNewBtnClick={handleAdd}
    />
  )
}

export default OnlineModelList
