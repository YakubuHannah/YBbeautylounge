import { describe, it, expect } from 'vitest'

import { deliveryFee, orderAmounts } from '@/lib/delivery'

const THRESHOLD = 20_000_000 // ₦200,000
const LAGOS_ISLAND = 450_000 // ₦4,500

describe('deliveryFee', () => {
  it('charges the zone fee below the free-delivery threshold', () => {
    expect(deliveryFee(18_500_000, LAGOS_ISLAND, THRESHOLD)).toBe(LAGOS_ISLAND)
  })

  it('is free exactly at the threshold', () => {
    expect(deliveryFee(THRESHOLD, LAGOS_ISLAND, THRESHOLD)).toBe(0)
  })

  it('is free above the threshold', () => {
    expect(deliveryFee(25_000_000, LAGOS_ISLAND, THRESHOLD)).toBe(0)
  })
})

describe('orderAmounts', () => {
  it('pay in full: total is goods plus delivery, all due now, no balance', () => {
    const a = orderAmounts({ subtotal: 18_500_000, deliveryFee: LAGOS_ISLAND, plan: 'full' })
    expect(a.total).toBe(18_950_000)
    expect(a.dueNow).toBe(18_950_000)
    expect(a.balanceDue).toBeNull()
  })

  it('50% deposit: delivery goes on the balance, not the deposit', () => {
    const a = orderAmounts({ subtotal: 18_500_000, deliveryFee: LAGOS_ISLAND, plan: 'deposit_50' })
    expect(a.total).toBe(18_950_000)
    // Deposit is half of the goods only — delivery is excluded.
    expect(a.dueNow).toBe(9_250_000)
    // Balance carries the other half of the goods plus the full delivery fee.
    expect(a.balanceDue).toBe(9_700_000)
    expect(a.dueNow + a.balanceDue!).toBe(a.total)
  })

  it('free delivery: deposit split matches a goods-only order', () => {
    const a = orderAmounts({ subtotal: 25_000_000, deliveryFee: 0, plan: 'deposit_50' })
    expect(a.total).toBe(25_000_000)
    expect(a.dueNow).toBe(12_500_000)
    expect(a.balanceDue).toBe(12_500_000)
  })
})
