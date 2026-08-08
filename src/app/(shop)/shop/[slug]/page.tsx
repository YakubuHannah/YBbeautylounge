import { notFound } from 'next/navigation'
import Link from 'next/link'

import { FitFloat } from '@/components/layout/fit-float'
import { ProductGallery } from '@/components/product/product-gallery'
import { ProductPurchase } from '@/components/product/product-purchase'
import { ReviewForm } from '@/components/product/review-form'
import { getApprovedReviews, getProductBySlug } from '@/lib/products'

export const dynamic = 'force-dynamic'

export default async function ProductPage({
  params,
}: {
  params: { slug: string }
}) {
  const product = await getProductBySlug(params.slug)
  if (!product) notFound()

  const reviews = await getApprovedReviews(product.id)
  const images = product.images

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
        <ProductGallery images={images} name={product.name} />

        <div className="lg:sticky lg:top-24 lg:self-start">
          <ProductPurchase product={product} />
        </div>
      </div>

      <section className="mt-16 border-t border-vanilla-400 pt-12">
        {product.description && (
          <div className="max-w-2xl">
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

      <section className="mt-16 border-t border-vanilla-400 pt-12">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-display text-2xl text-ink">Reviews</h2>
          <Link href="/reviews" className="text-sm font-semibold text-cherry-600">
            All reviews
          </Link>
        </div>
        {product.review_count > 0 && (
          <p className="mt-2 text-sm text-ink-muted">
            {product.avg_rating.toFixed(1)} average · {product.review_count} reviews
          </p>
        )}
        {reviews.length === 0 ? (
          <p className="mt-6 text-ink-muted">No approved reviews yet.</p>
        ) : (
          <ul className="mt-8 space-y-6">
            {reviews.map((r) => (
              <li key={r.id} className="border-b border-vanilla-400 pb-6">
                <p className="text-sm font-semibold text-ink">
                  {r.rating}/5 · {r.display_name}
                </p>
                {r.title && <p className="mt-1 font-medium">{r.title}</p>}
                {r.body && <p className="mt-2 text-ink-muted">{r.body}</p>}
              </li>
            ))}
          </ul>
        )}
        <ReviewForm productId={product.id} />
      </section>

      <FitFloat />
    </main>
  )
}
