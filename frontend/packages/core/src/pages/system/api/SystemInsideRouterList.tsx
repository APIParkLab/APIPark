import { ActionType } from '@ant-design/pro-components'
import PageList, { PageProColumns } from '@common/components/aoplatform/PageList.tsx'
import TableBtnWithPermission from '@common/components/aoplatform/TableBtnWithPermission.tsx'
import { BasicResponse, COLUMNS_TITLE, DELETE_TIPS, RESPONSE_TIPS, STATUS_CODE } from '@common/const/const.tsx'
import { SimpleMemberItem } from '@common/const/type.ts'
import { useBreadcrumb } from '@common/contexts/BreadcrumbContext.tsx'
import { useGlobalContext } from '@common/contexts/GlobalStateContext.tsx'
import { useFetch } from '@common/hooks/http.ts'
import { $t } from '@common/locales/index.ts'
import { checkAccess } from '@common/utils/permission.ts'
import { RouterParams } from '@core/components/aoplatform/RenderRoutes.tsx'
import { App, Divider, Typography } from 'antd'
import { FC, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { SYSTEM_API_TABLE_COLUMNS } from '../../../const/system/const.tsx'
import { SystemApiTableListItem } from '../../../const/system/type.ts'

const SystemInsideRouterList: FC = () => {
  const [searchWord, setSearchWord] = useState<string>('')
  const { setBreadcrumb } = useBreadcrumb()
  const { modal, message } = App.useApp()
  const [tableListDataSource, setTableListDataSource] = useState<SystemApiTableListItem[]>([])
  const [tableHttpReload, setTableHttpReload] = useState(true)
  const { fetchData } = useFetch()
  const pageListRef = useRef<ActionType>(null)
  const [memberValueEnum, setMemberValueEnum] = useState<SimpleMemberItem[]>([])
  const { accessData, state } = useGlobalContext()
  const { serviceId, teamId } = useParams<RouterParams>()
  const navigator = useNavigate()

  const getRoutesList = (): Promise<{ data: SystemApiTableListItem[]; success: boolean }> => {
    if (!tableHttpReload) {
      setTableHttpReload(true)
      return Promise.resolve({
        data: tableListDataSource,
        success: true
      })
    }

    return fetchData<BasicResponse<{ routers: SystemApiTableListItem }>>('service/routers', {
      method: 'GET',
      eoParams: { service: serviceId, team: teamId, keyword: searchWord },
      eoTransformKeys: ['request_path', 'create_time', 'update_time', 'disable']
    })
      .then((response) => {
        const { code, data, msg } = response
        if (code === STATUS_CODE.SUCCESS) {
          setTableListDataSource(data.routers)
          setTableHttpReload(false)
          return { data: data.routers, success: true }
        } else {
          message.error(msg || $t(RESPONSE_TIPS.error))
          return { data: [], success: false }
        }
      })
      .catch(() => {
        return { data: [], success: false }
      })
  }

  const deleteRoute = (entity: SystemApiTableListItem) => {
    return new Promise((resolve, reject) => {
      fetchData<BasicResponse<null>>('service/router', {
        method: 'DELETE',
        eoParams: { service: serviceId, team: teamId, router: entity!.id }
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
        })
        .catch((errorInfo) => reject(errorInfo))
    })
  }

  const openModal = async (type: 'delete', entity: SystemApiTableListItem) => {
    let title: string = ''
    let content: string | React.ReactNode = ''
    switch (type) {
      case 'delete':
        title = $t('删除')
        content = $t(DELETE_TIPS.default)
        break
    }

    modal.confirm({
      title,
      content,
      onOk: () => {
        switch (type) {
          case 'delete':
            return deleteRoute(entity).then((res) => {
              if (res === true) manualReloadTable()
            })
        }
      },
      width: 600,
      okText: $t('确认'),
      okButtonProps: {
        disabled: !checkAccess(`team.service.router.${type}`, accessData)
      },
      cancelText: $t('取消'),
      closable: true,
      icon: <></>
    })
  }

  const operation: PageProColumns<SystemApiTableListItem>[] = [
    {
      title: COLUMNS_TITLE.operate,
      key: 'option',
      btnNums: 2,
      fixed: 'right',
      valueType: 'option',
      render: (_: React.ReactNode, entity: SystemApiTableListItem) => [
        <TableBtnWithPermission
          access="team.service.router.edit"
          key="edit"
          btnType="edit"
          onClick={() => {
            navigator(`/service/${teamId}/inside/${serviceId}/route/${entity.id}`)
          }}
          btnTitle="编辑"
        />,
        <Divider type="vertical" className="mx-0" key="div3" />,
        <TableBtnWithPermission
          access="team.service.router.delete"
          key="delete"
          btnType="delete"
          onClick={() => {
            openModal('delete', entity)
          }}
          btnTitle="删除"
        />
      ]
    }
  ]

  const manualReloadTable = () => {
    setTableHttpReload(true) // 表格数据需要从后端接口获取
    pageListRef.current?.reload()
  }

  const getMemberList = async () => {
    setMemberValueEnum([])
    const { code, data, msg } = await fetchData<BasicResponse<{ members: SimpleMemberItem[] }>>('simple/member', {
      method: 'GET'
    })
    if (code === STATUS_CODE.SUCCESS) {
      setMemberValueEnum(data.members)
    } else {
      message.error(msg || $t(RESPONSE_TIPS.error))
    }
  }

  useEffect(() => {
    setBreadcrumb([
      {
        title: <Link to={`/service/list`}>{$t('服务')}</Link>
      },
      {
        title: $t('路由')
      }
    ])
    getMemberList()
    manualReloadTable()
  }, [serviceId])

  const columns = useMemo(() => {
    return [...SYSTEM_API_TABLE_COLUMNS].map((x) => {
      if (x.filters && (x.dataIndex as string[])?.indexOf('creator') !== -1) {
        const tmpValueEnum: { [k: string]: { text: string } } = {}
        memberValueEnum?.forEach((x: SimpleMemberItem) => {
          tmpValueEnum[x.name] = { text: x.name }
        })
        x.valueEnum = tmpValueEnum
      }

      if (x.filters && (x.dataIndex as string[])?.indexOf('disable') !== -1) {
        x.valueEnum = {
          true: { text: <Typography.Text type="danger">{$t('拦截')}</Typography.Text> },
          false: { text: <Typography.Text type="success">{$t('放行')}</Typography.Text> }
        }
      }
      return { ...x, title: typeof x.title === 'string' ? $t(x.title as string) : x.title }
    })
  }, [memberValueEnum, state.language])

  return (
    <>
      <PageList
        id="global_system_api"
        ref={pageListRef}
        columns={[...columns, ...operation]}
        request={() => getRoutesList()}
        dataSource={tableListDataSource}
        addNewBtnTitle={$t('添加路由')}
        searchPlaceholder={$t('输入 URL 查找路由')}
        onAddNewBtnClick={() => {
          navigator(`/service/${teamId}/inside/${serviceId}/route/create`)
        }}
        addNewBtnAccess="team.service.router.add"
        tableClickAccess="team.service.router.view"
        manualReloadTable={manualReloadTable}
        onSearchWordChange={(e) => {
          setSearchWord(e.target.value)
        }}
        onChange={() => {
          setTableHttpReload(false)
        }}
        onRowClick={(row: SystemApiTableListItem) =>
          navigator(`/service/${teamId}/inside/${serviceId}/route/${row.id}`)
        }
        tableClass="mr-PAGE_INSIDE_X "
      />
    </>
  )
}
export default SystemInsideRouterList
