import Link from 'next/link'
import { formatNaira } from '@/lib/money'
import { minPrice, textureLabel, type PublicProduct } from '@/lib/products'

export function ProductCard({ product }: { product: PublicProduct }) {
  const price = minPrice(product)
  const lowStock = product.variants.some(
    (v) => v.stock_quantity > 0 && v.stock_quantity <= 2
  )

  return (
    <Link
      href={`/shop/${product.slug}`}
      className="group block no-underline hover:no-underline"
    >
      <div className="aspect-[4/5] bg-vanilla-50" />
      <div className="mt-3 space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-violet-800">
          {textureLabel(product.texture)}
        </p>
        <h3 className="font-display text-lg text-ink group-hover:text-cherry-700">
          {product.name}
        </h3>
        {price != null && (
          <p className="text-base font-semibold tabular-nums text-cherry-600">
            {formatNaira(price)}
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
