'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { useCart } from '@/components/cart/cart-provider'
import { formatNaira } from '@/lib/money'

type Recommendation = {
  name: string
  slug: string
  category: string | null
  price: number | null
  image: { url: string; alt_text: string | null; focal_x: number; focal_y: number } | null
}

export default function CartPage() {
  const { lines, subtotal, setQuantity, removeItem } = useCart()
  const [recs, setRecs] = useState<Recommendation[]>([])
  const [imgBySlug, setImgBySlug] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!lines.length) return
    const exclude = lines.map((l) => l.variantId).join(',')
    fetch(`/api/recommendations?exclude=${encodeURIComponent(exclude)}`)
      .then((res) => res.json())
      .then((data) => setRecs(data.recommendations || []))
      .catch(() => {})
  }, [lines])

  // Backfill photos for older cart lines saved before images were stored.
  useEffect(() => {
    const missing = Array.from(new Set(lines.filter((l) => !l.image).map((l) => l.productSlug)))
    if (!missing.length) return
    fetch(`/api/cart/images?slugs=${encodeURIComponent(missing.join(','))}`)
      .then((res) => res.json())
      .then((data) => setImgBySlug((prev) => ({ ...prev, ...data })))
      .catch(() => {})
  }, [lines])

  const freeDeliveryAt = 20000000
  const remaining = Math.max(0, freeDeliveryAt - subtotal)

  if (lines.length === 0) {
    return (
      <main className="mx-auto max-w-lg px-5 py-16 text-center md:px-12">
        <h1 className="font-display text-3xl text-ink">Your cart is empty</h1>
        <p className="mt-3 text-ink-muted">When you find a piece, it will land here.</p>
        <Link href="/shop" className="mt-8 inline-block">
          <Button variant="primary" className="h-12 px-8">
            Continue shopping
          </Button>
        </Link>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-xl px-5 py-10 md:px-12 md:py-16">
      <h1 className="font-display text-3xl text-ink">Cart</h1>

      {remaining > 0 ? (
        <p className="mt-4 rounded-[2px] bg-vanilla-200 px-4 py-3 text-sm text-ink">
          Add {formatNaira(remaining)} more for free delivery
        </p>
      ) : (
        <p className="mt-4 rounded-[2px] bg-vanilla-200 px-4 py-3 text-sm text-ink">
          You’ve unlocked free delivery
        </p>
      )}

      <ul className="mt-8 space-y-6">
        {lines.map((line) => (
          <li key={line.variantId} className="flex gap-4 border-b border-vanilla-400 pb-6">
            <Link
              href={`/shop/${line.productSlug}`}
              className="h-24 w-20 shrink-0 overflow-hidden bg-vanilla-50"
            >
              {(line.image ?? imgBySlug[line.productSlug]) && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={line.image ?? imgBySlug[line.productSlug]}
                  alt={line.productName}
                  className="h-full w-full object-cover"
                />
              )}
            </Link>
            <div className="min-w-0 flex-1">
              <Link
                href={`/shop/${line.productSlug}`}
                className="font-display text-lg text-ink no-underline hover:text-cherry-700"
              >
                {line.productName}
              </Link>
              <p className="text-sm text-ink-muted">{line.variantLabel}</p>
              <p className="mt-1 font-semibold tabular-nums text-cherry-600">
                {formatNaira(line.unitPrice)}
              </p>
              <div className="mt-3 flex items-center gap-3">
                <input
                  type="number"
                  min={1}
                  value={line.quantity}
                  onChange={(e) =>
                    setQuantity(line.variantId, Math.max(1, Number(e.target.value) || 1))
                  }
                  className="h-10 w-16 rounded-[2px] border border-vanilla-400 bg-vanilla-50 px-2 text-sm"
                />
                <button
                  type="button"
                  onClick={() => removeItem(line.variantId)}
                  className="text-sm text-ink-muted underline"
                >
                  Remove
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-8 space-y-2 bg-vanilla-200 p-5">
        <div className="flex justify-between text-sm">
          <span>Subtotal</span>
          <span className="tabular-nums font-semibold">{formatNaira(subtotal)}</span>
        </div>
        <p className="text-xs text-ink-muted">Delivery and VAT calculated at checkout</p>
      </div>

      {recs.length > 0 && (
        <section className="mt-10">
          <h2 className="font-display text-xl text-ink">Complete your look</h2>
          <div className="mt-4 grid grid-cols-2 gap-4">
            {recs.map((r) => (
              <Link
                key={r.slug}
                href={`/shop/${r.slug}`}
                className="group block no-underline hover:no-underline"
              >
                <div className="aspect-square overflow-hidden bg-vanilla-50">
                  {r.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={r.image.url}
                      alt={r.image.alt_text || r.name}
                      className="h-full w-full object-cover"
                      style={{ objectPosition: `${r.image.focal_x}% ${r.image.focal_y}%` }}
                      loading="lazy"
                    />
                  )}
                </div>
                {r.category && (
                  <p className="mt-2 text-[11px] font-semibold uppercase tracking-widest text-violet-800">
                    {r.category}
                  </p>
                )}
                <p className="font-display text-base text-ink group-hover:text-cherry-700">
                  {r.name}
                </p>
                {r.price != null && (
                  <p className="text-sm font-semibold tabular-nums text-cherry-600">
                    {formatNaira(r.price)}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      <Link href="/checkout" className="mt-6 block">
        <Button variant="primary" className="h-12 w-full">
          Checkout
        </Button>
      </Link>
      <Link href="/shop" className="mt-4 block text-center text-sm font-semibold text-cherry-600">
        Continue shopping
      </Link>
    </main>
  )
}
