import Link from 'next/link'

const highlights = [
  {
    title: '多协议 AI 服务',
    description: '统一接入 REST API、AI Service 与 MCP 服务，后续前台能力可以逐步承接现有 market 模块。'
  },
  {
    title: '服务市场入口',
    description: '前台首页先作为公共门户，后续再继续拆分服务列表、详情页、申请接入等完整链路。'
  },
  {
    title: '三套系统骨架',
    description: '当前先落前台 root 页面；后台继续保留现有 `(admin)`，未来可再补独立用户后台。'
  }
]

export default function FrontendHomePage() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-7xl flex-col justify-center px-6 py-16">
      <div className="max-w-3xl">
        <div className="mb-4 inline-flex rounded-full border border-[#5860ff]/40 bg-[#5860ff]/10 px-4 py-1 text-sm text-[#c7cbff]">
          前台初始架构
        </div>
        <h1 className="text-5xl font-semibold leading-tight text-white">
          APIPark 前台入口
        </h1>
        <p className="mt-6 text-lg leading-8 text-white/70">
          这里先作为前台的公共首页，不复用后台 layout，也不强绑旧路由。
          先把系统分层立住，后续再把服务市场和服务详情逐步迁进来。
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/admin/login"
            className="rounded-full bg-[#3d46f2] px-6 py-3 text-sm font-medium text-white hover:bg-[#5860ff]"
          >
            进入后台
          </Link>
          <a
            href="https://docs.apipark.com"
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-white/15 px-6 py-3 text-sm font-medium text-white/85 hover:text-white"
          >
            查看文档
          </a>
        </div>
      </div>

      <div className="mt-16 grid gap-6 md:grid-cols-3">
        {highlights.map((item) => (
          <section
            key={item.title}
            className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.25)]"
          >
            <h2 className="text-xl font-medium text-white">{item.title}</h2>
            <p className="mt-3 text-sm leading-7 text-white/65">{item.description}</p>
          </section>
        ))}
      </div>
    </div>
  )
}
