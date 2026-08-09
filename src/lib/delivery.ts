import { getSettingValue } from '@/lib/settings'

/** Money is kobo (rule 6). Defaults apply until the founder sets a price. */
export const DELIVERY_DEFAULTS = {
  delivery_lagos_mainland: 350_000, // ₦3,500
  delivery_lagos_island: 450_000, // ₦4,500
  delivery_other_states: 500_000, // ₦5,000
  free_delivery_threshold: 20_000_000, // ₦200,000
} as const

export type DeliverySettingKey = keyof typeof DELIVERY_DEFAULTS

/** Guardrails for admin-entered money (rule 9). */
export const MAX_DELIVERY_FEE = 10_000_000 // ₦100,000
export const MAX_FREE_DELIVERY_THRESHOLD = 100_000_000 // ₦1,000,000

// The zones the customer can pick. "international" is paid directly to the
// courier, so it never carries an online fee.
export type DeliveryZoneKey = 'lagos_mainland' | 'lagos_island' | 'other_states' | 'international'
export const DELIVERY_ZONE_KEYS: DeliveryZoneKey[] = [
  'lagos_mainland',
  'lagos_island',
  'other_states',
  'international',
]

export type DeliveryPricing = {
  delivery_lagos_mainland: number
  delivery_lagos_island: number
  delivery_other_states: number
  free_delivery_threshold: number
}

async function readMoneySetting(key: DeliverySettingKey): Promise<number> {
  const raw = await getSettingValue(key)
  const n = Number(raw)
  return Number.isFinite(n) && n > 0 ? n : DELIVERY_DEFAULTS[key]
}

export async function getDeliveryPricing(): Promise<DeliveryPricing> {
  const [mainland, island, other, threshold] = await Promise.all([
    readMoneySetting('delivery_lagos_mainland'),
    readMoneySetting('delivery_lagos_island'),
    readMoneySetting('delivery_other_states'),
    readMoneySetting('free_delivery_threshold'),
  ])
  return {
    delivery_lagos_mainland: mainland,
    delivery_lagos_island: island,
    delivery_other_states: other,
    free_delivery_threshold: threshold,
  }
}

/** Base fee (kobo) for a zone, before the free-delivery threshold. */
export function zoneBaseFee(key: DeliveryZoneKey, pricing: DeliveryPricing): number {
  switch (key) {
    case 'lagos_mainland':
      return pricing.delivery_lagos_mainland
    case 'lagos_island':
      return pricing.delivery_lagos_island
    case 'other_states':
      return pricing.delivery_other_states
    case 'international':
      return 0 // paid directly to the courier
  }
}

/**
 * Delivery fee (kobo) for a zone. International is always 0 online. Domestic is
 * free at or above the threshold, otherwise the zone base fee. Pure so the price
 * path is unit-tested (testing floor).
 */
export function deliveryFeeFor(key: DeliveryZoneKey, subtotal: number, pricing: DeliveryPricing): number {
  if (key === 'international') return 0
  const base = zoneBaseFee(key, pricing)
  return subtotal >= pricing.free_delivery_threshold ? 0 : base
}

/**
 * Split an order into total, amount due now, and balance. Delivery is collected
 * up front: a 50% deposit is half the goods PLUS the full delivery fee, and the
 * balance is the remaining goods only. Pure so the money split is unit-tested.
 */
export function orderAmounts(opts: {
  subtotal: number
  deliveryFee: number
  plan: 'full' | 'deposit_50'
}): { total: number; dueNow: number; balanceDue: number | null } {
  const total = opts.subtotal + opts.deliveryFee
  if (opts.plan === 'deposit_50') {
    const dueNow = Math.round(opts.subtotal / 2) + opts.deliveryFee
    return { total, dueNow, balanceDue: total - dueNow }
  }
  return { total, dueNow: total, balanceDue: null }
}
