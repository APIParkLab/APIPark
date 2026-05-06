import { redirect } from 'next/navigation'

export default async function RestServiceEntryPage({
  params
}: {
  params: Promise<{ teamId: string; serviceId: string }>
}) {
  const { teamId, serviceId } = await params
  redirect(`/service/${teamId}/inside/${serviceId}/overview`)
}
