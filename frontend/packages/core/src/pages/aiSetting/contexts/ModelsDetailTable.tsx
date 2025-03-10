import { ActionType } from '@ant-design/pro-components'
import PageList, { PageProColumns } from '@common/components/aoplatform/PageList'
import { BasicResponse, RESPONSE_TIPS, STATUS_CODE } from '@common/const/const'
import { useFetch } from '@common/hooks/http'
import { useRef, useState } from 'react'
import { $t } from '@common/locales'
import { AiProviderLlmsItems, ModelListData } from '../types'
import { App, Divider, Tooltip } from 'antd'
import { Icon } from '@iconify/react/dist/iconify.js'
import TableBtnWithPermission from '@common/components/aoplatform/TableBtnWithPermission'
import AddModels, { addModelsContentHandle } from './AddModels'

const ModelsDetailTable = (props: { providerID?: string }) => {
  const { providerID } = props
  const pageListRef = useRef<ActionType>(null)
  const { fetchData } = useFetch()
  const { message, modal } = App.useApp()
  const [providerData, setProviderData] = useState<any>()
  const addModelModalRef = useRef<addModelsContentHandle>()

  const operation: PageProColumns<any>[] = [
    {
      title: '',
      key: 'option',
      btnNums: 2,
      fixed: 'right',
      valueType: 'option',
      render: (_: React.ReactNode, entity: any) => [
        <TableBtnWithPermission
          access="system.devops.ai_provider.edit"
          key="edit"
          btnType="edit"
          disabled={entity?.is_system}
          tooltip={
            entity?.is_system ? $t('该模型为官方模型，不可编辑') : ''
          }
          onClick={() => handleEdit(entity)}
          btnTitle={$t('设置')}
        />,
        <Divider type="vertical" className="mx-0" />,
        <TableBtnWithPermission
          access="system.devops.ai_provider.edit"
          key="delete"
          disabled={entity?.is_system || entity?.api_count}
          tooltip={
            entity?.is_system ? $t('该模型为官方模型，不可删除') : $t('存在使用当前模型的接口，需要先解绑后才能删除')
          }
          btnType="delete"
          onClick={() => handleDelete(entity)}
          btnTitle={$t('删除')}
        />
      ]
    }
  ]

  const columns: PageProColumns<any>[] = [
    {
      title: $t('模型名称'),
      ellipsis: true,
      dataIndex: 'name'
    },
    {
      title: $t('模型类型'),
      ellipsis: true,
      dataIndex: 'type'
    },
    {
      title: (
        <span>
          {$t('模型值')}
          <Tooltip
            title={$t(
              '接口请求时若指定使用当前模型，则需要在 Model 参数中填入以下值。例如若想使用火山引擎的 Deepseek-R1 模型，那么就需要填入 Volcengine/Deepseek-R1 , 值的大小写不敏感。'
            )}
          >
            <Icon className="align-sub ml-[3px]" icon="fe:question" width="18" height="18" />
          </Tooltip>
        </span>
      ),
      ellipsis: true,
      dataIndex: 'modelValue'
    },
    ...operation
  ]

  const handleEdit = (entity: any) => {
    const accessConfig = entity.access_configuration || ''
    const modelConfig = entity.model_parameters || ''
    modal.confirm({
      title: $t('编辑 (0) 模型', [providerData.name]),
      content: (
        <AddModels
          ref={addModelModalRef}
          showAccessConfig={!!accessConfig}
          accessConfig={accessConfig}
          modelParameters={modelConfig}
          modelID={entity.id}
          modelName={entity.name}
          type={'edit'}
          providerID={providerData.id}
        ></AddModels>
      ),
      onOk: () => {
        return addModelModalRef.current?.save().then((res) => {
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

  const handleDelete = (entity: any) => {
    modal.confirm({
      title: $t('删除'),
      content: $t('确定删除吗？'),
      onOk: async () => {
        try {
          const response = await fetchData<BasicResponse<'success'>>('ai/provider/model', {
            method: 'DELETE',
            eoParams: { provider: providerID, id: entity.id }
          })
          if (response.code === STATUS_CODE.SUCCESS) {
            message.success($t('删除成功'))
            pageListRef.current?.reload()
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

  const requestList = async (params: any) => {
    try {
      const response = await fetchData<BasicResponse<{ llms: AiProviderLlmsItems[] }>>('ai/provider/llms', {
        method: 'GET',
        eoParams: { provider: providerID }
      })

      if (response.code === STATUS_CODE.SUCCESS) {
        setProviderData(response.data.provider)
        const tableData = response.data.llms.map((item) => {
          return {
            ...item,
            modelValue: `${response.data.provider.name}/${item.name}`
          }
        })
        return {
          data: tableData,
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
  return (
    <div className="w-full h-full">
      <PageList
        ref={pageListRef}
        rowKey="id"
        minVirtualHeight={400}
        request={requestList}
        showPagination={false}
        columns={columns}
      />
    </div>
  )
}

export default ModelsDetailTable
