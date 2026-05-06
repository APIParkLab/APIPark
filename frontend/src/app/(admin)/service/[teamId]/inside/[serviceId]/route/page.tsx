import { ServiceRouteListPage } from '../../../../_components/ServicePages'

export default async function RestServiceRouteListRoutePage({
  params
}: {
  params: Promise<{ teamId: string; serviceId: string }>
}) {
  const { teamId, serviceId } = await params
  return <ServiceRouteListPage teamId={teamId} serviceId={serviceId} side="inside" />
}
