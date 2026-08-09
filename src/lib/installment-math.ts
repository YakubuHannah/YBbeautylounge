// Pure installment math — safe to import in client components (no server deps).
// Money is kobo (rule 6).
export const INSTALLMENT_COUNT_DEFAULT = 4
export const MIN_INSTALLMENTS = 2
export const MAX_INSTALLMENTS = 6
// Installments must be completed within this window; longer is arranged manually.
export const INSTALLMENT_WINDOW_MONTHS = 3

/**
 * Split the goods (subtotal) into `count` equal payments; the last carries any
 * rounding so the parts sum exactly to the subtotal. Delivery is NOT included —
 * it is paid with the balance.
 */
export function installmentAmounts(subtotal: number, count: number): number[] {
  const n = Math.max(1, Math.floor(count))
  const per = Math.round(subtotal / n)
  const amounts = Array.from({ length: n }, () => per)
  amounts[n - 1] = subtotal - per * (n - 1)
  return amounts
}
