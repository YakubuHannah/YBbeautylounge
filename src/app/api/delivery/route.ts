import { NextResponse } from 'next/server'

import { getDeliveryPricing } from '@/lib/delivery'
import { getInstallmentCount } from '@/lib/installments'

export const dynamic = 'force-dynamic'

// Public: the checkout reads the delivery prices and the installment count to
// show the fee and the payment plan. Named fields only (rule 4). The server
// still re-prices every order from these values.
export async function GET() {
  const [pricing, installment_count] = await Promise.all([
    getDeliveryPricing(),
    getInstallmentCount(),
  ])
  return NextResponse.json({ ...pricing, installment_count })
}
