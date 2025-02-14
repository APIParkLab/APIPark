import { ActionType } from '@ant-design/pro-components'
import InsidePage from '@common/components/aoplatform/InsidePage'
import PageList, { PageProColumns } from '@common/components/aoplatform/PageList'
import WithPermission from '@common/components/aoplatform/WithPermission'
import { BasicResponse, RESPONSE_TIPS, STATUS_CODE } from '@common/const/const'
import { useFetch } from '@common/hooks/http'
import { $t } from '@common/locales/index.ts'
import { App, Button, Typography } from 'antd'
import { useEffect, useRef, useState } from 'react'
import { LoadBalancingHandle, LoadBalancingItems } from './type'
import TableBtnWithPermission from '@common/components/aoplatform/TableBtnWithPermission'
import AddLoadBalancingModel from './AddModel'

const LoadBalancingPage = () => {
  const pageListRef = useRef<ActionType>(null)
  const [searchWord, setSearchWord] = useState<string>('')
  const [columns, setColumns] = useState<PageProColumns<LoadBalancingItems>[]>([])
  const { modal, message } = App.useApp()
  const [apiKeys, setApiKeys] = useState<LoadBalancingItems[]>([])
  const addModelRef = useRef<LoadBalancingHandle>()
  const statusEnum: Record<string, { text: React.ReactNode }> = {
    normal: { text: <Typography.Text type="success">{$t('正常')}</Typography.Text> },
    abnormal: { text: <Typography.Text type="danger">{$t('异常')}</Typography.Text> }
  }

  /**
   * 请求数据
   */
  const { fetchData } = useFetch()
  const addModel = () => {
    modal.confirm({
      title: $t('添加负载均衡'),
      content: <AddLoadBalancingModel ref={addModelRef} />,
      width: 600,
      closable: true,
      onOk: () => {
        return addModelRef.current?.save().then((res) => {
          if (res === true) {
            pageListRef.current?.reload()
          }
        })
      },
      wrapClassName: 'ant-modal-without-footer',
      okText: $t('确认'),
      cancelText: $t('取消'),
      icon: <></>
    })
  }

  /**
   * 获取列表数据
   * @param dataType
   * @returns
   */
  const requestApis = () => {
    return fetchData<BasicResponse<{ list: LoadBalancingItems[]; total: number }>>(`ai/balances`, {
      method: 'GET',
      eoParams: {
        keyword: searchWord
      },
      eoTransformKeys: ['api_count', 'key_count']
    })
      .then((response) => {
        const { code, data, msg } = response
        if (code === STATUS_CODE.SUCCESS) {
          setApiKeys(response.data.list)
          // 保存数据
          return {
            data: data.list,
            total: data.total,
            success: true
          }
        } else {
          message.error(msg || $t(RESPONSE_TIPS.error))
          return { data: [], success: false }
        }
      })
      .catch(() => {
        return { data: [], success: false }
      })
  }

  /**
   * 排序
   * @param beforeIndex
   * @param afterIndex
   * @param newDataSource
   */
  const handleDragSortEnd = async (beforeIndex: number, afterIndex: number, newDataSource: LoadBalancingItems[]) => {
    try {
      let targetId
      let sortDirection

      // Check if there's an item before afterIndex
      if (afterIndex > 0) {
        targetId = newDataSource[afterIndex - 1].id
        sortDirection = 'after'
      } else if (afterIndex < newDataSource.length - 1) {
        // If no item before, use the item after
        targetId = newDataSource[afterIndex + 1].id
        sortDirection = 'before'
      }

      const response = await fetchData<BasicResponse<any>>('ai/balance/sort', {
        method: 'PUT',
        eoBody: {
          origin: apiKeys[beforeIndex].id,
          target: targetId,
          sort: sortDirection
        }
      })

      if (response.code === STATUS_CODE.SUCCESS) {
        message.success($t('排序成功'))
        pageListRef.current?.reload()
      } else {
        message.error(response.msg || RESPONSE_TIPS.error)
        // Revert the UI if API call fails
        pageListRef.current?.reload()
      }
    } catch (error) {
      message.error(RESPONSE_TIPS.error)
      // Revert the UI if API call fails
      pageListRef.current?.reload()
    }
  }

  /**
   * 删除
   * @param id
   */
  const handleDelete = (id: string) => {
    fetchData<BasicResponse<null>>('ai/balance', {
      method: 'DELETE',
      eoParams: {
        id
      }
    })
      .then((response) => {
        const { code } = response
        if (code === STATUS_CODE.SUCCESS) {
          message.success($t('删除成功'))
          pageListRef.current?.reload()
        } else {
          message.error(RESPONSE_TIPS.error)
        }
      })
      .catch((error) => {
        message.error(RESPONSE_TIPS.error)
      })
  }

  /**
   * 设置表格列
   */
  const setTableColumns = () => {
    setColumns([
      {
        title: '',
        dataIndex: 'drag',
        width: '40px'
      },
      {
        title: $t('优先级'),
        dataIndex: 'priority',
        width: 80,
        ellipsis: true,
        key: 'priority'
      },
      {
        title: $t('模型'),
        dataIndex: ['provider', 'name'],
        ellipsis: true,
        width: 100,
        key: 'provider',
        render: (dom: React.ReactNode, record: LoadBalancingItems) => (
          <span>
            {record.provider?.name} / {record.model?.name}
          </span>
        )
      },
      {
        title: $t('类型'),
        dataIndex: 'type',
        width: 100,
        ellipsis: true,
        key: 'type',
        render: (dom: React.ReactNode, record: LoadBalancingItems) => (
          <span>{record.type === 'online' ? $t('线上模型') : $t('本地模型')}</span>
        )
      },
      {
        title: $t('状态'),
        dataIndex: 'state',
        width: 120,
        ellipsis: true,
        key: 'state',
        render: (dom: React.ReactNode, record: LoadBalancingItems) => (
          <span>{statusEnum[record.state]?.text || '-'}</span>
        )
      },
      {
        title: $t('Apis'),
        dataIndex: 'apiCount',
        ellipsis: true,
        width: 80,
        key: 'apiCount',
        render: (dom: React.ReactNode, record: LoadBalancingItems) => (
          <span className="[&>.key-link]:text-[#2196f3] cursor-pointer">
            <a
              href={`/aiApis?modelId=${record.model?.id}`}
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
        ellipsis: true,
        width: 80,
        key: 'keyCount',
        render: (dom: React.ReactNode, record: LoadBalancingItems) => (
          <span className="[&>.key-link]:text-[#2196f3] cursor-pointer">
            <a
              href={`/keysetting?modelId=${record.model?.id}`}
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
      {
        title: '',
        key: 'option',
        btnNums: 1,
        width: 80,
        fixed: 'right',
        valueType: 'option',
        render: (_: React.ReactNode, entity: any) => [
          <TableBtnWithPermission
            access="system.settings.ai_balance.delete"
            key="delete"
            btnType="delete"
            onClick={() => handleDelete(entity.id as string)}
            btnTitle={$t('删除')}
          />
        ]
      }
    ])
  }
  useEffect(() => {
    setTableColumns()
  }, [])

  return (
    <>
      <InsidePage
        pageTitle={$t('负载均衡')}
        description={$t(
          '系统自动识别异常AI模型后，自动替换成以下优先级最高的可用模型。这将确保您的AI应用保持高可用性和最佳性能，从而防止任何单个LLM异常成为您的性能瓶颈。'
        )}
        showBorder={false}
        scrollPage={false}
      >
        <div className="h-[calc(100%-1rem-36px)] pr-PAGE_INSIDE_X">
          <PageList
            ref={pageListRef}
            rowKey="id"
            afterNewBtn={[
              <WithPermission key="removeFromDepPermission" access="system.settings.ai_balance.add">
                <Button className="mr-btnbase" type="primary" key="removeFromDep" onClick={() => addModel()}>
                  {$t('添加模型')}
                </Button>
              </WithPermission>
            ]}
            request={() => requestApis()}
            onSearchWordChange={(e) => {
              setSearchWord(e.target.value)
            }}
            showPagination={true}
            dragSortKey="drag"
            onDragSortEnd={handleDragSortEnd}
            searchPlaceholder={$t('请输入...')}
            columns={columns}
          />
        </div>
      </InsidePage>
    </>
  )
}
export default LoadBalancingPage
