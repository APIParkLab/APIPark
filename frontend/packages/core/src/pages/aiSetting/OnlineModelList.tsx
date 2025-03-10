import { ActionType } from '@ant-design/pro-components'
import PageList, { PageProColumns } from '@common/components/aoplatform/PageList'
import TableBtnWithPermission from '@common/components/aoplatform/TableBtnWithPermission'
import { BasicResponse, RESPONSE_TIPS, STATUS_CODE } from '@common/const/const'
import { useFetch } from '@common/hooks/http'
import { $t } from '@common/locales'
import { App, Divider, Modal, Space, Typography } from 'antd'
import React, { useRef, useState } from 'react'
import { AISettingEntityItem, ModelListData } from './types'
import { DrawerWithFooter } from '@common/components/aoplatform/DrawerWithFooter'
import AiSettingModalContent, { AiSettingModalContentHandle } from './AiSettingModal'
import { checkAccess } from '@common/utils/permission'
import { useGlobalContext } from '@common/contexts/GlobalStateContext'
import ModelsDetailTable from './contexts/ModelsDetailTable'
import { Icon } from '@iconify/react/dist/iconify.js'

const OnlineModelList: React.FC = () => {
  const pageListRef = useRef<ActionType>(null)
  const { message, modal } = App.useApp()
  const { fetchData } = useFetch()
  const [searchWord, setSearchWord] = useState<string>('')
  const [total, setTotal] = useState<number>(0)
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false)
  const drawerFormRef = useRef<AiSettingModalContentHandle>(null)
  const [entity, setEntity] = useState<AISettingEntityItem>()
  const [footerLeft, setFooterLeft] = useState<React.ReactNode>()
  const { aiConfigFlushed, setAiConfigFlushed, accessData } = useGlobalContext()
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedProviderID, setSelectedProviderID] = useState('')
  const [selectedProviderName, setSelectedProviderName] = useState('')
  const [showDrawerFooterLeft, setShowDrawerFooterLeft] = useState(false)

  const handleEdit = (record: ModelListData) => {
    setEntity({
      id: record.id,
      defaultLlm: record.defaultLlm
    })
    setDrawerOpen(true)
  }

  const handleDelete = async (id: string, apiCount: number) => {
    modal.confirm({
      title: $t('删除模型'),
      content: `${$t('有')} ${apiCount} ${$t('个API使用当前模型，删除当前的模型配置后，该模型相关的API将会切换为使用负载均衡中优先级最高的可用模型。并且当前模型下的所有API KEY和相关数据将会被清空，是否确认删除当前模型？')}`,
      onOk: () => {
        return new Promise((resolve, reject) => {
          try {
            fetchData<BasicResponse<any>>('ai/provider', {
              method: 'DELETE',
              eoParams: {
                provider: id
              }
            })
              .then((response) => {
                if (response.code === STATUS_CODE.SUCCESS) {
                  message.success($t('删除成功'))
                  pageListRef.current?.reload()
                } else {
                  message.error(response.msg || RESPONSE_TIPS.error)
                }
                resolve(true)
              })
              .catch((error) => {
                message.error(RESPONSE_TIPS.error)
                resolve(true)
              })
          } catch (error) {
            message.error(RESPONSE_TIPS.error)
            resolve(true)
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

  const requestList = async (params: any) => {
    try {
      const response = await fetchData<BasicResponse<{ data: ModelListData[] }>>('ai/providers/configured', {
        method: 'GET',
        eoParams: {
          page_size: params.pageSize,
          keyword: searchWord,
          page: params.current
        },
        eoTransformKeys: ['default_llm', 'api_count', 'key_count', 'model_count', 'can_delete']
      })

      if (response.code === STATUS_CODE.SUCCESS) {
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

  // 更新抽屉底部
  const updateEntityData = (data: any) => {
    // 0 常规，1 自定义
      setShowDrawerFooterLeft(!data.type)
    setFooterLeft(
      <a target="_blank" rel="noopener noreferrer" href={data?.getApikeyUrl} className="flex items-center gap-[8px]">
        <span>{$t('从 (0) 获取 API KEY', [data?.name])}</span>
        <Icon icon="ic:baseline-open-in-new" width={16} height={16} />
      </a>
    )
  }

  /**
   * 打开模型详情
   * @param e
   * @param record
   */
  const openModelsModal = (e: any, record: ModelListData) => {
    e.stopPropagation()
    setSelectedProviderID(record.id as string)
    setSelectedProviderName(record.name)
    setModalVisible(true)
  }
  const handleCloseModal = () => {
    setModalVisible(false);
  };

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
          disabled={!entity?.canDelete}
          tooltip={$t('当前模型为最后一个模型，不支持删除')}
          btnType="delete"
          onClick={() => handleDelete(entity.id as string, entity.apiCount)}
          btnTitle={$t('删除')}
        />
      ]
    }
  ]

  const columns: PageProColumns<ModelListData>[] = [
    {
      title: $t('供应商名称'),
      dataIndex: 'name',
      render: (dom: React.ReactNode, entity: ModelListData) => <Space>{entity.name}</Space>
    },
    {
      title: $t('状态'),
      dataIndex: 'status',
      ellipsis: true,
      valueType: 'select',
      // filters: true,
      // onFilter: true,
      valueEnum: statusEnum,
      render: (dom: React.ReactNode, entity: ModelListData) => statusEnum[entity.status]?.text || entity.status
    },
    {
      title: $t('默认模型'),
      ellipsis: true,
      dataIndex: 'defaultLlm'
    },
    {
      title: $t('Models'),
      dataIndex: 'modelCount',
      render: (dom: React.ReactNode, record: ModelListData) => (
        <span className="text-[#2196f3] cursor-pointer" onClick={(e) => openModelsModal(e, record)}>
          {record.modelCount || '0'}
        </span>
      )
    },
    {
      title: $t('Apis'),
      dataIndex: 'apiCount',
      render: (dom: React.ReactNode, record: ModelListData) => (
        <span className="[&>.key-link]:text-[#2196f3] cursor-pointer">
          <a
            href={`/aiApis?modelId=${record?.id}`}
            target="_blank"
            className="key-link"
            style={{
              fontWeight: 500,
              cursor: 'pointer',
              pointerEvents: 'all',
              textDecoration: 'none'
            }}
          >
            {record.apiCount || '0'}
          </a>
        </span>
      )
    },
    {
      title: $t('Keys'),
      dataIndex: 'keyCount',
      render: (dom: React.ReactNode, record: ModelListData) => (
        <span className="[&>.key-link]:text-[#2196f3] cursor-pointer">
          <a
            href={`/keysetting?modelId=${record?.id}`}
            target="_blank"
            className="key-link"
            style={{
              fontWeight: 500,
              cursor: 'pointer',
              pointerEvents: 'all',
              textDecoration: 'none'
            }}
          >
            {record.keyCount || '0'}
          </a>
        </span>
      )
    },
    ...operation
  ]

  return (
    <>
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
        addNewBtnAccess="system.devops.ai_provider.edit"
        addNewBtnTitle={$t('添加供应商')}
        onAddNewBtnClick={() => setDrawerOpen(true)}
      />
      <DrawerWithFooter
        title={entity ? $t('编辑供应商') : $t('添加供应商')}
        open={drawerOpen}
        width="30%"
        onClose={() => {
          setEntity(undefined)
          setDrawerOpen(false)
        }}
        onSubmit={() =>
          drawerFormRef.current?.save()?.then((res) => {
            res && pageListRef.current?.reload()
            setAiConfigFlushed(!aiConfigFlushed)
            setEntity(undefined)
            return res
          })
        }
        footerLeft={showDrawerFooterLeft ? footerLeft : undefined}
        submitAccess=""
      >
        <AiSettingModalContent
          ref={drawerFormRef}
          entity={{ id: entity?.id, defaultLlm: entity?.defaultLlm }}
          modelMode={entity ? 'auto' : 'manual'}
          updateEntityData={updateEntityData}
          readOnly={!checkAccess('system.devops.ai_provider.edit', accessData)}
        />
      </DrawerWithFooter>
      <Modal
        title={$t('(0) 模型', [selectedProviderName])}
        visible={modalVisible}
        destroyOnClose={true}
        onCancel={handleCloseModal}
        footer={null}
        wrapClassName="modal-without-footer"
        width={600}
        maskClosable={true}
      >
        <div className="pb-btnybase flex flex-nowrap flex-col h-full w-full items-center justify-between">
          <ModelsDetailTable providerID={selectedProviderID}></ModelsDetailTable>
        </div>
      </Modal>
    </>
  )
}

export default OnlineModelList
