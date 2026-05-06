'use client'

import { useGlobalContext } from '@common/contexts/GlobalStateContext'
import { $t } from '@common/locales'
import { SYSTEM_INSIDE_APPROVAL_TAB_ITEMS, SYSTEM_PUBLISH_TAB_ITEMS } from '@core/const/system/const'
import AiServiceInsideApprovalList from '@core/pages/aiService/approval/AiServiceInsideApprovalList'
import AiServiceInsidePublishList from '@core/pages/aiService/publish/AiServiceInsidePublishList'
import SystemInsideApprovalList from '@core/pages/system/approval/SystemInsideApprovalList'
import SystemInsidePublishList from '@core/pages/system/publish/SystemInsidePublishList'
import { Tabs } from 'antd'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { ReactElement, useMemo } from 'react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

type ServiceDetailLegacyTabsProps = {
  side: 'inside' | 'aiInside'
  type: 'approval' | 'publish'
}

function buildTabHref(pathname: string, searchParams: URLSearchParams, key: string) {
  const nextSearchParams = new URLSearchParams(searchParams.toString())

  if (key === '0') {
    nextSearchParams.delete('status')
  } else {
    nextSearchParams.set('status', key)
  }

  const nextQuery = nextSearchParams.toString()
  return nextQuery ? `${pathname}?${nextQuery}` : pathname
}

function LegacyRouteBridge({
  pathname,
  search,
  routeType,
  element
}: {
  pathname: string
  search: string
  routeType: 'approval' | 'publish'
  element: ReactElement
}) {
  const entry = `${pathname}${search ? `?${search}` : ''}`
  const routePath = `/service/:teamId/:side/:serviceId/${routeType}`

  return (
    <MemoryRouter initialEntries={[entry]} key={entry}>
      <Routes>
        <Route path={routePath} element={element} />
        <Route path={`${routePath}/*`} element={element} />
      </Routes>
    </MemoryRouter>
  )
}

export function ServiceDetailLegacyTabs({ side, type }: ServiceDetailLegacyTabsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { state } = useGlobalContext()
  const status = searchParams.get('status') || '0'
  const search = searchParams.toString()

  const tabItems = useMemo(
    () =>
      (type === 'approval' ? SYSTEM_INSIDE_APPROVAL_TAB_ITEMS : SYSTEM_PUBLISH_TAB_ITEMS)?.map((item) => ({
        ...item,
        label: typeof item?.label === 'string' ? $t(item.label) : item?.label
      })),
    [type, state.language]
  )

  const content = useMemo(() => {
    if (type === 'approval') {
      return side === 'aiInside' ? <AiServiceInsideApprovalList /> : <SystemInsideApprovalList />
    }

    return side === 'aiInside' ? <AiServiceInsidePublishList /> : <SystemInsidePublishList />
  }, [side, type])

  return (
    <>
      <Tabs
        activeKey={status}
        size="small"
        className="h-auto bg-MAIN_BG"
        tabBarStyle={{ paddingLeft: '10px' }}
        tabBarGutter={20}
        items={tabItems}
        destroyInactiveTabPane={true}
        onChange={(key) => {
          router.push(buildTabHref(pathname, new URLSearchParams(search), key))
        }}
      />
      <LegacyRouteBridge pathname={pathname} search={search} routeType={type} element={content} />
    </>
  )
}
