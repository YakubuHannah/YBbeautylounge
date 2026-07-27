'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { useCart } from '@/components/cart/cart-provider'
import { formatNaira } from '@/lib/money'
import { textureLabel, type PublicProduct } from '@/lib/products'
import { whatsAppUrl } from '@/lib/whatsapp'

export function ProductPurchase({ product }: { product: PublicProduct }) {
  const router = useRouter()
  const { addItem } = useCart()
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
      </div>

      <div className="space-y-3">
        <p className="block text-[11px] font-semibold uppercase tracking-widest text-violet-800">
          Length & colorway
        </p>
        <div className="flex flex-wrap gap-2">
          {product.variants.map((v) => {
            const active = v.id === variant.id
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => setVariantId(v.id)}
                className={`rounded-[2px] border px-3 py-2 text-sm ${
                  active
                    ? 'border-cherry-600 bg-cherry-50 text-ink'
                    : 'border-vanilla-400 bg-vanilla-50 text-ink'
                }`}
              >
                {v.length_inches}&quot; {v.colorway}
              </button>
            )
          })}
        </div>
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
          href={whatsAppUrl(`Hi, I’m interested in ${product.name} (${label}).`)}
          target="_blank"
          rel="noreferrer"
          className="flex h-12 w-full items-center justify-center rounded-[2px] border border-ink text-sm font-semibold text-ink no-underline hover:bg-ink hover:text-vanilla-50 hover:no-underline"
        >
          Ask on WhatsApp
        </a>
      </div>

      <p className="text-sm text-ink-muted">
        Dispatched within 1 business day, then 2–4 days within Lagos (other zones vary).
      </p>
    </div>
  )
}
