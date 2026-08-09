import { describe, it, expect } from 'vitest'

import { installmentAmounts } from '@/lib/installments'

describe('installmentAmounts', () => {
  it('splits the goods into equal parts that sum to the subtotal', () => {
    const parts = installmentAmounts(33_000_000, 4) // ₦330,000 in kobo
    expect(parts).toEqual([8_250_000, 8_250_000, 8_250_000, 8_250_000])
    expect(parts.reduce((a, b) => a + b, 0)).toBe(33_000_000)
  })

  it('the last part carries the rounding remainder so the parts sum exactly', () => {
    const parts = installmentAmounts(10_000_003, 3)
    expect(parts).toHaveLength(3)
    expect(parts.reduce((a, b) => a + b, 0)).toBe(10_000_003)
  })

  it('supports a 2-installment plan', () => {
    const parts = installmentAmounts(30_000_000, 2)
    expect(parts).toEqual([15_000_000, 15_000_000])
  })
})
