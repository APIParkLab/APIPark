import { ServiceRouteListPage } from '../../../../_components/ServicePages'

export default async function AiServiceRouteListRoutePage({
  params
}: {
  params: Promise<{ teamId: string; serviceId: string }>
}) {
  const { teamId, serviceId } = await params
  return <ServiceRouteListPage teamId={teamId} serviceId={serviceId} side="aiInside" />
}
