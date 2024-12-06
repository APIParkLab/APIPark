import { ActionType } from "@ant-design/pro-components";
import { useEffect, useMemo, useRef, useState } from "react";
import { App, Button, message, Switch, Modal } from 'antd'
import PageList, { PageProColumns } from "@common/components/aoplatform/PageList";
import { $t } from "@common/locales";
import { useGlobalContext } from "@common/contexts/GlobalStateContext";
import { BasicResponse, DELETE_TIPS, RESPONSE_TIPS, STATUS_CODE } from "@common/const/const.tsx";
import { useFetch } from "@common/hooks/http";
import WithPermission from "@common/components/aoplatform/WithPermission.tsx";
import TableBtnWithPermission from "@common/components/aoplatform/TableBtnWithPermission";
import { DATA_MASKING_TABLE_COLUMNS } from "./DataMaskingColumn";
import { useNavigate, useParams } from "react-router-dom";
import { PolicyPublishInfoType, PolicyPublishModalHandle, RouterParams } from "@common/const/type";
import { DrawerWithFooter } from "@common/components/aoplatform/DrawerWithFooter";
import { DataMaskStrategyItem } from "@common/const/policy/type";
import { PolicyPublishModalContent } from '@common/components/aoplatform/PolicyPublishModalContent'
import { checkAccess } from "@common/utils/permission";
import DataMaskingLogModal from "./DataMaskingLogModal.tsx";
const DataMasking = (props: any) => {

  const {
    // 是否显示发布按钮
    publishBtn = false,
    // 行操作
    rowOperation = []
  } = props;
  const { serviceId, teamId } = useParams<RouterParams>()
  const { state, accessData } = useGlobalContext()
  const navigator = useNavigate()
  const [drawerVisible, setDrawerVisible] = useState<boolean>(false)
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  const [drawerData, setDrawerData] = useState<PolicyPublishInfoType>()
  const [isOkToPublish, setIsOkToPublish] = useState<boolean>(false)
  const drawerRef = useRef<PolicyPublishModalHandle>(null)
  const { modal } = App.useApp()

  /**
 * 列表ref
 */
  const pageListRef = useRef<ActionType>(null);

  /**
   * 请求数据
   */
  const { fetchData } = useFetch()

  /**
   * 搜索关键字
   */
  const [searchWord, setSearchWord] = useState<string>('')
  const [strategy, setStrategy] = useState<string>('')

  /**
   * 获取列数据，国际化变化时重新获取
   */
  const columns = useMemo(() => {
    const res = DATA_MASKING_TABLE_COLUMNS.map(x => {
      // 启动列渲染
      if (x.dataIndex === 'isStop') {
        x.render = (text: any, record: any) => <WithPermission access={`${serviceId === undefined ? 'system.devops' : 'team.service'}.policy.edit`} ><Switch checked={!record.isStop} onChange={(e) => { changeOpenApiStatus(e, record) }} /></WithPermission>
      }
      // 处理数列渲染
      if (x.dataIndex === 'treatmentNumber') {
        x.render = (text: any, record: any) => <span className="w-full block cursor-pointer [&>.ant-typography]:text-theme" onClick={(e) => { openLogsModal(record) }} >{text}</span>
      }
      return {
        ...x,
        title: (<span title={$t(x.title as string)}>{$t(x.title as string)}</span>)
      }
    })
    return res
  }, [state.language])

  /**
   * 操作列
   */
  const operation: PageProColumns<any>[] = rowOperation.length ? [
    {
      title: '',
      key: 'option',
      btnNums: rowOperation.length,
      fixed: 'right',
      valueType: 'option',
      render: (_: React.ReactNode, entity: any) => [
        ...(rowOperation.length && rowOperation.find((item: string) => item === 'edit') ? [<TableBtnWithPermission access={`${serviceId === undefined ? 'system.devops' : 'team.service'}.policy.edit`} key="edit" btnType="edit" onClick={() => { openEditModal(entity) }} btnTitle="编辑" />] : []),
        ...(rowOperation.length && rowOperation.find((item: string) => item === 'logs') ? [<TableBtnWithPermission access={`${serviceId === undefined ? 'system.devops' : 'team.service'}.policy.view`} key="logs" btnType="logs" onClick={() => { openLogsModal(entity) }} btnTitle="日志" />] : []),
        ...(rowOperation.length && rowOperation.find((item: string) => item === 'delete') ? [
          entity.isDelete ? <TableBtnWithPermission access={`${serviceId === undefined ? 'system.devops' : 'team.service'}.policy.edit`} key="refresh" btnType="refresh" onClick={() => { restorePolicy(entity) }} btnTitle="恢复" /> :
            <TableBtnWithPermission access={`${serviceId === undefined ? 'system.devops' : 'team.service'}.policy.delete`} key="delete" btnType="delete" onClick={() => { openModal('delete', entity) }} btnTitle="删除" />
        ] : []),
      ],
    }
  ] : []
  const handleCloseModal = () => {
    setModalVisible(false);
    // setDetailInvokeError(false)
    // setDetailInvokeStatic(undefined)
    // setCompareTotal(false)
  };
  /**
   * 手动刷新表格数据
   */
  const manualReloadTable = () => {
    pageListRef.current?.reload()
  };

  /**
   * 更改启动状态
   * @param enabled 状态
   * @param entity 行数据
   */
  const changeOpenApiStatus = (enabled: boolean, entity: any) => {
    fetchData<BasicResponse<null>>(
      `strategy/${serviceId === undefined ? 'global' : 'service'}/data-masking/${enabled ? 'enable' : 'disable'}`,
      {
        method: 'PATCH',
        eoParams: {
          service: serviceId,
          team: teamId,
          strategy: entity.id
        }
      }
    ).then(response => {
      const { code, msg } = response
      if (code === STATUS_CODE.SUCCESS) {
        message.success(msg || $t(RESPONSE_TIPS.success))
        manualReloadTable()
      } else {
        message.error(msg || $t(RESPONSE_TIPS.error))
      }
    })
  }

  /**
   * 获取列表数据
   * @param dataType 
   * @returns 
   */
  const getPolicyList = (params: DataMaskStrategyItem & {
    pageSize: number;
    current: number;
  },
    sort: Record<string, string>,
    filter: Record<string, string>) => {
    let filters
    if (filter) {
      filters = []
      if (filter.isStop) {
        if (filter.isStop.indexOf('true') !== -1) {
          filters.push('enable')
        }
        if (filter.isStop.indexOf('false') !== -1) {
          filters.push('disable')
        }
        if (filter.publishStatus?.length > 0) {
          filters = [...filters, ...filter.publishStatus]
        }
      }
    }
    
    return fetchData<BasicResponse<{ list: DataMaskStrategyItem[], total: number }>>(
      `strategy/${serviceId === undefined ? 'global' : 'service'}/data-masking/list`,
      {
        method: 'GET',
        eoParams: {
          order: Object.keys(sort)?.[0],
          sort: Object.keys(sort)?.length > 0 ? Object.values(sort)?.[0] === 'descend' ? 'desc' : 'asc' : undefined,
          filters: JSON.stringify(filters),
          keyword: searchWord,
          service: serviceId,
          team: teamId,
        },
        eoTransformKeys: ['is_stop', 'is_delete', 'update_time', 'publish_status', 'processed_total']
      }
    ).then(response => {
      const { code, data, msg } = response
      if (code === STATUS_CODE.SUCCESS) {
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
    }).catch(() => {
      return { data: [], success: false }
    })


  }

  /**
   * 添加策略
   * @param type 
   */
  const addPolicy = () => {
    navigator('../create')
  }

  /**
   * 发布策略
   */
  const publish = async () => {
    message.loading($t(RESPONSE_TIPS.loading));
    const { code, data, msg } = await fetchData<BasicResponse<PolicyPublishInfoType>>(
      'strategy/global/data-masking/to-publishs',
      { method: 'GET', eoTransformKeys: ['opt_time', 'is_publish', 'version_name', 'unpublish_msg'] }
    );
    message.destroy();
    if (code === STATUS_CODE.SUCCESS) {
      setDrawerVisible(true)
      setDrawerData(data)
      setIsOkToPublish(data.isPublish ?? true)
    } else {
      message.error(msg || $t(RESPONSE_TIPS.error));
      return
    }
  }

  /**
   * 编辑
   */
  const openEditModal = (entity: any) => {
    navigator(`../${entity.id}`)
  }

  /**
   * 日志
   * @param entity 
   */
  const openLogsModal = (entity: any) => {
    setStrategy(entity.id)
    setModalVisible(true)
  }



  const openModal = async (type: 'delete', entity?: DataMaskStrategyItem) => {
    if (entity?.publishStatus === 'online') {
      return deletePolicy(entity!).then((res) => { if (res === true) manualReloadTable() })
    }
    let title: string = ''
    let content: string | React.ReactNode = ''
    switch (type) {
      case 'delete':
        title = $t('删除')
        content = $t(DELETE_TIPS.default)
        break;
    }

    modal.confirm({
      title,
      content,
      onOk: () => {
        switch (type) {
          case 'delete':
            return deletePolicy(entity!).then((res) => { if (res === true) manualReloadTable() })
        }
      },
      width: 600,
      okText: $t('确认'),
      okButtonProps: {
        disabled: !checkAccess(`${serviceId === undefined ? 'system.devops' : 'team.service'}.policy.edit`, accessData)
      },
      cancelText: $t('取消'),
      closable: true,
      icon: <></>,
    })
  }

  /**
   * 删除
   * @param entity 
   */
  const deletePolicy = (entity: DataMaskStrategyItem) => {
    return fetchData<BasicResponse<null>>(
      `strategy/${serviceId === undefined ? 'global' : 'service'}/data-masking`,
      {
        method: 'DELETE',
        eoParams: {
          service: serviceId,
          team: teamId,
          strategy: entity.id
        },
      }
    ).then(response => {
      const { code, msg } = response
      if (code === STATUS_CODE.SUCCESS) {
        message.success(msg || $t(RESPONSE_TIPS.success))
        return Promise.resolve(true)
      } else {
        message.error(msg || $t(RESPONSE_TIPS.error))
        return Promise.reject(msg || $t(RESPONSE_TIPS.error))
      }
    }).catch((errorInfo) => Promise.reject(errorInfo))
  }

  /**
   * 恢复
   * @param entity 
   */
  const restorePolicy = (entity: any) => {
    fetchData<BasicResponse<null>>(
      `strategy/${serviceId === undefined ? 'global' : 'service'}/data-masking/restore`,
      {
        method: 'PATCH',
        eoParams: {
          service: serviceId,
          team: teamId,
          strategy: entity.id
        },
      }
    ).then(response => {
      const { code, msg } = response
      if (code === STATUS_CODE.SUCCESS) {
        message.success(msg || $t(RESPONSE_TIPS.success))
        manualReloadTable()
      } else {
        message.error(msg || $t(RESPONSE_TIPS.error))
      }
    })
  }


  const onSubmit = () => {
    return drawerRef.current?.publish()?.then((res) => {
      manualReloadTable();
      return res;
    });
  }

  return (
    <>
      <PageList<DataMaskStrategyItem>
        id="data_masking_list"
        ref={pageListRef}
        columns={[...columns, ...operation]}
        request={async (params: DataMaskStrategyItem & {
          pageSize: number;
          current: number;
        },
          sort: Record<string, string>,
          filter: Record<string, string>) => getPolicyList(params, sort, filter)}
        addNewBtnTitle={$t("添加策略")}
        addNewBtnAccess={`${serviceId === undefined ? 'system.devops' : 'team.service'}.policy.edit`}
        onAddNewBtnClick={() => { addPolicy() }}
        searchPlaceholder={$t("输入名称、筛选条件查找")}
        afterNewBtn={
          publishBtn && [<WithPermission key="removeFromDepPermission" access={`${serviceId === undefined ? 'system.devops' : 'team.service'}.policy.publish`} >
            <Button className="mr-btnbase" key="removeFromDep" onClick={() => publish()}>{$t('发布')}</Button>
          </WithPermission>]
        }
        onSearchWordChange={(e) => {
          setSearchWord(e.target.value)
        }}
        manualReloadTable={manualReloadTable}
      />
      <DrawerWithFooter
        destroyOnClose={true}
        title={$t('申请发布')}
        width={'60%'}
        onClose={() => { setDrawerVisible(false) }}
        okBtnTitle={$t('发布')}
        open={drawerVisible}
        submitDisabled={!isOkToPublish}
        submitAccess={`${serviceId === undefined ? 'system.devops' : 'team.service'}.policy.publish`}
        onSubmit={onSubmit}
      >
        <PolicyPublishModalContent
          ref={drawerRef}
          data={drawerData!}
        />
      </DrawerWithFooter>
      <Modal
        title={$t('处理日志')}
        visible={modalVisible}
        destroyOnClose={true}
        onCancel={handleCloseModal}
        footer={null}
        wrapClassName="modal-without-footer"
        width={1100}
        maskClosable={true}
      >
        <div className="pb-btnybase flex flex-nowrap flex-col h-full w-full items-center justify-between">
        <DataMaskingLogModal strategy={strategy}></DataMaskingLogModal>
        </div>
      </Modal>
    </>
  )
}

export default DataMasking;