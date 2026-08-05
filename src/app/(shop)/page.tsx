import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { FitFloat } from '@/components/layout/fit-float'
import { ProductCard } from '@/components/product/product-card'
import { getRecentImages } from '@/lib/media'
import { firstPhoto, getActiveCategories, getActiveProducts } from '@/lib/products'
import { getBeforeAfterImages } from '@/lib/restoration'
import { getWhatsAppNumber } from '@/lib/settings'
import { whatsAppUrl } from '@/lib/whatsapp'

export const dynamic = 'force-dynamic'

const TRUST_ITEMS: { icon: React.ReactNode; lines: [string, string] }[] = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6">
        <path d="M6 3h12l4 6-10 12L2 9l4-6z" />
        <path d="M2 9h20M9 3l3 6 3-6M12 9v12" />
      </svg>
    ),
    lines: ['100%', 'Human Hair'],
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6">
        <path d="M1 7h12v9H1zM13 10h5l3 3v3h-8z" />
        <circle cx="5" cy="18" r="1.6" />
        <circle cx="16" cy="18" r="1.6" />
      </svg>
    ),
    lines: ['Dispatch in', '3–5 Working Days'],
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6">
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c3 3 3 15 0 18-3-3-3-15 0-18z" />
      </svg>
    ),
    lines: ['Worldwide', 'Delivery'],
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6">
        <path d="M12 3l2.7 5.8 6.3.7-4.7 4.3 1.3 6.2L12 16.9 6.4 20l1.3-6.2L3 9.5l6.3-.7L12 3z" />
      </svg>
    ),
    lines: ['Reviews from', 'Verified Customers'],
  },
]

const STRIP_ITEMS: { title: string; sub: string }[] = [
  { title: 'Custom fit', sub: 'Made to fit your unique measurements' },
  { title: 'Expert craftsmanship', sub: 'Handcrafted by skilled wig experts' },
  { title: 'Secure payments', sub: 'Every payment confirmed before dispatch' },
  { title: 'Need help?', sub: 'Chat with our wig specialist on WhatsApp' },
]

