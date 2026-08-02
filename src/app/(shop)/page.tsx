import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { ProductCard } from '@/components/product/product-card'
import { getActiveProducts } from '@/lib/products'

export const dynamic = 'force-dynamic'

const TEXTURE_TILES = [
  { label: 'Bone straight', image: '/images/textures/bone-straight.jpg' },
  { label: 'Curly', image: '/images/textures/curly.jpg' },
  { label: 'Wavy', image: '/images/textures/wavy.jpg' },
  { label: 'Bob', image: '/images/textures/bob.jpg' },
]

export default async function HomePage() {
  const products = await getActiveProducts()
  const featured = products.filter((p) => p.featured).slice(0, 3)
  const show = featured.length ? featured : products.slice(0, 3)

  return (
    <main>
      <section className="relative flex min-h-[40vh] items-center bg-vanilla-200 px-5 py-12 md:px-12">
        <div className="mx-auto w-full max-w-6xl">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-violet-800">
            Wigs and restoration
          </p>
          <h1 className="mt-3 max-w-xl font-display text-4xl text-ink md:text-5xl">
            Made for one head.
          </h1>
          <p className="mt-4 max-w-md text-base text-ink-muted">
            Customised human hair wigs, and a restoration studio for the ones you already own.
          </p>
          <div className="mt-8">
            <Link href="/shop">
              <Button variant="primary" className="h-12 px-8">
                Shop the collection
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="border-y border-vanilla-400 bg-vanilla-50 px-5 py-8 md:px-12">
        <div className="mx-auto grid max-w-6xl gap-6 text-center sm:grid-cols-2 md:grid-cols-4">
          {[
            '100% human hair',
            'Dispatched within 3–5 working days',
            'Reviews from verified purchases',
            'Worldwide delivery',
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
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-8 lg:grid-cols-3">
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
            {TEXTURE_TILES.map((t) => (
              <Link
                key={t.label}
                href="/shop"
                className="group block overflow-hidden bg-vanilla-50 no-underline hover:no-underline"
              >
                <div className="aspect-[3/1] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={t.image}
                    alt={`${t.label} hair`}
                    className="h-full w-full object-cover"
                  />
                </div>
                <span className="block px-6 py-5 font-display text-2xl text-ink group-hover:text-cherry-700">
                  {t.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-violet-800 px-5 py-16 text-vanilla-50 md:px-12 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-violet-200">
            Revamp and restoration
          </p>
          <h2 className="mt-3 font-display text-3xl md:text-4xl">Bring it back when it wears.</h2>
          <p className="mx-auto mt-4 max-w-lg text-violet-200">
            Send us a piece you already love. A clear quote before any work begins, and you can
            follow its progress from your phone.
          </p>
          <div className="mt-8">
            <Link
              href="/restoration"
              className="inline-flex h-12 items-center border border-vanilla-50 px-8 text-sm font-semibold text-vanilla-50 no-underline hover:bg-vanilla-50 hover:text-violet-800 hover:no-underline"
            >
              See how it works
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 md:px-12 md:py-24">
        <div className="max-w-xl">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-violet-800">
            Our story
          </p>
          <h2 className="mt-2 font-display text-3xl text-ink">The crown is not a metaphor.</h2>
          <p className="mt-4 text-ink-muted">
            There is a way a woman walks when her hair is right. You have seen it.
          </p>
          <Link href="/about" className="mt-6 inline-block text-sm font-semibold text-cherry-600">
            Read the story
          </Link>
        </div>
      </section>
    </main>
  )
}
