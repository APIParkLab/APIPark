import { Tabs, TabsProps } from 'antd'
import DashboardTotal from './DashboardTotal'
import { Outlet, useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { $t } from '@common/locales'
import { RouterParams } from '@common/const/type'

export default function DashboardTabPage() {
  const { dashboardType } = useParams<RouterParams>()
  const navigateTo = useNavigate()

  useEffect(() => {
    const activeKey = dashboardType || 'total'
    navigateTo(`/analytics/${activeKey === 'total' ? activeKey : `${activeKey}/list`}`)
  }, [dashboardType])

  return (
    <>
      <Outlet />
    </>
  )
}
