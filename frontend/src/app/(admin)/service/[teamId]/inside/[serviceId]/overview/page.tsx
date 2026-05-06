import { ServiceOverviewPage } from '../../../../_components/ServicePages'

export default async function RestServiceOverviewPage({
  params
}: {
  params: Promise<{ teamId: string; serviceId: string }>
}) {
  const { teamId, serviceId } = await params
  return <ServiceOverviewPage serviceType="restService" teamId={teamId} serviceId={serviceId} />
}
