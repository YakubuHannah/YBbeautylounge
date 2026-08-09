import { describe, it, expect } from 'vitest'

import { deliveryFeeFor, orderAmounts, zoneBaseFee, type DeliveryPricing } from '@/lib/delivery'

const PRICING: DeliveryPricing = {
  delivery_lagos_mainland: 350_000, // ₦3,500
  delivery_lagos_island: 450_000, // ₦4,500
  delivery_other_states: 500_000, // ₦5,000
  free_delivery_threshold: 20_000_000, // ₦200,000
}

describe('zoneBaseFee', () => {
  it('returns each zone price and 0 for international', () => {
    expect(zoneBaseFee('lagos_mainland', PRICING)).toBe(350_000)
    expect(zoneBaseFee('lagos_island', PRICING)).toBe(450_000)
    expect(zoneBaseFee('other_states', PRICING)).toBe(500_000)
    expect(zoneBaseFee('international', PRICING)).toBe(0)
  })
})

describe('deliveryFeeFor', () => {
  it('charges the zone fee below the free-delivery threshold', () => {
    expect(deliveryFeeFor('lagos_island', 18_500_000, PRICING)).toBe(450_000)
    expect(deliveryFeeFor('other_states', 18_500_000, PRICING)).toBe(500_000)
  })

  it('is free at or above the threshold for domestic zones', () => {
    expect(deliveryFeeFor('lagos_island', 20_000_000, PRICING)).toBe(0)
    expect(deliveryFeeFor('other_states', 25_000_000, PRICING)).toBe(0)
  })

  it('is always 0 online for international (paid directly to courier)', () => {
    expect(deliveryFeeFor('international', 5_000_000, PRICING)).toBe(0)
    expect(deliveryFeeFor('international', 25_000_000, PRICING)).toBe(0)
  })
})

describe('orderAmounts', () => {
  it('pay in full: total is goods plus delivery, all due now, no balance', () => {
    const a = orderAmounts({ subtotal: 18_500_000, deliveryFee: 450_000, plan: 'full' })
    expect(a.total).toBe(18_950_000)
    expect(a.dueNow).toBe(18_950_000)
    expect(a.balanceDue).toBeNull()
  })

  it('50% deposit: half the goods plus the full delivery is due now', () => {
    const a = orderAmounts({ subtotal: 18_500_000, deliveryFee: 450_000, plan: 'deposit_50' })
    expect(a.total).toBe(18_950_000)
    expect(a.dueNow).toBe(9_700_000) // 9,250,000 goods half + 450,000 delivery
    expect(a.balanceDue).toBe(9_250_000) // remaining goods only
    expect(a.dueNow + a.balanceDue!).toBe(a.total)
  })
})