export default async function HomePage() {
  const [products, categories, fillers, whatsappNumber, beforeAfter] = await Promise.all([
    getActiveProducts(),
    getActiveCategories(),
    getRecentImages(12),
    getWhatsAppNumber(),
    getBeforeAfterImages(),
  ])
  const featured = products.filter((p) => p.featured)
  const show = (featured.length ? featured : products).slice(0, 5)

  let fillerIndex = 0
  const nextFiller = () => (fillers.length ? fillers[fillerIndex++ % fillers.length] : null)

  const staticTiles: Record<string, string> = {
    'bone-straight': '/images/textures/bone-straight.jpg',
    curly: '/images/textures/curly.jpg',
    wavy: '/images/textures/wavy.jpg',
    'bob-wigs': '/images/textures/bob.jpg',
  }

  const categoryTiles = categories.map((c) => {
    // Best photo for the tile: the category's own product photo, then a library
    // photo whose name mentions the category, then the static texture shots.
    const productImage = products
      .filter((p) => p.category?.slug === c.slug)
      .map((p) => firstPhoto(p.images))
      .find(Boolean)
    const keyword = c.name.split(' ')[0].toLowerCase()
    const matchedFiller = fillers.find((f) =>
      `${f.filename} ${f.alt_text ?? ''}`.toLowerCase().includes(keyword)
    )
    const staticImage = staticTiles[c.slug]
      ? { url: staticTiles[c.slug], filename: c.slug, alt_text: c.name, focal_x: 50, focal_y: 50 }
      : null
    const image = productImage ?? matchedFiller ?? staticImage ?? nextFiller()
    return { ...c, image }
  })

  // Founder-selected photos (Admin → Pages → Wig revamp), else the built-in pair.
  const before = beforeAfter.before ?? {
    url: '/images/restoration-before.jpg',
    alt_text: 'Worn bob unit before restoration',
    focal_x: 50,
    focal_y: 50,
  }
  const after = beforeAfter.after ?? {
    url: '/images/restoration-after.jpg',
    alt_text: 'The same bob unit after restoration, sleek and full',
    focal_x: 50,
    focal_y: 50,
  }

  return (
    <main>
      <section className="bg-vanilla-200 px-5 pb-12 pt-10 md:px-12 md:pb-0">
        <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-[1.05fr_1fr]">
          <div className="md:pb-14">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-violet-800">
              Luxury wigs. Made for you.
            </p>
            <h1 className="mt-3 max-w-xl font-display text-4xl leading-tight text-ink md:text-6xl">
              Made for one head.
              <br />
              <em>Yours.</em>
            </h1>
            <p className="mt-5 max-w-md text-base text-ink-muted">
              Custom human hair wigs that look natural, feel flawless and last longer.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/shop">
                <Button variant="primary" className="h-12 px-8 uppercase tracking-wider">
                  Shop the collection
                </Button>
              </Link>
              <a
                href={whatsAppUrl(
                  'Hi YBBeautylounge, I’d like to order a custom wig made to my measurements.',
                  whatsappNumber
                )}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-12 items-center rounded-[2px] border border-ink px-8 text-sm font-medium uppercase tracking-wider text-ink no-underline hover:bg-ink hover:text-vanilla-50 hover:no-underline"
              >
                Custom wigs
              </a>
            </div>
            <div className="mt-10 flex flex-wrap gap-8">
              {TRUST_ITEMS.map((item) => (
                <div key={item.lines.join()} className="text-violet-800">
                  {item.icon}
                  <p className="mt-2 text-xs leading-tight text-ink">
                    {item.lines[0]}
                    <br />
                    {item.lines[1]}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative md:self-end md:pr-24">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/hero-model.webp"
              alt="Ginger straight unit worn long and sleek"
              className="mx-auto block h-auto w-full max-w-sm"
            />
            <Link
              href="/restoration"
              className="mt-4 block w-full border border-vanilla-400 bg-vanilla-50 p-4 no-underline hover:no-underline md:absolute md:right-0 md:top-[55%] md:mt-0 md:w-[210px]"
            >
              <p className="text-[11px] font-semibold uppercase tracking-widest text-ink">
                Hair restoration.
                <br />
                Real confidence.
              </p>
              {(
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div>
                    <div className="aspect-[3/4] overflow-hidden bg-vanilla-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={before.url}
                        alt={before.alt_text || 'Unit before restoration'}
                        className="h-full w-full object-cover"
                        style={{ objectPosition: `${before.focal_x}% ${before.focal_y}%` }}
                        loading="lazy"
                      />
                    </div>
                    <p className="mt-1 text-center text-[9px] font-semibold uppercase tracking-widest text-ink-muted">
                      Before
                    </p>
                  </div>
                  <div>
                    <div className="aspect-[3/4] overflow-hidden bg-vanilla-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={after.url}
                        alt={after.alt_text || 'Unit after restoration'}
                        className="h-full w-full object-cover"
                        style={{ objectPosition: `${after.focal_x}% ${after.focal_y}%` }}
                        loading="lazy"
                      />
                    </div>
                    <p className="mt-1 text-center text-[9px] font-semibold uppercase tracking-widest text-ink-muted">
                      After
                    </p>
                  </div>
                </div>
              )}
              <p className="mt-3 text-[11px] font-semibold uppercase tracking-widest text-cherry-600">
                See the transformation →
              </p>
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-12 md:px-12 md:py-16">
        <div className="mb-6 flex items-end justify-between gap-4">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-ink">
            Shop by category
          </p>
          <Link href="/shop" className="text-xs font-semibold text-cherry-600">
            View all categories
          </Link>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {categoryTiles.map((c) => (
            <Link
              key={c.slug}
              href={`/shop?category=${c.slug}`}
              className="group relative block w-36 shrink-0 overflow-hidden bg-vanilla-200 no-underline hover:no-underline sm:w-40"
            >
              <div className="aspect-[4/5]">
                {c.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={c.image.url}
                    alt={`${c.name} — YBBeautylounge`}
                    className="h-full w-full object-cover"
                    style={{ objectPosition: `${c.image.focal_x}% ${c.image.focal_y}%` }}
                    loading="lazy"
                  />
                )}
              </div>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/80 to-transparent px-3 pb-3 pt-8">
                <p className="text-sm font-semibold text-vanilla-50">{c.name}</p>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-vanilla-200">
                  Shop now →
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-16 md:px-12 md:pb-20">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-violet-800">
              Best sellers
            </p>
            <h2 className="mt-2 font-display text-3xl text-ink">Pieces worth keeping</h2>
          </div>
          <Link href="/shop" className="text-xs font-semibold text-cherry-600">
            View all products
          </Link>
        </div>
        {show.length === 0 ? (
          <p className="text-ink-muted">Products are being prepared.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-5">
            {show.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      <section className="bg-violet-800 px-5 py-10 text-vanilla-50 md:px-12">
        <div className="mx-auto grid max-w-6xl gap-8 sm:grid-cols-2 md:grid-cols-4">
          {STRIP_ITEMS.map((item) => (
            <div key={item.title}>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-vanilla-50">
                <span aria-hidden className="mr-1 text-violet-200">
                  ✦
                </span>
                {item.title}
              </p>
              {item.title === 'Need help?' ? (
                <a
                  href={whatsAppUrl('Hi YBBeautylounge, I need help choosing.', whatsappNumber)}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 block text-sm text-violet-200 underline"
                >
                  {item.sub}
                </a>
              ) : (
                <p className="mt-2 text-sm text-violet-200">{item.sub}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      <FitFloat />
    </main>
  )
}
