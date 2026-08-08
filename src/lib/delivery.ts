import { prisma } from '@/lib/prisma'
import { getSettingValue } from '@/lib/settings'

/** Money is kobo (§ money rules). ₦200,000 free-delivery default. */
export const FREE_DELIVERY_THRESHOLD_DEFAULT = 20_000_000
/** Guardrails for admin-entered delivery money (rule 9). */
export const MAX_DELIVERY_FEE = 10_000_000 // ₦100,000
export const MAX_FREE_DELIVERY_THRESHOLD = 100_000_000 // ₦1,000,000

export type DeliveryZonePublic = {
  id: string
  name: string
  fee: number
  estimated_days: string
}

export async function getDeliveryZones(): Promise<DeliveryZonePublic[]> {
  const zones = await prisma.deliveryZone.findMany({ orderBy: { fee: 'asc' } })
  return zones.map((z) => ({
    id: z.id,
    name: z.name,
    fee: z.fee,
    estimated_days: z.estimated_days,
  }))
}

export async function getFreeDeliveryThreshold(): Promise<number> {
  const raw = await getSettingValue('free_delivery_threshold')
  const n = Number(raw)
  return Number.isFinite(n) && n > 0 ? n : FREE_DELIVERY_THRESHOLD_DEFAULT
}

/**
 * Delivery fee in kobo. Free at or above the threshold; otherwise the zone fee.
 * Pure so the price path is unit-tested (testing floor).
 */
export function deliveryFee(subtotal: number, zoneFee: number, threshold: number): number {
  return subtotal >= threshold ? 0 : zoneFee
}

/**
 * Split an order into total, amount due now, and balance. Delivery is added to
 * the balance on a 50% deposit — the deposit stays 50% of the goods only.
 * Pure so the money split is unit-tested (testing floor).
 */
export function orderAmounts(opts: {
  subtotal: number
  deliveryFee: number
  plan: 'full' | 'deposit_50'
}): { total: number; dueNow: number; balanceDue: number | null } {
  const total = opts.subtotal + opts.deliveryFee
  if (opts.plan === 'deposit_50') {
    const dueNow = Math.round(opts.subtotal / 2)
    return { total, dueNow, balanceDue: total - dueNow }
  }
  return { total, dueNow: total, balanceDue: null }
}
