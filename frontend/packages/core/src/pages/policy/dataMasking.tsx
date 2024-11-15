import { ActionType } from "@ant-design/pro-components";
import { useMemo, useRef, useState } from "react";
import { Button, message, Switch } from 'antd'
import PageList, { PageProColumns } from "@common/components/aoplatform/PageList";
import { DATA_MASSKING_TABLE_COLUMNS } from './dataMaskingColumn'
import { $t } from "@common/locales";
import { useGlobalContext } from "@common/contexts/GlobalStateContext";
import { BasicResponse, RESPONSE_TIPS, STATUS_CODE } from "@common/const/const.tsx";
import { useFetch } from "@common/hooks/http";
import WithPermission from "@common/components/aoplatform/WithPermission.tsx";
import TableBtnWithPermission from "@common/components/aoplatform/TableBtnWithPermission";


const DataMasking = (props: any) => {

  const {
    // 是否显示发布按钮
    publishBtn = false,
    // 行操作
    rowOperation = []
  } = props;
  const { checkPermission, getGlobalAccessData, accessInit, state } = useGlobalContext()
  /**
   * 列表ref
   */
  const pageListRef = useRef<ActionType>(null);

  /**
   * 表格数据重新加载
   */
  const [tableHttpReload, setTableHttpReload] = useState(true);

  /**
   * 表格数据
   */
  const [tableListDataSource, setTableListDataSource] = useState<ServiceHubAppListItem[]>([]);

  /**
   * 请求数据
   */
  const { fetchData } = useFetch()

  /**
   * 搜索关键字
   */
  const [searchWord, setSearchWord] = useState<string>('')

  /**
   * 获取列数据，国际化变化时重新获取
   */
  const columns = useMemo(() => {
    const res = DATA_MASSKING_TABLE_COLUMNS.map(x => {
      // 启动列渲染
      if (x.dataIndex === 'enabled') {
        x.render = (text: any, record: any) => <Switch checked={record.enabled} onChange={(e) => { changeOpenApiStatus(e, record) }} />
      }
      // 处理数列渲染
      if (x.dataIndex === 'treatmentNumber') {
        x.render = (text: any, record: any) => <span className="w-full block cursor-pointer [&>.ant-typography]:text-theme" onClick={(e) => { openLogsModal(record) }} >{ text }</span>
      }
      // 名称筛选，这里是全量返回时候的，分页的话应该要接口返回对应的筛选数据
      if (x.dataIndex === 'name') {
        const nameList = tableListDataSource.map(item => item.name)
        const valueEnum: any = {}
        nameList.forEach(item => {
          valueEnum[item] = { text: item }
        })
        x.valueEnum = valueEnum
      }
      return {
        ...x,
        title: typeof x.title === 'string' ? $t(x.title as string) : x.title
      }
    })
    return res
  }, [tableListDataSource, state.language])

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
        ...(rowOperation.length && rowOperation.find((item: string) => item === 'edit') ? [<TableBtnWithPermission access="system.organization.member.edit" key="edit" btnType="edit" onClick={() => { openEditModal(entity) }} btnTitle="编辑" />] : []),
        ...(rowOperation.length && rowOperation.find((item: string) => item === 'logs') ? [<TableBtnWithPermission access="system.organization.member.edit" key="logs" btnType="logs" onClick={() => { openLogsModal(entity) }} btnTitle="详情" />] : []),
        ...(rowOperation.length && rowOperation.find((item: string) => item === 'delete') ? [<TableBtnWithPermission access="system.organization.member.edit" key="delete" btnType="delete" onClick={() => { deletePolicy(entity) }} btnTitle="删除" />] : []),
      ],
    }
  ] : []

  /**
   * 手动刷新表格数据
   */
  const manualReloadTable = () => {
    setTableHttpReload(true)
    pageListRef.current?.reload()
  };

  /**
   * 更改启动状态
   * @param enabled 状态
   * @param entity 行数据
   */
  const changeOpenApiStatus = (enabled: boolean, entity: any) => {
    console.log('更改启动状态', enabled, entity);
    
    manualReloadTable()
    // 待补充，请求接口更改状态，然后刷新表格
    // fetchData<BasicResponse<null>>(
    //   `external-app/${enabled ? 'disable' : 'enable'}`,
    //   {
    //     method: 'PUT',
    //     eoParams: {
    //       id: entity.id
    //     }
    //   }
    // ).then(response => {
    //   const { code, msg } = response
    //   if (code === STATUS_CODE.SUCCESS) {
    //     message.success(msg || $t(RESPONSE_TIPS.success))
    //     manualReloadTable()
    //   } else {
    //     message.error(msg || $t(RESPONSE_TIPS.error))
    //   }
    // })
  }

  /**
   * 获取列表数据
   * @param dataType 
   * @returns 
   */
  const getServiceList = () => {
    if (!accessInit) {
      getGlobalAccessData()?.then?.(() => { getServiceList() })
      return Promise.resolve({ data: [], success: false })
    }

    if (!tableHttpReload) {
      setTableHttpReload(true)
      return Promise.resolve({
        data: tableListDataSource,
        success: true,
      });
    }
    return fetchData<BasicResponse<any>>(
      !checkPermission('system.workspace.team.view_all') ? 'teams' : 'manager/teams',
      {
        method: 'GET',
        eoParams: { keyword: searchWord },
        eoTransformKeys: ['create_time', 'service_num', 'can_delete']
      }
    ).then(response => {
      const { code, data, msg } = response
      if (code === STATUS_CODE.SUCCESS) {
        const data = [
          {
            name: 'test',
            priority: 1,
            status: true,
            enabled: true,
            condition: 'test',
            treatmentNumber: 1,
            updater: 'test',
            createTime: '2021-10-01'
          },
          {
            name: 'test2',
            priority: 2,
            status: false,
            enabled: false,
            condition: 'test2',
            treatmentNumber: 2,
            updater: 'test2',
            createTime: '2021-10-02'
          },
          {
            name: 'test2',
            priority: 2,
            status: false,
            enabled: false,
            condition: 'test2',
            treatmentNumber: 2,
            updater: 'test2',
            createTime: '2021-10-02'
          },
          {
            name: 'test2',
            priority: 2,
            status: false,
            enabled: false,
            condition: 'test2',
            treatmentNumber: 2,
            updater: 'test2',
            createTime: '2021-10-02'
          },
          {
            name: 'test2',
            priority: 2,
            status: false,
            enabled: false,
            condition: 'test2',
            treatmentNumber: 2,
            updater: 'test2',
            createTime: '2021-10-02'
          },
          {
            name: 'test2',
            priority: 2,
            status: false,
            enabled: false,
            condition: 'test2',
            treatmentNumber: 2,
            updater: 'test2',
            createTime: '2021-10-02'
          },
          {
            name: 'test2',
            priority: 2,
            status: false,
            enabled: false,
            condition: 'test2',
            treatmentNumber: 2,
            updater: 'test2',
            createTime: '2021-10-02'
          },
          {
            name: 'test2',
            priority: 2,
            status: false,
            enabled: false,
            condition: 'test2',
            treatmentNumber: 2,
            updater: 'test2',
            createTime: '2021-10-02'
          },
          {
            name: 'test2',
            priority: 2,
            status: false,
            enabled: false,
            condition: 'test2',
            treatmentNumber: 2,
            updater: 'test2',
            createTime: '2021-10-02'
          },
          {
            name: 'test2',
            priority: 2,
            status: false,
            enabled: false,
            condition: 'test2',
            treatmentNumber: 2,
            updater: 'test2',
            createTime: '2021-10-02'
          },
          {
            name: 'test2',
            priority: 2,
            status: false,
            enabled: false,
            condition: 'test2',
            treatmentNumber: 2,
            updater: 'test2',
            createTime: '2021-10-02'
          },
          {
            name: 'test2',
            priority: 2,
            status: false,
            enabled: false,
            condition: 'test2',
            treatmentNumber: 2,
            updater: 'test2',
            createTime: '2021-10-02'
          },
          {
            name: 'test2',
            priority: 2,
            status: false,
            enabled: false,
            condition: 'test2',
            treatmentNumber: 2,
            updater: 'test2',
            createTime: '2021-10-02'
          },
          {
            name: 'test2',
            priority: 2,
            status: false,
            enabled: false,
            condition: 'test2',
            treatmentNumber: 2,
            updater: 'test2',
            createTime: '2021-10-02'
          },
          {
            name: 'test2',
            priority: 2,
            status: false,
            enabled: false,
            condition: 'test2',
            treatmentNumber: 2,
            updater: 'test2',
            createTime: '2021-10-02'
          },
          {
            name: 'test2',
            priority: 2,
            status: false,
            enabled: false,
            condition: 'test2',
            treatmentNumber: 2,
            updater: 'test2',
            createTime: '2021-10-02'
          },
          {
            name: 'test2',
            priority: 2,
            status: false,
            enabled: false,
            condition: 'test2',
            treatmentNumber: 2,
            updater: 'test2',
            createTime: '2021-10-02'
          },
          {
            name: 'test2',
            priority: 2,
            status: false,
            enabled: false,
            condition: 'test2',
            treatmentNumber: 2,
            updater: 'test2',
            createTime: '2021-10-02'
          },
          {
            name: 'test2',
            priority: 2,
            status: false,
            enabled: false,
            condition: 'test2',
            treatmentNumber: 2,
            updater: 'test2',
            createTime: '2021-10-02'
          },
          {
            name: 'test2',
            priority: 2,
            status: false,
            enabled: false,
            condition: 'test2',
            treatmentNumber: 2,
            updater: 'test2',
            createTime: '2021-10-02'
          },
          {
            name: 'test2',
            priority: 2,
            status: false,
            enabled: false,
            condition: 'test2',
            treatmentNumber: 2,
            updater: 'test2',
            createTime: '2021-10-02'
          },
          {
            name: 'test2',
            priority: 2,
            status: false,
            enabled: false,
            condition: 'test2',
            treatmentNumber: 2,
            updater: 'test2',
            createTime: '2021-10-02'
          }
        ]
        // 保存数据
        setTableListDataSource(data)
        setTableHttpReload(false)
        return {
          data,
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
    console.log('添加策略');
  }

  /**
   * 发布策略
   */
  const publish = () => {
    console.log('发布策略');

  }

  /**
   * 编辑
   */
  const openEditModal = (entity: any) => {
    console.log('编辑', entity);
  }

  /**
   * 日志
   * @param entity 
   */
  const openLogsModal = (entity: any) => {
    console.log('日志', entity);
  }

  /**
   * 删除
   * @param entity 
   */
  const deletePolicy = (entity: any) => {
    console.log('删除', entity);
    manualReloadTable()
  }

  return (
    <>
      <PageList
        id="data_masking_list"
        ref={pageListRef}
        columns={[...columns, ...operation]}
        request={() => getServiceList()}
        addNewBtnTitle={$t("添加策略")}
        onAddNewBtnClick={() => { addPolicy() }}
        searchPlaceholder={$t("输入名称、筛选条件查找")}
        afterNewBtn={
          publishBtn && [<WithPermission key="removeFromDepPermission" access="system.organization.member.edit"><Button className="mr-btnbase" key="removeFromDep" onClick={() => publish()}>{$t('发布')}</Button></WithPermission>]
        }
        onSearchWordChange={(e) => {
          setSearchWord(e.target.value)
        }}
        manualReloadTable={manualReloadTable}
        onChange={() => {
          setTableHttpReload(false)
        }}
      />
    </>
  )
}

export default DataMasking;