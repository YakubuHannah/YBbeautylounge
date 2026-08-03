import { prisma } from '@/lib/prisma'
import { getSettingValue } from '@/lib/settings'

export type RevampMedia = {
  id: string
  url: string
  mime_type: string
  alt_text: string | null
  focal_x: number
  focal_y: number
}

const REVAMP_MEDIA_SELECT = {
  id: true,
  url: true,
  mime_type: true,
  alt_text: true,
  focal_x: true,
  focal_y: true,
} as const

/** Founder-chosen before/after photos for the homepage restoration card. */
export async function getBeforeAfterImages(): Promise<{
  before: RevampMedia | null
  after: RevampMedia | null
}> {
  try {
    const [beforeId, afterId] = await Promise.all([
      getSettingValue('restoration_before_media_id'),
      getSettingValue('restoration_after_media_id'),
    ])
    const ids = [beforeId, afterId].filter(Boolean)
    if (!ids.length) return { before: null, after: null }
    const assets = await prisma.mediaAsset.findMany({
      where: { id: { in: ids } },
      select: REVAMP_MEDIA_SELECT,
    })
    const find = (id: string) => assets.find((a) => a.id === id) ?? null
    return {
      before: beforeId ? find(beforeId) : null,
      after: afterId ? find(afterId) : null,
    }
  } catch {
    return { before: null, after: null }
  }
}

/** Founder-curated photo/video gallery shown on the wig revamp page. */
export async function getRestorationGallery(): Promise<RevampMedia[]> {
  try {
    const page = await prisma.page.findUnique({
      where: { slug: 'restoration' },
      include: { blocks: true },
    })
    const block = page?.blocks.find((b) => b.block_type === 'gallery')
    if (!block || typeof block.content !== 'object' || block.content === null) return []
    const ids = (block.content as { media_ids?: unknown }).media_ids
    if (!Array.isArray(ids) || !ids.length) return []
    const wanted = ids.map(String)
    const assets = await prisma.mediaAsset.findMany({
      where: { id: { in: wanted } },
      select: REVAMP_MEDIA_SELECT,
    })
    return wanted
      .map((id) => assets.find((a) => a.id === id))
      .filter((a): a is (typeof assets)[number] => Boolean(a))
  } catch {
    return []
  }
}

/** Seeded on first admin visit; prices in kobo. starting_price 0 = "Quote on review". */
export const DEFAULT_TIERS = [
  {
    name: 'Basic revamp',
    description: 'Refresh, reshape, and restore comfort on a worn unit.',
    starting_price: 4_500_000,
    typical_turnaround_days: 7,
    is_active: true,
  },
  {
    name: 'Full restoration',
    description: 'Deeper reconstructive work where the hair still has life.',
    starting_price: 8_500_000,
    typical_turnaround_days: 10,
    is_active: true,
  },
  {
    name: 'Colour correction',
    description: 'Assessed from photos — quoted before any deposit.',
    starting_price: 0,
    typical_turnaround_days: 14,
    is_active: true,
  },
]

export type ServiceTier = {
  id?: string
  name: string
  description: string | null
  starting_price: number
  is_active?: boolean
}

export async function getServiceTiers(): Promise<ServiceTier[]> {
  try {
    const rows = await prisma.restorationServiceTier.findMany({
      where: { is_active: true },
      orderBy: { starting_price: 'asc' },
    })
    if (rows.length) return rows
  } catch {
    // fall through to defaults
  }
  return DEFAULT_TIERS
}
