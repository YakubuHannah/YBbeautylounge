import { ProductCard } from '@/components/product/product-card'
import { CategoryFilter } from '@/components/shop/category-filter'
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
        <CategoryFilter categories={categories} activeSlug={categorySlug} activeName={activeName} />
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
