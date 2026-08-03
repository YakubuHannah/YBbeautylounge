import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { FitFloat } from '@/components/layout/fit-float'
import { ProductCard } from '@/components/product/product-card'
import { getActiveCategories, getActiveProducts } from '@/lib/products'

export const dynamic = 'force-dynamic'

/** Static fallback tile images until a category has product photos of its own. */
const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  hair: '/images/textures/bone-straight.jpg',
}

const TRUST_ITEMS = [
  '100% human hair',
  'Dispatched within 3–5 working days',
  'Worldwide delivery',
  'Reviews from verified purchases',
]

export default async function HomePage() {
  const [products, categories] = await Promise.all([
    getActiveProducts(),
    getActiveCategories(),
  ])
  const featured = products.filter((p) => p.featured).slice(0, 3)
  const show = featured.length ? featured : products.slice(0, 3)

  const categoryTiles = categories.map((c) => {
    const productImage = products.find(
      (p) => p.category?.slug === c.slug && p.images[0]
    )?.images[0]
    return {
      ...c,
      image: productImage
        ? { url: productImage.url, focal_x: productImage.focal_x, focal_y: productImage.focal_y }
        : CATEGORY_FALLBACK_IMAGES[c.slug]
          ? { url: CATEGORY_FALLBACK_IMAGES[c.slug], focal_x: 50, focal_y: 50 }
          : null,
    }
  })

  return (
    <main>
      <section className="bg-vanilla-200 px-5 py-12 md:px-12 md:py-16">
        <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-[1.1fr_1fr]">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-violet-800">
              Luxury wigs. Made for you.
            </p>
            <h1 className="mt-3 max-w-xl font-display text-4xl text-ink md:text-5xl">
              Made for one head.
              <br />
              Yours.
            </h1>
            <p className="mt-4 max-w-md text-base text-ink-muted">
              Custom human hair wigs that look natural, feel flawless and last longer.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/shop">
                <Button variant="primary" className="h-12 px-8">
                  Shop the collection
                </Button>
              </Link>
              <Link href="/find-my-fit">
                <Button variant="secondary" className="h-12 px-8">
                  Fit for your look
                </Button>
              </Link>
            </div>
            <div className="mt-10 grid max-w-md grid-cols-2 gap-4">
              {TRUST_ITEMS.map((item) => (
                <p key={item} className="text-xs font-semibold text-ink">
                  <span aria-hidden className="mr-1 text-violet-800">
                    ✦
                  </span>
                  {item}
                </p>
              ))}
            </div>
          </div>

          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/hero-model.jpg"
              alt="Body wave unit worn full and flowing"
              className="mx-auto h-auto w-full max-w-md mix-blend-multiply"
            />
            <Link
              href="/restoration"
              className="mt-4 block border border-vanilla-400 bg-vanilla-50 p-5 no-underline hover:no-underline md:absolute md:-bottom-4 md:right-0 md:mt-0 md:max-w-[240px]"
            >
              <p className="text-[11px] font-semibold uppercase tracking-widest text-violet-800">
                Hair restoration
              </p>
              <p className="mt-2 font-display text-lg leading-snug text-ink">
                Worn today. Revived tomorrow.
              </p>
              <p className="mt-3 text-xs font-semibold text-cherry-600">
                See the transformation →
              </p>
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 md:px-12 md:py-20">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-violet-800">
              Shop by category
            </p>
            <h2 className="mt-2 font-display text-3xl text-ink">Find your fit</h2>
          </div>
          <Link href="/shop" className="text-sm font-semibold text-cherry-600">
            View all
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {categoryTiles.map((c) => (
            <Link
              key={c.slug}
              href={`/shop?category=${c.slug}`}
              className="group block overflow-hidden bg-vanilla-50 no-underline hover:no-underline"
            >
              {c.image ? (
                <div className="aspect-square overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={c.image.url}
                    alt={`${c.name} from YBBeautylounge`}
                    className="h-full w-full object-cover"
                    style={{ objectPosition: `${c.image.focal_x}% ${c.image.focal_y}%` }}
                    loading="lazy"
                  />
                </div>
              ) : (
                <div className="flex aspect-square items-center justify-center bg-vanilla-200" />
              )}
              <div className="px-4 py-4">
                <p className="font-display text-lg text-ink group-hover:text-cherry-700">
                  {c.name}
                </p>
                <p className="text-xs font-semibold text-cherry-600">Shop now →</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-16 md:px-12 md:pb-24">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-violet-800">
              Best sellers
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

      <FitFloat />
    </main>
  )
}
