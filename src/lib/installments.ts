import {
  INSTALLMENT_COUNT_DEFAULT,
  MAX_INSTALLMENTS,
  MIN_INSTALLMENTS,
} from '@/lib/installment-math'
import { getSettingValue } from '@/lib/settings'

// Re-export the pure math + constants so server code can import from one place.
export * from '@/lib/installment-math'

/** Founder-set number of installments (default 4), clamped to a safe range. */
export async function getInstallmentCount(): Promise<number> {
  const n = Math.round(Number(await getSettingValue('installment_count')))
  return Number.isFinite(n) && n >= MIN_INSTALLMENTS && n <= MAX_INSTALLMENTS
    ? n
    : INSTALLMENT_COUNT_DEFAULT
}
