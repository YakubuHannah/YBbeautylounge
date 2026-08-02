import { prisma } from '@/lib/prisma'

/** Pages the founder edits in Admin → Pages. Public pages fall back to built-in copy. */
export const EDITABLE_PAGES: { slug: string; label: string }[] = [
  { slug: 'length-guide', label: 'Length guide (intro)' },
  { slug: 'restoration', label: 'Wig revamp (intro)' },
  { slug: 'returns', label: 'Returns & refund policy' },
  { slug: 'privacy', label: 'Privacy policy' },
  { slug: 'terms', label: 'Terms of sale' },
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
