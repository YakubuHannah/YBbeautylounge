import Link from 'next/link'

import { TextBlocks } from '@/components/content/text-blocks'
import { formatNaira } from '@/lib/money'
import { DEFAULT_PAGE_COPY, getPageText } from '@/lib/pages'
import { getRestorationGallery, getServiceTiers } from '@/lib/restoration'
import { getWhatsAppNumber } from '@/lib/settings'
import { whatsAppUrl } from '@/lib/whatsapp'

export const metadata = { title: 'Restoration' }

export default async function RestorationPage() {
  const [whatsappNumber, pageText, tiers, gallery] = await Promise.all([
    getWhatsAppNumber(),
    getPageText('restoration'),
    getServiceTiers(),
    getRestorationGallery(),
  ])
  return (
    <main>
      <section className="bg-violet-800 px-5 py-20 text-vanilla-50 md:px-12">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-violet-200">
            Service
          </p>
          <h1 className="mt-3 font-display text-4xl md:text-5xl">Wig revamp &amp; restoration</h1>
          <div className="mx-auto mt-4 max-w-lg space-y-3 text-violet-200">
            <TextBlocks text={pageText || DEFAULT_PAGE_COPY.restoration} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 md:px-12">
        <h2 className="font-display text-3xl text-ink">Service tiers</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {tiers.map((tier) => (
            <div key={tier.id ?? tier.name} className="border border-vanilla-400 bg-vanilla-50 p-6">
              <h3 className="font-display text-xl text-ink">{tier.name}</h3>
              <p className="mt-2 font-semibold text-cherry-600">
                {tier.starting_price > 0
                  ? `From ${formatNaira(tier.starting_price)}`
                  : 'Quote on review'}
              </p>
              {tier.description && (
                <p className="mt-3 text-sm text-ink-muted">{tier.description}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {gallery.length > 0 && (
        <section className="mx-auto max-w-6xl px-5 pb-16 md:px-12">
          <h2 className="font-display text-3xl text-ink">Transformations</h2>
          <p className="mt-2 max-w-xl text-ink-muted">
            Real pieces, revived by hand.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {gallery.map((m) =>
              m.mime_type.startsWith('video/') ? (
                <video
                  key={m.id}
                  src={m.url}
                  className="aspect-[4/5] w-full bg-vanilla-50 object-cover"
                  controls
                  preload="metadata"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={m.id}
                  src={m.url}
                  alt={m.alt_text || 'Wig transformation by YBBeautylounge'}
                  className="aspect-[4/5] w-full bg-vanilla-50 object-cover"
                  style={{ objectPosition: `${m.focal_x}% ${m.focal_y}%` }}
                  loading="lazy"
                />
              )
            )}
          </div>
        </section>
      )}

      <section className="bg-vanilla-200 px-5 py-16 md:px-12">
        <div className="mx-auto max-w-xl">
          <h2 className="font-display text-3xl text-ink">Start an intake</h2>
          <p className="mt-3 text-ink-muted">
            Share condition photos and what you want. You’ll receive a quote by email with a
            private status link.
          </p>
          <a
            href={whatsAppUrl(
              'Hi, I’d like a restoration quote. I can send photos of the unit’s current condition.',
              whatsappNumber
            )}
            target="_blank"
            rel="noreferrer"
            className="mt-8 flex h-12 items-center justify-center rounded-[2px] bg-cherry-600 text-sm font-semibold text-vanilla-50 no-underline hover:bg-cherry-700 hover:no-underline"
          >
            Open restoration WhatsApp
          </a>
          <p className="mt-4 text-center text-sm text-ink-muted">
            Full intake form with capacity cap ships in a later milestone.
          </p>
          <p className="mt-6 text-center">
            <Link href="/shop" className="text-sm font-semibold text-cherry-600">
              Or shop a new unit
            </Link>
          </p>
        </div>
      </section>
    </main>
  )
}
