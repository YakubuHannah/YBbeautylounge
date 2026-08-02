'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

const links = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/products', label: 'Products' },
  { href: '/admin/media', label: 'Media' },
  { href: '/admin/reviews', label: 'Reviews' },
  { href: '/admin/pages', label: 'Pages' },
  { href: '/admin/faq', label: 'FAQ' },
  { href: '/admin/settings', label: 'Settings' },
]

export function AdminShell({
  children,
  email,
}: {
  children: React.ReactNode
  email: string
}) {
  const pathname = usePathname()
  const router = useRouter()

  async function logout() {
    await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'logout' }),
    })
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-vanilla-100 text-ink">
      <header className="border-b border-vanilla-400 bg-violet-800 text-vanilla-50">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-violet-200">Admin</p>
            <p className="font-display text-xl">YBBeautylounge</p>
          </div>
          <nav className="flex flex-wrap items-center gap-4 text-sm">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`no-underline hover:underline ${
                  pathname === l.href ? 'text-vanilla-50 underline' : 'text-violet-200'
                }`}
              >
                {l.label}
              </Link>
            ))}
            <Link href="/" className="text-violet-200 no-underline hover:underline">
              Storefront
            </Link>
            <button type="button" onClick={logout} className="text-violet-200 underline">
              Log out
            </button>
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-5 py-8">{children}</div>
      <p className="px-5 pb-6 text-center text-xs text-ink-muted">Signed in as {email}</p>
    </div>
  )
}
