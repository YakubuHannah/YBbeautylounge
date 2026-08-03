'use client'

import Link from 'next/link'
import { useState } from 'react'

import { useCart } from '@/components/cart/cart-provider'

const menuLinks = [
  { href: '/shop', label: 'Shop all' },
  { href: '/find-my-fit', label: 'Fit for your look' },
  { href: '/length-guide', label: 'Length guide' },
  { href: '/restoration', label: 'Wig revamp' },
  { href: '/reviews', label: 'Reviews' },
  { href: '/about', label: 'About' },
  { href: '/faq', label: 'FAQ' },
  { href: '/contact', label: 'Contact' },
]

export function SiteHeader() {
  const { itemCount } = useCart()
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-vanilla-400 bg-vanilla-100">
      <div className="mx-auto grid h-16 max-w-6xl grid-cols-[1fr_auto_1fr] items-center px-5 md:px-12">
        <button
          type="button"
          className="justify-self-start text-sm text-ink"
          aria-label="Open menu"
          onClick={() => setOpen(true)}
        >
          ☰ <span className="hidden sm:inline">Menu</span>
        </button>

        <Link href="/" className="block text-center no-underline hover:no-underline">
          <span className="block font-display text-lg tracking-wide text-ink md:text-xl">
            YBBEAUTYLOUNGE
          </span>
          <span className="block text-[9px] font-semibold uppercase tracking-[0.3em] text-ink-muted">
            Luxury wigs &amp; restoration
          </span>
        </Link>

        <Link
          href="/cart"
          className="justify-self-end text-sm font-semibold text-ink no-underline hover:text-cherry-600 hover:no-underline"
        >
          Cart{itemCount > 0 ? ` (${itemCount})` : ''}
        </Link>
      </div>

      <nav className="hidden items-center justify-center gap-6 border-t border-vanilla-400 px-5 py-3 text-[11px] font-semibold uppercase tracking-widest md:flex">
        {menuLinks
          .filter((item) => item.href !== '/contact')
          .map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${i === 0 ? 'text-ink' : 'text-ink-muted'} no-underline hover:text-cherry-600 hover:no-underline`}
            >
              {item.label}
            </Link>
          ))}
      </nav>

      {open && (
        <div className="fixed inset-0 z-50 bg-violet-800 p-6 text-vanilla-50">
          <div className="mb-8 flex items-center justify-between">
            <span className="font-display text-xl">YBBEAUTYLOUNGE</span>
            <button type="button" onClick={() => setOpen(false)} className="text-vanilla-50">
              Close
            </button>
          </div>
          <nav className="flex flex-col gap-5">
            {menuLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="text-2xl text-vanilla-50 no-underline"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/cart"
              onClick={() => setOpen(false)}
              className="text-2xl text-vanilla-50 no-underline"
            >
              Cart
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
