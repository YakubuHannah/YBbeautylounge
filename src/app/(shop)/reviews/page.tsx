import Link from 'next/link'

import { ReviewSubmit } from '@/components/reviews/review-submit'
import { getActiveProducts, getAllApprovedReviews } from '@/lib/products'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Reviews' }

export default async function ReviewsPage() {
  const [reviews, products] = await Promise.all([
    getAllApprovedReviews(),
    getActiveProducts(),
  ])

  return (
    <main className="mx-auto max-w-6xl px-5 py-16 md:px-12">
      <div className="max-w-2xl">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-violet-800">
          Real customers
        </p>
        <h1 className="mt-2 font-display text-4xl text-ink">Reviews</h1>
        <p className="mt-3 text-ink-muted">
          How the pieces hold up in real life — worn, styled, and living with their owners.
        </p>
      </div>

      {reviews.length === 0 ? (
        <p className="mt-10 text-ink-muted">No approved reviews yet — be the first below.</p>
      ) : (
        <div className="mt-10 grid gap-8 md:grid-cols-2">
          {reviews.map((r) => (
            <article key={r.id} className="border-b border-vanilla-400 pb-8">
              <p className="text-sm font-semibold text-ink">
                {r.rating}/5 · {r.display_name}
              </p>
              <Link
                href={`/shop/${r.product.slug}`}
                className="mt-1 inline-block text-[11px] font-semibold uppercase tracking-widest text-violet-800 no-underline hover:underline"
              >
                {r.product.name}
              </Link>
              {r.title && <p className="mt-2 font-medium text-ink">{r.title}</p>}
              {r.body && <p className="mt-2 text-ink-muted">{r.body}</p>}
              {r.images.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {r.images.map((img) => (
                    <div key={img.id} className="aspect-square overflow-hidden bg-vanilla-50">
                      {img.media_asset.mime_type.startsWith('video/') ? (
                        <video
                          src={img.media_asset.url}
                          className="h-full w-full object-cover"
                          controls
                          preload="metadata"
                        />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={img.media_asset.url}
                          alt={img.media_asset.alt_text || `${r.product.name} on a customer`}
                          className="h-full w-full object-cover"
                          style={{
                            objectPosition: `${img.media_asset.focal_x}% ${img.media_asset.focal_y}%`,
                          }}
                          loading="lazy"
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      <section className="mt-16 border-t border-vanilla-400 pt-12">
        <h2 className="font-display text-2xl text-ink">Share yours</h2>
        <p className="mt-2 max-w-xl text-sm text-ink-muted">
          Bought from us before? Tell everyone how the piece is holding up — photos and videos
          welcome. Reviews appear after approval.
        </p>
        <div className="mt-8">
          <ReviewSubmit products={products.map((p) => ({ id: p.id, name: p.name }))} />
        </div>
      </section>
    </main>
  )
}
