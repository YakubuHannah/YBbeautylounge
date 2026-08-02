import { TextBlocks } from '@/components/content/text-blocks'
import { DEFAULT_PAGE_COPY, getPageText } from '@/lib/pages'

export const metadata = { title: 'Returns' }

export default async function ReturnsPolicyPage() {
  const pageText = await getPageText('returns')
  return (
    <main className="mx-auto max-w-2xl px-5 py-16 md:px-12">
      <h1 className="font-display text-4xl text-ink">Returns & refunds</h1>
      <div className="mt-8 space-y-4 text-ink-muted">
        <TextBlocks text={pageText || DEFAULT_PAGE_COPY.returns} />
      </div>
    </main>
  )
}
