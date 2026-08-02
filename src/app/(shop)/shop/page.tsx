import Link from 'next/link'

import { ProductCard } from '@/components/product/product-card'
import { getActiveCategories, getActiveProducts } from '@/lib/products'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Shop' }

export default async function ShopPage({
  searchParams,
}: {
  searchParams: { category?: string }
}) {
  const categorySlug = searchParams.category || undefined
  const [products, categories] = await Promise.all([
    getActiveProducts(categorySlug),
    getActiveCategories(),
  ])

  return (
    <main className="mx-auto max-w-6xl px-5 py-10 md:px-12 md:py-16">
      <div className="max-w-2xl">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-violet-800">Shop</p>
        <h1 className="mt-2 font-display text-4xl text-ink">
          {categories.find((c) => c.slug === categorySlug)?.name ?? 'All products'}
        </h1>
        <p className="mt-3 text-ink-muted">
          Wigs, accessories, and everything that keeps a crown at its best.
        </p>
      </div>

      {categories.length > 0 && (
        <div className="mt-8 flex gap-2 overflow-x-auto pb-2">
          <Link
            href="/shop"
            className={`shrink-0 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wider no-underline hover:no-underline ${
              !categorySlug
                ? 'border-cherry-600 bg-cherry-50 text-ink'
                : 'border-vanilla-400 bg-vanilla-50 text-ink'
            }`}
          >
            All
          </Link>
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/shop?category=${c.slug}`}
              className={`shrink-0 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wider no-underline hover:no-underline ${
                categorySlug === c.slug
                  ? 'border-cherry-600 bg-cherry-50 text-ink'
                  : 'border-vanilla-400 bg-vanilla-50 text-ink'
              }`}
            >
              {c.name}
            </Link>
          ))}
        </div>
      )}

      {products.length === 0 ? (
        <p className="mt-12 text-ink-muted">
          {categorySlug ? 'Nothing in this category yet.' : 'No products published yet.'}
        </p>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-8 lg:grid-cols-3">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </main>
  )
}
