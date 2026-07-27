import Link from 'next/link'

import { whatsAppUrl } from '@/lib/whatsapp'

export const metadata = { title: 'Restoration' }

export default function RestorationPage() {
  return (
    <main>
      <section className="bg-violet-800 px-5 py-20 text-vanilla-50 md:px-12">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-violet-200">
            Service
          </p>
          <h1 className="mt-3 font-display text-4xl md:text-5xl">Wig revamp</h1>
          <p className="mx-auto mt-4 max-w-lg text-violet-200">
            Capacity-bound work by the founder’s hands — quoted clearly, deposited through the
            same order system, tracked without chasing.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 md:px-12">
        <h2 className="font-display text-3xl text-ink">Service tiers</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {[
            {
              name: 'Basic revamp',
              price: 'From ₦45,000',
              blurb: 'Refresh, reshape, and restore comfort on a worn unit.',
            },
            {
              name: 'Full restoration',
              price: 'From ₦85,000',
              blurb: 'Deeper reconstructive work where the hair still has life.',
            },
            {
              name: 'Colour correction',
              price: 'Quote on review',
              blurb: 'Assessed from photos — quoted before any deposit.',
            },
          ].map((tier) => (
            <div key={tier.name} className="border border-vanilla-400 bg-vanilla-50 p-6">
              <h3 className="font-display text-xl text-ink">{tier.name}</h3>
              <p className="mt-2 font-semibold text-cherry-600">{tier.price}</p>
              <p className="mt-3 text-sm text-ink-muted">{tier.blurb}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-vanilla-200 px-5 py-16 md:px-12">
        <div className="mx-auto max-w-xl">
          <h2 className="font-display text-3xl text-ink">Start an intake</h2>
          <p className="mt-3 text-ink-muted">
            Share condition photos and what you want. You’ll receive a quote by email with a
            private status link.
          </p>
          <a
            href={whatsAppUrl(
              'Hi, I’d like a restoration quote. I can send photos of the unit’s current condition.'
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
