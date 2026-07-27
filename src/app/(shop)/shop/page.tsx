import { ProductCard } from '@/components/product/product-card'
import { getActiveProducts, textureLabel } from '@/lib/products'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Shop' }

export default async function ShopPage() {
  const products = await getActiveProducts()
  const textures = Array.from(new Set(products.map((p) => p.texture)))

  return (
    <main className="mx-auto max-w-6xl px-5 py-10 md:px-12 md:py-16">
      <div className="max-w-2xl">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-violet-800">Shop</p>
        <h1 className="mt-2 font-display text-4xl text-ink">All products</h1>
        <p className="mt-3 text-ink-muted">
          Texture-first browsing. Filter by what actually matters: lace, density, length, cap size.
        </p>
      </div>

      {textures.length > 0 && (
        <div className="mt-8 flex gap-2 overflow-x-auto pb-2">
          {textures.map((t) => (
            <span
              key={t}
              className="shrink-0 rounded-full border border-vanilla-400 bg-vanilla-50 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-ink"
            >
              {textureLabel(t)}
            </span>
          ))}
        </div>
      )}

      {products.length === 0 ? (
        <p className="mt-12 text-ink-muted">No products published yet.</p>
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
