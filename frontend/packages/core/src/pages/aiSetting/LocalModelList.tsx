import { ActionType } from '@ant-design/pro-components'
import PageList, { PageProColumns } from '@common/components/aoplatform/PageList'
import TableBtnWithPermission from '@common/components/aoplatform/TableBtnWithPermission'
import { BasicResponse, RESPONSE_TIPS, STATUS_CODE } from '@common/const/const'
import { useFetch } from '@common/hooks/http'
import { $t } from '@common/locales'
import { App, Divider, Form, Space, Switch, Tag } from 'antd'
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { ModelListData } from './types'
import LocalAiDeploy, { LocalAiDeployHandle } from '../guide/LocalAiDeploy'
import { ServiceDeployment } from '../system/serviceDeployment/ServiceDeployment'
import { LogsFooter } from '../system/serviceDeployment/ServiceDeployMentFooter'
import WithPermission from '@common/components/aoplatform/WithPermission'
type EditLocalModelModalHandle = {
  save: () => Promise<boolean | string>
}
type EditLocalModelModalProps = {
  enable: boolean
  modelID?: string
}
const EditLocalModelModal = forwardRef<EditLocalModelModalHandle, EditLocalModelModalProps>((props: EditLocalModelModalProps, ref) => {
  const { enable, modelID } = props
  const { fetchData } = useFetch()
  const { message } = App.useApp()
  const [form] = Form.useForm()
  const [currentStatus, setCurrentStatus] = useState<boolean>(enable)

  useEffect(() => {
    form.setFieldsValue({ enable })
  }, [])
    /**
   * 保存
   * @returns 
   */
    const save: () => Promise<boolean | string> = () => {
      return new Promise((resolve, reject) => {
        try {
          form
            .validateFields()
            .then((value) => {
              const finalValue = {
                disable: !value.enable
              }
  
            fetchData<BasicResponse<null>>('model/local/info', {
              method: 'PUT',
              eoParams: { model: modelID },
              eoBody: finalValue,
            })
              .then((response) => {
                const { code, msg } = response
                if (code === STATUS_CODE.SUCCESS) {
                  message.success(msg || $t(RESPONSE_TIPS.success))
                  resolve(true)
                } else {
                  message.error(msg || $t(RESPONSE_TIPS.error))
                  reject(msg || $t(RESPONSE_TIPS.error))
                }
              }).catch((errorInfo) => reject(errorInfo))
            })
            .catch((errorInfo) => reject(errorInfo))
        } catch (error) {
          reject(error)
        }
      })
    }
    useImperativeHandle(ref, () => ({
      save
    }))

  return (
    <WithPermission access="">
    <Form
      layout="vertical"
      labelAlign="left"
      scrollToFirstError
      form={form}
      className="mx-auto "
      name="partitionInsideCert"
      autoComplete="off"
    >
    <Form.Item className="p-4 bg-white rounded-lg" label={$t('LLM 状态管理')}>
      <div className="flex justify-between items-center">
        <div>
          <span className="text-gray-600">{$t('当前调用状态：')}</span>
          {currentStatus && <Tag color="success">{$t('正常')}</Tag>}
          {!currentStatus && <Tag color="warning">{$t('停用')}</Tag>}
        </div>
        <Form.Item name="enable" valuePropName="checked" noStyle>
          <Switch
            checkedChildren={$t('启用')}
            unCheckedChildren={$t('停用')}
            onChange={(checked) => {
              form.setFieldsValue({ enable: checked })
              setCurrentStatus(checked)
            }}
          />
        </Form.Item>
      </div>
    </Form.Item>
    </Form>
  </WithPermission>
  )
})

