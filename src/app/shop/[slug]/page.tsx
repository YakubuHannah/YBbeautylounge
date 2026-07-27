import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ProductPurchase } from '@/components/product/product-purchase'
import { getProductBySlug, textureLabel } from '@/lib/products'

export const dynamic = 'force-dynamic'

export default async function ProductPage({
  params,
}: {
  params: { slug: string }
}) {
  const product = await getProductBySlug(params.slug)
  if (!product) notFound()

  const v = product.variants[0]

  return (
    <main className="mx-auto max-w-6xl px-5 py-8 md:px-12 md:py-12">
      <nav className="mb-6 text-sm text-ink-muted">
        <Link href="/shop" className="text-ink-muted">
          Shop
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ink">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-3">
          <div className="aspect-[4/5] bg-vanilla-50" />
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-square bg-vanilla-50" />
            ))}
          </div>
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <ProductPurchase product={product} />
        </div>
      </div>

      <section className="mt-16 border-t border-vanilla-400 pt-12">
        <h2 className="font-display text-2xl text-ink">Details</h2>
        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          {[
            ['Texture', textureLabel(product.texture)],
            ['Origin', product.hair_origin ?? '—'],
            ['Density', v?.density_percent ? `${v.density_percent}%` : '—'],
            ['Draw type', v?.draw_type?.replace(/_/g, ' ') ?? '—'],
            ['Lace', [v?.lace_type, v?.lace_size].filter(Boolean).join(' · ') || '—'],
            ['Cap size', v?.cap_size ?? '—'],
            ['Weight', v?.weight_grams ? `${v.weight_grams}g` : '—'],
          ].map(([k, val]) => (
            <div key={k} className="border-b border-vanilla-400 pb-3">
              <dt className="text-[11px] font-semibold uppercase tracking-widest text-violet-800">
                {k}
              </dt>
              <dd className="mt-1 text-ink">{val}</dd>
            </div>
          ))}
        </dl>

        {product.description && (
          <div className="mt-10 max-w-2xl">
            <h3 className="font-display text-xl text-ink">Description</h3>
            <p className="mt-3 text-ink-muted">{product.description}</p>
          </div>
        )}

        {product.care_instructions && (
          <div className="mt-8 max-w-2xl">
            <h3 className="font-display text-xl text-ink">Care</h3>
            <p className="mt-3 text-ink-muted">{product.care_instructions}</p>
          </div>
        )}

        <p className="mt-8">
          <Link href="/length-guide" className="text-sm font-semibold text-cherry-600">
            Not sure about length? See the length guide
          </Link>
        </p>
      </section>
    </main>
  )
}
