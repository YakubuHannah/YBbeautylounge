'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

type Category = { name: string; slug: string }

export function CategoryFilter({
  categories,
  activeSlug,
  activeName,
}: {
  categories: Category[]
  activeSlug?: string
  activeName: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close when clicking outside the card or pressing Escape.
  useEffect(() => {
    if (!open) return
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const itemClass = (active: boolean) =>
    `block px-4 py-2.5 text-sm no-underline hover:no-underline ${
      active ? 'bg-cherry-50 font-semibold text-ink' : 'text-ink-muted hover:bg-vanilla-100 hover:text-ink'
    }`

  return (
    <div ref={ref} className="relative z-10 mt-8 w-full max-w-xs">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 rounded-[2px] border border-vanilla-400 bg-vanilla-50 px-4 py-3 text-sm font-semibold text-ink"
      >
        <span className="flex items-center gap-2">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
            className="h-4 w-4 text-violet-800"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h18M6 12h12M10 19h4" />
          </svg>
          {activeName === 'All products' ? 'All categories' : activeName}
        </span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden="true"
          className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 z-20 mt-2 max-h-80 w-full overflow-y-auto rounded-[2px] border border-vanilla-400 bg-vanilla-50 py-1">
          <Link href="/shop" onClick={() => setOpen(false)} className={itemClass(!activeSlug)}>
            All
          </Link>
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/shop?category=${c.slug}`}
              onClick={() => setOpen(false)}
              className={itemClass(activeSlug === c.slug)}
            >
              {c.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