const LocalModelList: React.FC = () => {
  const pageListRef = useRef<ActionType>(null)
  const { message, modal } = App.useApp()
  const { fetchData } = useFetch()
  const [searchWord, setSearchWord] = useState<string>('')
  const localAiDeployRef = useRef<LocalAiDeployHandle>()
  const EditLocalModelModalRef = useRef<EditLocalModelModalHandle>()
  const [stateColumnMap] = useState<{ [k: string]: { text: string; className?: string } }>({
    normal: { text: '正常' },
    deploying: { text: '部署中', className: 'text-[#2196f3] cursor-pointer' },
    error: { text: '模型异常', className: 'text-[#ff4d4f]' },
    disabled: { text: '停用', className: 'text-[#999]' },
    deploying_error: { text: '部署失败', className: 'text-[#ff4d4f] cursor-pointer' }
  })

  const handleEdit = (record: ModelListData) => {
    modal.confirm({
      title: $t('模型设置'),
      content: <EditLocalModelModal ref={EditLocalModelModalRef} modelID={record.id} enable={record.state !== 'disabled'}/>,
      onOk: () => {
        return EditLocalModelModalRef.current?.save().then((res) => {
          if (res === true) {
            pageListRef.current?.reload()
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

  const handleAdd = () => {
    const modalInstance = modal.confirm({
      title: $t('部署本地模型'),
      content: (
        <LocalAiDeploy
          ref={localAiDeployRef}
          onClose={() => {
            modalInstance.destroy()
            pageListRef.current?.reload()
          }}
        ></LocalAiDeploy>
      ),
      onOk: () => {
        return localAiDeployRef.current?.deployLocalAIServer().then((res) => {
          if (res === true) {
            pageListRef.current?.reload()
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

  const handleDelete = async (id: string, apiCount: number) => {
    modal.confirm({
      title: $t('删除模型'),
      content: `${$t('有')} ${apiCount} ${$t('个API使用当前模型，删除当前的模型配置后，该模型相关的API将会切换为使用负载均衡中优先级最高的可用模型。并且当前模型下的所有API KEY和相关数据将会被清空，是否确认删除当前模型？')}`,
      onOk: () => {
        return new Promise((resolve, reject) => {
          try {
            fetchData<BasicResponse<any>>('model/local', {
              method: 'DELETE',
              eoParams: {
                model: id
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
      const response = await fetchData<BasicResponse<{ data: ModelListData[] }>>('model/local/list', {
        method: 'GET',
        eoParams: {
          page_size: params.pageSize,
          keyword: searchWord,
          page: params.current
        },
        eoTransformKeys: ['can_delete', 'api_count']
      })

      if (response.code === STATUS_CODE.SUCCESS) {
        return {
          data: response.data.models,
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
          disabled={!entity?.canDelete}
          tooltip={$t('当前模型为最后一个模型，不支持删除')}
          access="system.devops.ai_provider.edit"
          key="delete"
          btnType="delete"
          onClick={() => handleDelete(entity.id as string, entity?.apiCount)}
          btnTitle={$t('删除')}
        />
      ]
    }
  ]

  const openLogsModal = (record: any) => {
    const closeModal = (reload = true) => {
      reload && pageListRef.current?.reload()
      modalInstance.destroy()
    }
    const modalInstance = modal.confirm({
      title: $t('部署过程'),
      content: <ServiceDeployment record={record} />,
      footer: () => {
        return <LogsFooter record={record} closeModal={closeModal} />
      },
      width: 600,
      okText: $t('确认'),
      cancelText: $t('取消'),
      closable: true,
      icon: <></>
    })
  }

  const columns: PageProColumns<ModelListData>[] = [
    {
      title: $t('名称'),
      dataIndex: 'name',
      render: (dom: React.ReactNode, entity: ModelListData) => <Space>{entity.name}</Space>
    },
    {
      title: $t('状态'),
      width: 140,
      dataIndex: 'state',
      ellipsis: true,
      render: (dom: React.ReactNode, entity: ModelListData) => (
        <span
          className={`text-[13px] ${stateColumnMap[entity?.state as string]?.className}`}
          onClick={(e) => {
            if (['deploying', 'deploying_error'].includes(entity?.state as string)) {
              e?.stopPropagation()
              openLogsModal(entity)
            }
          }}
        >
          {stateColumnMap[entity?.state as string]?.text || '-'}
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
      addNewBtnTitle={$t('部署模型')}
      onAddNewBtnClick={handleAdd}
    />
  )
}

export default LocalModelList
