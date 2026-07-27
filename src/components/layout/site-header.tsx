'use client'

import Link from 'next/link'
import { useState } from 'react'

import { useCart } from '@/components/cart/cart-provider'

const nav = [
  { href: '/shop', label: 'Shop' },
  { href: '/length-guide', label: 'Length guide' },
  { href: '/restoration', label: 'Wig revamp' },
  { href: '/about', label: 'About' },
  { href: '/faq', label: 'FAQ' },
]

export function SiteHeader() {
  const { itemCount } = useCart()
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-vanilla-400 bg-vanilla-100">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5 md:h-16 md:px-12">
        <button
          type="button"
          className="text-ink md:hidden"
          aria-label="Open menu"
          onClick={() => setOpen(true)}
        >
          Menu
        </button>

        <Link href="/" className="font-display text-lg tracking-wide text-ink no-underline hover:no-underline md:text-xl">
          YBBEAUTYLOUNGE
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-ink no-underline hover:text-cherry-600 hover:no-underline"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/cart"
          className="text-sm font-semibold text-ink no-underline hover:text-cherry-600 hover:no-underline"
        >
          Cart{itemCount > 0 ? ` (${itemCount})` : ''}
        </Link>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-violet-800 p-6 text-vanilla-50 md:hidden">
          <div className="mb-8 flex items-center justify-between">
            <span className="font-display text-xl">YBBEAUTYLOUNGE</span>
            <button type="button" onClick={() => setOpen(false)} className="text-vanilla-50">
              Close
            </button>
          </div>
          <nav className="flex flex-col gap-6">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="text-2xl text-vanilla-50 no-underline"
              >
                {item.label}
              </Link>
            ))}
            <Link href="/cart" onClick={() => setOpen(false)} className="text-2xl text-vanilla-50 no-underline">
              Cart
            </Link>
            <Link href="/contact" onClick={() => setOpen(false)} className="text-2xl text-vanilla-50 no-underline">
              Contact
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
