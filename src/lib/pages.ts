import { prisma } from '@/lib/prisma'

/** Pages the founder edits in Admin → Pages. Public pages fall back to built-in copy. */
export const EDITABLE_PAGES: { slug: string; label: string }[] = [
  { slug: 'length-guide', label: 'Length guide' },
  { slug: 'restoration', label: 'Wig revamp' },
  { slug: 'returns', label: 'Returns & refund policy' },
  { slug: 'privacy', label: 'Privacy policy' },
  { slug: 'terms', label: 'Terms of sale' },
]

/** Built-in copy: shown on the site until edited, and pre-filled in the admin editor. */
export const DEFAULT_PAGE_COPY: Record<string, string> = {
  'length-guide':
    'Same body landmarks, plain language. Density reads fuller on shorter units — say so if you’re between sizes.',
  restoration:
    'Capacity-bound work by the founder’s hands — quoted clearly, deposited through the same order system, tracked without chasing.',
  returns: `Refunds: you can cancel for a full refund within 24 hours of payment, as long as your wig has not started processing. Once processing begins, the order can no longer be refunded.

Exchanges: 30-day window from delivery for unused units in original packaging.

Restored, custom, and handmade units are excluded from returns.

Preferred outcomes: exchange or store credit.

To make a request: use the track page or contact us on WhatsApp with photos, the reason, and your preferred outcome.`,
  privacy: `We collect contact and order data to fulfil purchases under NDPA 2023 / GAID 2025. Marketing consent is separate, unticked, and recorded with wording, time, and IP.

Transactional messages (receipts, shipping) do not require marketing consent. You can request access or deletion; order records are anonymised rather than destroyed where law requires retention.

This page is a starter; Nigerian counsel should review before launch.`,
  terms: `Products remain transferred on full payment and dispatch. Deposit and instalment orders are not dispatched until the balance clears.

Prices are confirmed server-side at checkout. Displayed amounts match database prices in kobo, never client-supplied.

Counsel review before launch.`,
}

export type LengthRow = { inches: string; sits: string; best: string }

export const DEFAULT_LENGTH_ROWS: LengthRow[] = [
  { inches: '12"', sits: 'Chin to collarbone', best: 'Bobs, low-maintenance days' },
  { inches: '14"', sits: 'Collarbone', best: 'Shoulder polish without weight' },
  { inches: '16"', sits: 'Upper chest', best: 'Everyday length, easy movement' },
  { inches: '18"', sits: 'Mid chest', best: 'Versatile styling with presence' },
  { inches: '20"', sits: 'Lower chest', best: 'Statement length, fuller read' },
  { inches: '22"+', sits: 'Waist-bound', best: 'Drama — denser caps help' },
]

export async function getPageText(slug: string): Promise<string | null> {
  try {
    const page = await prisma.page.findUnique({
      where: { slug },
      include: { blocks: { orderBy: { sort_order: 'asc' } } },
    })
    if (!page || page.status !== 'published') return null
    const block = page.blocks.find((b) => b.block_type === 'text')
    if (!block || typeof block.content !== 'object' || block.content === null) return null
    const text = (block.content as { text?: unknown }).text
    return typeof text === 'string' && text.trim() ? text : null
  } catch {
    return null
  }
}

export async function getLengthRows(): Promise<LengthRow[]> {
  try {
    const page = await prisma.page.findUnique({
      where: { slug: 'length-guide' },
      include: { blocks: { orderBy: { sort_order: 'asc' } } },
    })
    const block = page?.blocks.find((b) => b.block_type === 'length_table')
    if (!block || typeof block.content !== 'object' || block.content === null) {
      return DEFAULT_LENGTH_ROWS
    }
    const rows = (block.content as { rows?: unknown }).rows
    if (!Array.isArray(rows) || !rows.length) return DEFAULT_LENGTH_ROWS
    return rows
      .map((r) => ({
        inches: String((r as LengthRow).inches ?? ''),
        sits: String((r as LengthRow).sits ?? ''),
        best: String((r as LengthRow).best ?? ''),
      }))
      .filter((r) => r.inches.trim())
  } catch {
    return DEFAULT_LENGTH_ROWS
  }
}
