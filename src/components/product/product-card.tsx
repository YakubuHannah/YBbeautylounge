import Link from 'next/link'

import { formatNaira } from '@/lib/money'
import { minPrice, textureLabel, type PublicProduct } from '@/lib/products'

export function ProductCard({ product }: { product: PublicProduct }) {
  const price = minPrice(product)
  const lowStock = product.variants.some(
    (v) => v.stock_quantity > 0 && v.stock_quantity <= 2
  )
  const image = product.images[0]

  return (
    <Link
      href={`/shop/${product.slug}`}
      className="group block no-underline hover:no-underline"
    >
      <div className="aspect-square overflow-hidden bg-vanilla-50">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image.url}
            alt={image.alt_text || product.name}
            className="h-full w-full object-cover"
            style={{ objectPosition: `${image.focal_x}% ${image.focal_y}%` }}
          />
        ) : null}
      </div>
      <div className="mt-3 space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-violet-800">
          {textureLabel(product.texture)}
        </p>
        <h3 className="min-h-[3.5rem] font-display text-lg text-ink group-hover:text-cherry-700">
          {product.name}
        </h3>
        {price != null && (
          <p className="text-base font-semibold tabular-nums text-cherry-600">
            {formatNaira(price)}
          </p>
        )}
        {product.review_count > 0 && (
          <p className="text-xs text-ink-muted">
            {product.avg_rating.toFixed(1)} · {product.review_count} reviews
          </p>
        )}
        {lowStock && (
          <p className="text-[11px] font-semibold uppercase tracking-widest text-ink">
            Low stock
          </p>
        )}
      </div>
    </Link>
  )
}
