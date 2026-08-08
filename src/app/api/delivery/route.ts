import { NextResponse } from 'next/server'

import { getDeliveryZones, getFreeDeliveryThreshold } from '@/lib/delivery'

export const dynamic = 'force-dynamic'

// Public: the checkout reads zones and the free-delivery threshold to show the
// fee. Named fields only (rule 4) — the fee is public, cost fields are not here.
export async function GET() {
  const [zones, free_delivery_threshold] = await Promise.all([
    getDeliveryZones(),
    getFreeDeliveryThreshold(),
  ])
  return NextResponse.json({ zones, free_delivery_threshold })
}
