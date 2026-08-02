import { TextBlocks } from '@/components/content/text-blocks'
import { getPageText } from '@/lib/pages'

export const metadata = { title: 'Privacy' }

const DEFAULT_COPY = `We collect contact and order data to fulfil purchases under NDPA 2023 / GAID 2025. Marketing consent is separate, unticked, and recorded with wording, time, and IP.

Transactional messages (receipts, shipping) do not require marketing consent. You can request access or deletion; order records are anonymised rather than destroyed where law requires retention.

This page is a starter; Nigerian counsel should review before launch.`

export default async function PrivacyPage() {
  const pageText = await getPageText('privacy')
  return (
    <main className="mx-auto max-w-2xl px-5 py-16 md:px-12">
      <h1 className="font-display text-4xl text-ink">Privacy policy</h1>
      <div className="mt-8 space-y-4 text-ink-muted">
        <TextBlocks text={pageText || DEFAULT_COPY} />
      </div>
    </main>
  )
}
