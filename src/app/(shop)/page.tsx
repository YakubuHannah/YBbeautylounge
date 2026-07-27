import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { ProductCard } from '@/components/product/product-card'
import { getActiveProducts } from '@/lib/products'

export const dynamic = 'force-dynamic'

const TEXTURE_TILES = [
  { label: 'Bone straight', textures: ['bone_straight'] },
  { label: 'Curly', textures: ['curly', 'kinky_curly'] },
  { label: 'Wavy', textures: ['body_wave', 'deep_wave', 'water_wave'] },
  { label: 'Bob', textures: ['bob'] },
]

export default async function HomePage() {
  const products = await getActiveProducts()
  const featured = products.filter((p) => p.featured).slice(0, 4)
  const show = featured.length ? featured : products.slice(0, 4)

  return (
    <main>
      <section className="relative flex min-h-[60vh] items-end bg-vanilla-200 px-5 pb-12 pt-24 md:px-12 md:pb-16">
        <div className="mx-auto w-full max-w-6xl">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-violet-800">
            New collection
          </p>
          <h1 className="mt-3 max-w-xl font-display text-4xl text-ink md:text-5xl">
            Bone straight, considered.
          </h1>
          <p className="mt-4 max-w-md text-base text-ink-muted">
            Premium wigs with clear attributes, verified reviews, and a restoration service
            built as carefully as the pieces themselves.
          </p>
          <div className="mt-8">
            <Link href="/shop">
              <Button variant="primary" className="h-12 px-8">
                Shop now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="border-y border-vanilla-400 bg-vanilla-50 px-5 py-8 md:px-12">
        <div className="mx-auto grid max-w-6xl gap-6 text-center sm:grid-cols-2 md:grid-cols-4">
          {[
            'Raw hair guarantee',
            'Lagos dispatch 1 business day',
            'Verified purchase reviews',
            'WhatsApp anytime',
          ].map((item) => (
            <p key={item} className="text-sm font-semibold text-ink">
              {item}
            </p>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 md:px-12 md:py-24">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-violet-800">
              Featured
            </p>
            <h2 className="mt-2 font-display text-3xl text-ink">Pieces worth keeping</h2>
          </div>
          <Link href="/shop" className="text-sm font-semibold text-cherry-600">
            View all
          </Link>
        </div>
        {show.length === 0 ? (
          <p className="text-ink-muted">Products are being prepared.</p>
        ) : (
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
            {show.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      <section className="bg-vanilla-200 px-5 py-16 md:px-12 md:py-24">
        <div className="mx-auto max-w-6xl">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-violet-800">
            Shop by texture
          </p>
          <h2 className="mt-2 font-display text-3xl text-ink">Find your finish</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {TEXTURE_TILES.map((t) => {
              const image = products.find(
                (p) => t.textures.includes(p.texture) && p.images[0]
              )?.images[0]
              return (
                <Link
                  key={t.label}
                  href="/shop"
                  className="group block overflow-hidden bg-vanilla-50 no-underline hover:no-underline"
                >
                  {image && (
                    <div className="aspect-[16/9] overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={image.url}
                        alt={image.alt_text || t.label}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <span
                    className={
                      image
                        ? 'block p-6 font-display text-2xl text-ink group-hover:text-cherry-700'
                        : 'flex min-h-[140px] items-end p-6 font-display text-2xl text-ink group-hover:text-cherry-700'
                    }
                  >
                    {t.label}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      <section className="bg-violet-800 px-5 py-16 text-vanilla-50 md:px-12 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-violet-200">
            Restoration
          </p>
          <h2 className="mt-3 font-display text-3xl md:text-4xl">Give a loved piece new life</h2>
          <p className="mx-auto mt-4 max-w-lg text-violet-200">
            Revamp and restoration with a clear quote, deposit, and status you can track — no
            endless chat threads.
          </p>
          <div className="mt-8">
            <Link
              href="/restoration"
              className="inline-flex h-12 items-center border border-vanilla-50 px-8 text-sm font-semibold text-vanilla-50 no-underline hover:bg-vanilla-50 hover:text-violet-800 hover:no-underline"
            >
              Explore restoration
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 md:px-12 md:py-24">
        <div className="max-w-xl">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-violet-800">
            The brand
          </p>
          <h2 className="mt-2 font-display text-3xl text-ink">Built for trust at this price</h2>
          <p className="mt-4 text-ink-muted">
            Every attribute published. Every review verified. Order tracking without messaging the
            founder. That is how a ₦185,000 purchase should feel.
          </p>
          <Link href="/about" className="mt-6 inline-block text-sm font-semibold text-cherry-600">
            Read the story
          </Link>
        </div>
      </section>
    </main>
  )
}
