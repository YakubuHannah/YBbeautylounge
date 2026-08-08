import Link from 'next/link'

import { ProductCard } from '@/components/product/product-card'
import { getActiveCategories, getActiveProducts } from '@/lib/products'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Shop' }

function FilterItem({
  href,
  active,
  children,
}: {
  href: string
  active: boolean
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className={`block px-4 py-2.5 text-sm no-underline hover:no-underline ${
        active
          ? 'bg-cherry-50 font-semibold text-ink'
          : 'text-ink-muted hover:bg-vanilla-100 hover:text-ink'
      }`}
    >
      {children}
    </Link>
  )
}

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
  const activeName = categories.find((c) => c.slug === categorySlug)?.name ?? 'All products'

  return (
    <main className="mx-auto max-w-6xl px-5 py-10 md:px-12 md:py-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-violet-800">
            Shop
          </p>
          <h1 className="mt-2 font-display text-4xl text-ink md:text-6xl">{activeName}</h1>
          <p className="mt-3 text-ink-muted">
            Wigs, accessories, and everything that keeps a crown at its best.
          </p>
        </div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-ink-muted">
          {products.length} {products.length === 1 ? 'piece' : 'pieces'}
        </p>
      </div>

      {categories.length > 0 && (
        <details className="group relative z-10 mt-8 w-full max-w-xs">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-[2px] border border-vanilla-400 bg-vanilla-50 px-4 py-3 text-sm font-semibold text-ink [&::-webkit-details-marker]:hidden">
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
              className="h-4 w-4 transition-transform group-open:rotate-180"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
            </svg>
          </summary>
          <div className="absolute left-0 z-20 mt-2 max-h-80 w-full overflow-y-auto rounded-[2px] border border-vanilla-400 bg-vanilla-50 py-1">
            <FilterItem href="/shop" active={!categorySlug}>
              All
            </FilterItem>
            {categories.map((c) => (
              <FilterItem key={c.slug} href={`/shop?category=${c.slug}`} active={categorySlug === c.slug}>
                {c.name}
              </FilterItem>
            ))}
          </div>
        </details>
      )}

      {products.length === 0 ? (
        <p className="mt-12 text-ink-muted">
          {categorySlug ? 'Nothing in this category yet.' : 'No products published yet.'}
        </p>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-8">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </main>
  )
}
