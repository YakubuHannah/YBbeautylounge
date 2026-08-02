import { TextBlocks } from '@/components/content/text-blocks'
import { getPageText } from '@/lib/pages'

export const metadata = { title: 'Terms' }

const DEFAULT_COPY = `Products remain transferred on full payment and dispatch. Deposit and instalment orders are not dispatched until the balance clears.

Prices are confirmed server-side at checkout. Displayed amounts match database prices in kobo, never client-supplied.

Counsel review before launch.`

export default async function TermsPage() {
  const pageText = await getPageText('terms')
  return (
    <main className="mx-auto max-w-2xl px-5 py-16 md:px-12">
      <h1 className="font-display text-4xl text-ink">Terms of sale</h1>
      <div className="mt-8 space-y-4 text-ink-muted">
        <TextBlocks text={pageText || DEFAULT_COPY} />
      </div>
    </main>
  )
}
