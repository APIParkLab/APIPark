import { ServiceOverviewPage } from '../../../../_components/ServicePages'

export default async function AiServiceOverviewRoutePage({
  params
}: {
  params: Promise<{ teamId: string; serviceId: string }>
}) {
  const { teamId, serviceId } = await params
  return <ServiceOverviewPage serviceType="aiService" teamId={teamId} serviceId={serviceId} />
}
