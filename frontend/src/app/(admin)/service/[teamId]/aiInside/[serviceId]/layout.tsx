'use client'

import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'
import { ServiceDetailLayout } from '../../../_components/ServicePages'

const serviceKeys = [
  'overview',
  'route',
  'api',
  'document',
  'servicepolicy',
  'publish',
  'approval',
  'subscriber',
  'setting',
  'logs'
] as const

function getActiveKey(pathname: string) {
  const segments = pathname.split('/').filter(Boolean)
  const active = segments[4]
  return (serviceKeys.find((key) => key === active) || 'overview') as (typeof serviceKeys)[number]
}

export default function AiServiceDetailLayout({
  children,
  params
}: {
  children: ReactNode
  params: { teamId: string; serviceId: string }
}) {
  const pathname = usePathname()
  const { teamId, serviceId } = params

  return (
    <ServiceDetailLayout
      teamId={teamId}
      serviceId={serviceId}
      side="aiInside"
      activeKey={getActiveKey(pathname)}
    >
      {children}
    </ServiceDetailLayout>
  )
}
