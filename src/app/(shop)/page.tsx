import Link from 'next/link'

import { ProductCard } from '@/components/product/product-card'
import { getRecentImages } from '@/lib/media'
import { firstPhoto, getActiveCategories, getActiveProducts } from '@/lib/products'
import { getBeforeAfterImages } from '@/lib/restoration'
import { getWhatsAppNumber } from '@/lib/settings'
import { whatsAppUrl } from '@/lib/whatsapp'

export const dynamic = 'force-dynamic'

const HERO_IMAGE = '/images/hero-model.webp'

// Deterministic shuffle (seeded), so a 2-day window is stable but each window
// differs. Avoids Math.random, which would reshuffle on every visit.
function seededShuffle<T>(arr: T[], seed: number): T[] {
  let a = seed >>> 0
  const rand = () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

const MARQUEE = [
  '100% Human hair',
  'Dispatch in 3–5 working days',
  'Worldwide delivery',
  'Custom fit, ready to wear',
  'Reviews from verified customers',
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
  const pool = featured.length ? featured : products
  // Best sellers: show the 4 set as featured; every 2 days shuffle to a random
  // 4, then return to the set 4, alternating. Seeded so it stays put for the
  // whole 2-day window instead of reshuffling on every visit.
  const dayIndex = Math.floor(Date.now() / 86_400_000)
  const period = Math.floor(dayIndex / 2)
  const showFeatured = period % 2 === 0 && featured.length > 0
  const show = showFeatured ? featured.slice(0, 4) : seededShuffle(products, period).slice(0, 4)

  let fillerIndex = 0
  const nextFiller = () => (fillers.length ? fillers[fillerIndex++ % fillers.length] : null)

  const staticTiles: Record<string, string> = {
    'bone-straight': '/images/textures/bone-straight.jpg',
    curly: '/images/textures/curly.jpg',
    wavy: '/images/textures/wavy.jpg',
    'bob-wigs': '/images/textures/bob.jpg',
  }

  const categoryTiles = categories.map((c) => {
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

  // The two pathway tiles use a stable pick (not the rotating best-sellers).
  const readyImg = firstPhoto(pool[0]?.images ?? [])?.url ?? HERO_IMAGE
  const customImg =
    firstPhoto(pool[1]?.images ?? [])?.url ?? firstPhoto(pool[0]?.images ?? [])?.url ?? HERO_IMAGE

  // A blurred hair photo behind the hero text only (desktop). Pick by product
  // name — a beautiful non-ginger unit (burgundy / bouncy wavy / chestnut) — so
  // the model side stays reddish-brown.
  const pname = (p: (typeof products)[number]) => `${p.name} ${p.slug}`.toLowerCase()
  const backdropProduct =
    products.find((p) => ['burgundy', 'bouncy', 'wavy', 'chestnut'].some((k) => pname(p).includes(k))) ??
    products.find((p) => !pname(p).includes('ginger'))
  const heroBackdropUrl = firstPhoto(backdropProduct?.images ?? [])?.url

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

  const customWhatsApp = whatsAppUrl(
    'Hi YBBeautylounge, I’d like to order a custom wig made to my measurements.',
    whatsappNumber
  )

  return (
    <main>
      {/* Hero — full-bleed editorial */}
      <section className="relative h-[86vh] min-h-[560px] w-full overflow-hidden bg-ink">
        {/* Blurred hair behind the text (desktop). A smooth gradient fades it into
            the reddish-brown before the model, so there is no hard edge. */}
        {heroBackdropUrl && (
          <div aria-hidden className="absolute inset-0 hidden md:block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={heroBackdropUrl} alt="" className="h-full w-full object-cover blur-md" />
            <div className="absolute inset-0 bg-gradient-to-r from-ink/55 via-ink/75 to-ink" />
          </div>
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={HERO_IMAGE}
          alt="Sleek ginger straight unit worn long"
          className="absolute inset-0 h-full w-full object-cover object-top md:object-contain md:object-right-top"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/45 to-ink/10 md:hidden" />
        <div className="relative mx-auto flex h-full max-w-6xl flex-col justify-end px-5 pb-16 md:justify-center md:px-12 md:pb-0">
          <div className="max-w-xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-vanilla-200">
              Luxury wigs &amp; restoration
            </p>
            <h1 className="mt-4 font-display text-5xl leading-[0.95] text-vanilla-50 md:text-7xl">
              Made for one head.
              <br />
              <em>Yours.</em>
            </h1>
            <p className="mt-6 max-w-md text-base text-vanilla-100 md:text-lg">
              Custom human hair wigs that look natural, feel flawless and last longer.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="/shop"
                className="inline-flex h-12 items-center bg-vanilla-50 px-9 text-sm font-semibold uppercase tracking-widest text-ink no-underline transition-colors hover:bg-vanilla-200 hover:no-underline"
              >
                Shop the collection
              </Link>
              <Link
                href="/find-my-fit"
                className="inline-flex h-12 items-center border border-vanilla-50 px-9 text-sm font-semibold uppercase tracking-widest text-vanilla-50 no-underline transition-colors hover:bg-vanilla-50 hover:text-ink hover:no-underline"
              >
                Find my fit
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Moving value strip */}
      <div className="overflow-hidden border-y border-violet-600 bg-violet-800 py-3.5 text-vanilla-50">
        <div className="flex w-max">
          {[0, 1].map((track) => (
            <div
              key={track}
              aria-hidden={track === 1}
              className="flex shrink-0 animate-marquee items-center gap-0 whitespace-nowrap"
            >
              {MARQUEE.map((item) => (
                <span
                  key={item}
                  className="flex items-center text-[11px] font-semibold uppercase tracking-[0.25em]"
                >
                  <span className="mx-6 text-violet-200">✦</span>
                  {item}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Ready to wear / Custom made */}
      <section className="mx-auto grid max-w-6xl gap-4 px-5 py-12 md:grid-cols-2 md:gap-6 md:px-12 md:py-20">
        {[
          {
            href: '/shop',
            img: readyImg,
            eyebrow: 'Ready to wear',
            title: 'Shop the collection',
            sub: 'Handcrafted units, ready to ship in 3–5 days.',
          },
          {
            href: customWhatsApp,
            img: customImg,
            eyebrow: 'Made to order',
            title: 'Custom units',
            sub: 'Built to your measurements, colour and length.',
            external: true,
          },
        ].map((tile) => {
          const inner = (
            <>
              <div className="aspect-[4/5] overflow-hidden bg-vanilla-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={tile.img}
                  alt={tile.title}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/90 via-ink/40 to-transparent px-6 pb-6 pt-16">
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-vanilla-200">
                  {tile.eyebrow}
                </p>
                <h2 className="mt-1 font-display text-3xl text-vanilla-50 md:text-4xl">{tile.title}</h2>
                <p className="mt-1 text-sm text-vanilla-100">{tile.sub}</p>
              </div>
            </>
          )
          return tile.external ? (
            <a
              key={tile.title}
              href={tile.href}
              target="_blank"
              rel="noreferrer"
              className="group relative block overflow-hidden no-underline hover:no-underline"
            >
              {inner}
            </a>
          ) : (
            <Link
              key={tile.title}
              href={tile.href}
              className="group relative block overflow-hidden no-underline hover:no-underline"
            >
              {inner}
            </Link>
          )
        })}
      </section>

      {/* Shop by category */}
      <section className="mx-auto max-w-6xl px-5 pb-4 md:px-12">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-violet-800">
              Find your texture
            </p>
            <h2 className="mt-2 font-display text-3xl text-ink md:text-4xl">Shop by category</h2>
          </div>
          <Link href="/shop" className="shrink-0 text-xs font-semibold uppercase tracking-widest text-cherry-600">
            View all →
          </Link>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 md:gap-4">
          {categoryTiles.map((c) => (
            <Link
              key={c.slug}
              href={`/shop?category=${c.slug}`}
              className="group relative block w-40 shrink-0 overflow-hidden bg-vanilla-50 no-underline hover:no-underline sm:w-44 md:w-auto md:min-w-[130px] md:flex-1"
            >
              <div className="aspect-[3/4]">
                {c.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={c.image.url}
                    alt={`${c.name} — YBBeautylounge`}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    style={{ objectPosition: `${c.image.focal_x}% ${c.image.focal_y}%` }}
                    loading="lazy"
                  />
                )}
              </div>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/85 to-transparent px-3 pb-3 pt-10">
                <p className="font-display text-lg text-vanilla-50">{c.name}</p>
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-vanilla-200">
                  Shop now →
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Best sellers */}
      <section className="mx-auto max-w-6xl px-5 py-14 md:px-12 md:py-20">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-violet-800">
              Best sellers
            </p>
            <h2 className="mt-2 font-display text-3xl text-ink md:text-4xl">Pieces worth keeping</h2>
          </div>
          <Link href="/shop" className="shrink-0 text-xs font-semibold uppercase tracking-widest text-cherry-600">
            View all →
          </Link>
        </div>
        {show.length === 0 ? (
          <p className="text-ink-muted">Products are being prepared.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {show.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* Wig revamp — before / after */}
      <section className="bg-vanilla-50 px-5 py-14 md:px-12 md:py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-2">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-violet-800">
              Wig revamp &amp; restoration
            </p>
            <h2 className="mt-3 font-display text-4xl leading-tight text-ink md:text-5xl">
              Bring a tired unit back to life.
            </h2>
            <p className="mt-5 max-w-md text-ink-muted">
              Our specialists wash, revive and re-style worn units so they look and feel new again —
              a fraction of the cost of replacing them.
            </p>
            <Link
              href="/restoration"
              className="mt-8 inline-flex h-12 items-center bg-cherry-600 px-9 text-sm font-semibold uppercase tracking-widest text-vanilla-50 no-underline transition-colors hover:bg-cherry-700 hover:no-underline"
            >
              See the transformation
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { img: before, label: 'Before' },
              { img: after, label: 'After' },
            ].map((item) => (
              <div key={item.label}>
                <div className="aspect-[3/4] overflow-hidden bg-vanilla-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.img.url}
                    alt={item.img.alt_text || `Unit ${item.label.toLowerCase()} restoration`}
                    className="h-full w-full object-cover"
                    style={{ objectPosition: `${item.img.focal_x}% ${item.img.focal_y}%` }}
                    loading="lazy"
                  />
                </div>
                <p className="mt-2 text-center text-[11px] font-semibold uppercase tracking-[0.3em] text-ink-muted">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Promise strip */}
      <section className="bg-violet-800 px-5 py-12 text-vanilla-50 md:px-12">
        <div className="mx-auto grid max-w-6xl gap-8 sm:grid-cols-2 md:grid-cols-4">
          {STRIP_ITEMS.map((item) => (
            <div key={item.title}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-vanilla-50">
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
    </main>
  )
}
