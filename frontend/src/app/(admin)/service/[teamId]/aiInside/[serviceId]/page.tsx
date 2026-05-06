import { redirect } from 'next/navigation'

export default async function AiServiceEntryPage({
  params
}: {
  params: Promise<{ teamId: string; serviceId: string }>
}) {
  const { teamId, serviceId } = await params
  redirect(`/service/${teamId}/aiInside/${serviceId}/overview`)
}
