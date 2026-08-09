import { NextResponse } from 'next/server'

import { normalizePhone } from '@/lib/orders'
import { prisma } from '@/lib/prisma'
import { getSettingValue } from '@/lib/settings'

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

  // Amount the customer would pay next (mirrors the payment-claim route).
  const remaining = order.total - order.amount_paid
  const goodsInstallment =
    order.balance_due_amount != null ? order.total - order.balance_due_amount : order.total
  const dueNow =
    order.balance_due_amount == null
      ? remaining
      : remaining <= goodsInstallment + order.delivery_fee
        ? remaining
        : goodsInstallment

  const [bankName, accountName, accountNumber] = await Promise.all([
    getSettingValue('bank_name'),
    getSettingValue('bank_account_name'),
    getSettingValue('bank_account_number'),
  ])

  return NextResponse.json({
    order_id: order.id,
    order_number: order.order_number,
    payment_status: order.payment_status,
    fulfillment_status: order.fulfillment_status,
    total: order.total,
    amount_paid: order.amount_paid,
    balance: remaining,
    due_now: dueNow,
    bank: { bank_name: bankName, account_name: accountName, account_number: accountNumber },
    courier_name: order.courier_name,
    tracking_number: order.tracking_number,
    items: order.items.map((it) => ({
      name: it.product_name_snapshot,
      detail: it.variant_description_snapshot,
      quantity: it.quantity,
    })),
  })
}
