import { redirect } from 'next/navigation'

export default async function ServiceLegacyFallbackPage({
  params
}: {
  params: Promise<{ slug: string[] }>
}) {
  const { slug } = await params

  if (slug.length >= 4 && (slug[1] === 'inside' || slug[1] === 'aiInside')) {
    redirect(`/service/${slug[0]}/${slug[1]}/${slug[2]}/overview`)
  }

  redirect('/service/list')
}
