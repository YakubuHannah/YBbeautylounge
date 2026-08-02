import { TextBlocks } from '@/components/content/text-blocks'
import { getPageText } from '@/lib/pages'

export const metadata = { title: 'Returns' }

const DEFAULT_COPY = `Refunds: you can cancel for a full refund within 24 hours of payment, as long as your wig has not started processing. Once processing begins, the order can no longer be refunded.

Exchanges: 30-day window from delivery for unused units in original packaging.

Restored, custom, and handmade units are excluded from returns.

Preferred outcomes: exchange or store credit.

To make a request: use the track page or contact us on WhatsApp with photos, the reason, and your preferred outcome.`

export default async function ReturnsPolicyPage() {
  const pageText = await getPageText('returns')
  return (
    <main className="mx-auto max-w-2xl px-5 py-16 md:px-12">
      <h1 className="font-display text-4xl text-ink">Returns & refunds</h1>
      <div className="mt-8 space-y-4 text-ink-muted">
        <TextBlocks text={pageText || DEFAULT_COPY} />
      </div>
    </main>
  )
}
