import { prisma } from '@/lib/prisma'

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
