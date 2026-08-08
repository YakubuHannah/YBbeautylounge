'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { useCart } from '@/components/cart/cart-provider'
import { formatNaira } from '@/lib/money'
import { textureLabel, type PublicProduct } from '@/lib/products'
import { whatsAppUrl } from '@/lib/whatsapp'
import { usePublicSettings } from '@/components/settings/settings-provider'

export function ProductPurchase({ product }: { product: PublicProduct }) {
  const router = useRouter()
  const { addItem } = useCart()
  const { whatsapp_number } = usePublicSettings()
  const [variantId, setVariantId] = useState(product.variants[0]?.id ?? '')
  const [qty, setQty] = useState(1)

  const variant = useMemo(
    () => product.variants.find((v) => v.id === variantId) ?? product.variants[0],
    [product.variants, variantId]
  )

  if (!variant) {
    return <p className="text-ink-muted">This product is currently unavailable.</p>
  }

  const label = [
    variant.length_inches ? `${variant.length_inches}"` : null,
    variant.colorway,
    variant.density_percent ? `${variant.density_percent}%` : null,
  ]
    .filter(Boolean)
    .join(' · ')

  const instalment = Math.round(variant.price / 4)
  const deposit = Math.round(variant.price / 2)

  // Readable highlights for the selected option, empties dropped. Casing follows
  // what the founder types; only the first letter is lifted for a clean look.
  const highlights: string[] = [
    product.hair_origin ?? '',
    variant.draw_type?.replace(/_/g, ' ') ?? '',
    [variant.lace_size, variant.lace_type].filter(Boolean).join(' '),
    variant.density_percent ? `${variant.density_percent}% density` : '',
    variant.cap_size ? `${variant.cap_size} cap` : '',
    variant.weight_grams ? `${variant.weight_grams}g` : '',
    'Ships in 3–5 working days',
  ].filter(Boolean)

  function handleAdd() {
    addItem(
      {
        variantId: variant.id,
        productId: product.id,
        productName: product.name,
        productSlug: product.slug,
        variantLabel: label,
        unitPrice: variant.price,
      },
      qty
    )
    router.push('/cart')
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-violet-800">
          {textureLabel(product.texture)}
        </p>
        <h1 className="mt-2 font-display text-3xl text-ink md:text-4xl">{product.name}</h1>
        <p className="mt-3 text-2xl font-semibold tabular-nums text-cherry-600">
          {formatNaira(variant.price)}
        </p>
        <p className="mt-2 text-sm text-ink-muted">
          or 4 payments of {formatNaira(instalment)} · or {formatNaira(deposit)} today, balance
          before dispatch
        </p>

        {highlights.length > 0 && (
          <ul className="mt-5 space-y-2">
            {highlights.map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm text-ink">
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                  className="h-4 w-4 shrink-0 text-violet-800"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.7 5.3a1 1 0 010 1.42l-7.5 7.5a1 1 0 01-1.42 0L3.3 9.7a1 1 0 111.42-1.42l2.79 2.8 6.79-6.8a1 1 0 011.42 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="first-letter:uppercase">{item}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="space-y-3">
        <label
          htmlFor="purchase-length"
          className="block text-[11px] font-semibold uppercase tracking-widest text-violet-800"
        >
          Length
        </label>
        <select
          id="purchase-length"
          value={variant.id}
          onChange={(e) => setVariantId(e.target.value)}
          className="h-12 w-full rounded-[2px] border border-vanilla-400 bg-vanilla-50 px-3 text-ink"
        >
          {product.variants.map((v) => {
            const soldOut = v.stock_quantity <= 0
            const name = [v.length_inches ? `${v.length_inches} inches` : null, v.colorway]
              .filter(Boolean)
              .join(' · ')
            return (
              <option key={v.id} value={v.id} disabled={soldOut}>
                {name || 'Option'}
                {soldOut ? ' — sold out' : ''}
              </option>
            )
          })}
        </select>
        <p className="text-sm text-ink-muted">
          {variant.stock_quantity > 2 && 'In stock'}
          {variant.stock_quantity > 0 && variant.stock_quantity <= 2 && (
            <span className="text-[11px] font-semibold uppercase tracking-widest text-ink">
              Only {variant.stock_quantity} left
            </span>
          )}
          {variant.stock_quantity <= 0 && 'Out of stock'}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <label htmlFor="purchase-qty" className="text-[11px] font-semibold uppercase tracking-widest text-violet-800">
          Qty
        </label>
        <input
          id="purchase-qty"
          type="number"
          min={1}
          max={Math.max(1, variant.stock_quantity)}
          value={qty}
          onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
          className="h-12 w-20 rounded-[2px] border border-vanilla-400 bg-vanilla-50 px-3 text-ink"
        />
      </div>

      <div className="space-y-3">
        <Button
          type="button"
          variant="primary"
          className="h-12 w-full"
          disabled={variant.stock_quantity <= 0}
          onClick={handleAdd}
        >
          Add to cart
        </Button>
        <a
          href={whatsAppUrl(`Hi, I’m interested in ${product.name} (${label}).`, whatsapp_number)}
          target="_blank"
          rel="noreferrer"
          className="flex h-12 w-full items-center justify-center rounded-[2px] border border-ink text-sm font-semibold text-ink no-underline hover:bg-ink hover:text-vanilla-50 hover:no-underline"
        >
          Ask on WhatsApp
        </a>
      </div>
    </div>
  )
}
