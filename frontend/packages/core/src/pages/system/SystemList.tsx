import { ActionType } from '@ant-design/pro-components'
import { DrawerWithFooter } from '@common/components/aoplatform/DrawerWithFooter.tsx'
import InsidePage from '@common/components/aoplatform/InsidePage.tsx'
import PageList from '@common/components/aoplatform/PageList.tsx'
import { BasicResponse, RESPONSE_TIPS, STATUS_CODE } from '@common/const/const.tsx'
import { SimpleMemberItem, SimpleTeamItem } from '@common/const/type.ts'
import { useBreadcrumb } from '@common/contexts/BreadcrumbContext.tsx'
import { useGlobalContext } from '@common/contexts/GlobalStateContext.tsx'
import { useFetch } from '@common/hooks/http.ts'
import { $t } from '@common/locales/index.ts'
import { App } from 'antd'
import { FC, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SERVICE_KIND_OPTIONS, SYSTEM_TABLE_COLUMNS } from '../../const/system/const.tsx'
import { SystemConfigHandle, SystemTableListItem } from '../../const/system/type.ts'
import SystemConfig from './SystemConfig.tsx'

const SystemList: FC = () => {
  const navigate = useNavigate()
  const [tableSearchWord, setTableSearchWord] = useState<string>('')
  const { setBreadcrumb } = useBreadcrumb()
  const [teamList, setTeamList] = useState<{ [k: string]: { text: string } }>()
  const { fetchData } = useFetch()
  const [tableListDataSource, setTableListDataSource] = useState<SystemTableListItem[]>([])
  const [tableHttpReload, setTableHttpReload] = useState(true)
  const { message } = App.useApp()
  const pageListRef = useRef<ActionType>(null)
  const [memberValueEnum, setMemberValueEnum] = useState<{ [k: string]: { text: string } }>({})
  const [open, setOpen] = useState(false)
  const drawerFormRef = useRef<SystemConfigHandle>(null)
  const { checkPermission, accessInit, getGlobalAccessData, state } = useGlobalContext()

  const getSystemList = () => {
    if (!accessInit) {
      getGlobalAccessData()?.then?.(() => {
        getSystemList()
      })
      return Promise.resolve({ data: [], success: false })
    }
    if (!tableHttpReload) {
      setTableHttpReload(true)
      return Promise.resolve({
        data: tableListDataSource,
        success: true
      })
    }
    return fetchData<BasicResponse<{ services: SystemTableListItem[] }>>(
      !checkPermission('system.workspace.service.view_all') ? 'my_services' : 'services',
      {
        method: 'GET',
        eoParams: { keyword: tableSearchWord },
        eoTransformKeys: ['api_num', 'service_num', 'create_time']
      }
    )
      .then((response) => {
        const { code, data, msg } = response
        if (code === STATUS_CODE.SUCCESS) {
          setTableListDataSource(data.services)
          setTableHttpReload(false)
          return { data: data.services, success: true }
        } else {
          message.error(msg || $t(RESPONSE_TIPS.error))
          return { data: [], success: false }
        }
      })
      .catch(() => {
        return { data: [], success: false }
      })
  }

  const getTeamsList = () => {
    if (!accessInit) {
      getGlobalAccessData()?.then?.(() => {
        getTeamsList()
      })
      return
    }
    fetchData<BasicResponse<{ teams: SimpleTeamItem[] }>>(
      !checkPermission('system.workspace.team.view_all') ? 'simple/teams/mine' : 'simple/teams',
      { method: 'GET', eoTransformKeys: [] }
    ).then((response) => {
      const { code, data, msg } = response
      setTeamList(data.teams)
      if (code === STATUS_CODE.SUCCESS) {
        const tmpValueEnum: { [k: string]: { text: string } } = {}
        data.teams?.forEach((x: SimpleMemberItem) => {
          tmpValueEnum[x.name] = { text: x.name }
        })
        setTeamList(tmpValueEnum)
      } else {
        message.error(msg || $t(RESPONSE_TIPS.error))
        return { data: [], success: false }
      }
    })
  }

  const manualReloadTable = () => {
    setTableHttpReload(true) // 表格数据需要从后端接口获取
    pageListRef.current?.reload()
  }

  const getMemberList = async () => {
    setMemberValueEnum({})
    const { code, data, msg } = await fetchData<BasicResponse<{ members: SimpleMemberItem[] }>>('simple/member', {
      method: 'GET'
    })
    if (code === STATUS_CODE.SUCCESS) {
      const tmpValueEnum: { [k: string]: { text: string } } = {}
      data.members?.forEach((x: SimpleMemberItem) => {
        tmpValueEnum[x.name] = { text: x.name }
      })
      setMemberValueEnum(tmpValueEnum)
    } else {
      message.error(msg || $t(RESPONSE_TIPS.error))
    }
  }

  useEffect(() => {
    getTeamsList()
    getMemberList()
    setBreadcrumb([
      {
        title: $t('服务')
      }
    ])
  }, [])

  const onClose = () => {
    setOpen(false)
  }

  const columns = useMemo(() => {
    const res = SYSTEM_TABLE_COLUMNS.map((x) => {
      const dataIndex = x.dataIndex as string[]

      if (x.filters && dataIndex?.indexOf('master') !== -1) {
        x.valueEnum = memberValueEnum
      }
      if (x.filters && dataIndex?.indexOf('team') !== -1) {
        x.valueEnum = teamList
      }
      if ((x.dataIndex as string) === 'service_kind') {
        x.valueEnum = {}
        SERVICE_KIND_OPTIONS.forEach((option) => {
          ;(x.valueEnum as any)[option.value] = { text: $t(option.label) }
        })
      }

      return { ...x, title: typeof x.title === 'string' ? $t(x.title as string) : x.title }
    })
    return res
  }, [memberValueEnum, teamList, state.language])

  const steps = [
    {
      target: '.my-first-step',
      content: '点击按钮新建服务'
    },
    {
      target: '.ant-table-tbody',
      content: '点击表格查看详情',
      placement: 'top'
    }
  ]

  return (
    <InsidePage
      pageTitle={$t('服务')}
      description={$t(
        '服务提供了高性能 API 网关，并且可以无缝接入多种大型 AI 模型，并将这些 AI 能力打包成 API 进行调用，从而大幅简化了 AI 模型的使用门槛。同时，我们的平台提供了完善的 API 管理功能，支持 API 的创建、监控、访问控制等，保障开发者可以高效、安全地开发和管理 API 服务。'
      )}
      showBorder={false}
      contentClassName=" pr-PAGE_INSIDE_X pb-PAGE_INSIDE_B"
    >
      <PageList
        id="global_system"
        ref={pageListRef}
        columns={[...columns]}
        request={() => getSystemList()}
        addNewBtnTitle={$t('添加服务')}
        addNewBtnWrapperClass={'my-first-step'}
        searchPlaceholder={$t('输入名称、ID、所属团队、负责人查找服务')}
        onAddNewBtnClick={() => {
          setOpen(true)
        }}
        manualReloadTable={manualReloadTable}
        onChange={() => {
          setTableHttpReload(false)
        }}
        onSearchWordChange={(e) => {
          setTableSearchWord(e.target.value)
        }}
        onRowClick={(row: SystemTableListItem) =>
          navigate(`/service/${row.team.id}/${row.service_kind === 'ai' ? 'aiInside' : 'inside'}/${row.id}`)
        }
      />
      <DrawerWithFooter
        title={$t('添加服务')}
        open={open}
        onClose={onClose}
        onSubmit={() =>
          drawerFormRef.current?.save()?.then((res) => {
            res && manualReloadTable()
            return res
          })
        }
      >
        <SystemConfig ref={drawerFormRef} />
      </DrawerWithFooter>
    </InsidePage>
  )
}
export default SystemList
