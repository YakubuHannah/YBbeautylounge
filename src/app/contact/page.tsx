import { whatsAppUrl } from '@/lib/whatsapp'

export const metadata = { title: 'Contact' }

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-xl px-5 py-16 md:px-12">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-violet-800">Contact</p>
      <h1 className="mt-2 font-display text-4xl text-ink">We’re on WhatsApp</h1>
      <p className="mt-4 text-ink-muted">
        Questions about a unit, a fit, or a restoration — start there. It’s still how many of our
        best orders begin.
      </p>
      <a
        href={whatsAppUrl('Hi YBBeautylounge, I’d like to get in touch.')}
        target="_blank"
        rel="noreferrer"
        className="mt-8 flex h-12 items-center justify-center rounded-[2px] bg-cherry-600 text-sm font-semibold text-vanilla-50 no-underline hover:bg-cherry-700 hover:no-underline"
      >
        Message on WhatsApp
      </a>
      <p className="mt-6 text-sm text-ink-muted">Or email orders via the address on your receipt once checkout is fully live.</p>
    </main>
  )
}
