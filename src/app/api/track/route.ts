import { NextResponse } from 'next/server'

import { normalizePhone } from '@/lib/orders'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Look up an order by order number + the phone used at checkout (both required,
// never number alone). Named fields only (rule 4).
export async function GET(req: Request) {
  const url = new URL(req.url)
  const orderNumber = (url.searchParams.get('order') || '').trim()
  const phone = normalizePhone(url.searchParams.get('phone') || '')

  if (!orderNumber || !/^234\d{10}$/.test(phone)) {
    return NextResponse.json(
      { error: 'Enter your order number and the phone number you used at checkout.' },
      { status: 400 }
    )
  }

  const order = await prisma.order.findFirst({
    where: {
      order_number: { equals: orderNumber, mode: 'insensitive' },
      customer_phone_snapshot: phone,
    },
    include: { items: true },
  })
  if (!order) {
    return NextResponse.json(
      { error: 'No order found for that number and phone. Check both and try again.' },
      { status: 404 }
    )
  }

  return NextResponse.json({
    order_number: order.order_number,
    payment_status: order.payment_status,
    fulfillment_status: order.fulfillment_status,
    total: order.total,
    amount_paid: order.amount_paid,
    balance: order.total - order.amount_paid,
    courier_name: order.courier_name,
    tracking_number: order.tracking_number,
    items: order.items.map((it) => ({
      name: it.product_name_snapshot,
      detail: it.variant_description_snapshot,
      quantity: it.quantity,
    })),
  })
}
