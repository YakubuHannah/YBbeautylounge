import { NextResponse } from 'next/server'

import { getDeliveryPricing } from '@/lib/delivery'

export const dynamic = 'force-dynamic'

// Public: the checkout reads the delivery prices to show the fee. Named fields
// only (rule 4). The server still re-prices every order from these values.
export async function GET() {
  const pricing = await getDeliveryPricing()
  return NextResponse.json(pricing)
}
