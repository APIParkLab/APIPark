import Link from 'next/link'
import { ReactNode } from 'react'

export default function FrontendLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen bg-[#0b1020] text-white">
            <header className="border-b border-white/10 bg-[#0b1020]/90 backdrop-blur">
                <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6">
                    <Link href="/" className="text-lg font-semibold tracking-wide text-white">
                        APIPark
                    </Link>
                    <nav className="flex items-center gap-3 text-sm">
                        <Link href="/admin/login" className="rounded-full border border-white/15 px-4 py-2 text-white/85 hover:text-white">
                            后台登录
                        </Link>
                        <a
                            href="https://docs.apipark.com"
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-full bg-[#3d46f2] px-4 py-2 font-medium text-white hover:bg-[#5860ff]"
                        >
                            产品文档
                        </a>
                    </nav>
                </div>
            </header>
            <main>{children}</main>
        </div>
    )
}
