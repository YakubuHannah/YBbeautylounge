import { NextResponse } from 'next/server'

import { notifyFounder } from '@/lib/notify'
import { prisma } from '@/lib/prisma'
import { uploadMediaFile } from '@/lib/storage'

export const dynamic = 'force-dynamic'

const MAX_BYTES = 10 * 1024 * 1024

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const order = await prisma.order.findUnique({ where: { id: params.id } })
  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }
  if (order.payment_status === 'paid') {
    return NextResponse.json({ error: 'This order is already paid' }, { status: 400 })
  }

  const form = await req.formData()
  const screenshot = form.get('screenshot')
  if (!(screenshot instanceof File) || screenshot.size === 0) {
    return NextResponse.json(
      { error: 'Attach a screenshot of your transfer receipt.' },
      { status: 400 }
    )
  }
  if (screenshot.size > MAX_BYTES) {
    return NextResponse.json({ error: 'Screenshot must be under 10MB.' }, { status: 400 })
  }
  if (!screenshot.type.startsWith('image/') && screenshot.type !== 'application/pdf') {
    return NextResponse.json({ error: 'Use an image or PDF receipt.' }, { status: 400 })
  }

  let uploaded: { url: string }
  try {
    uploaded = await uploadMediaFile(screenshot, 'payments')
  } catch {
    return NextResponse.json(
      { error: 'Could not upload the screenshot — try again or send it on WhatsApp.' },
      { status: 500 }
    )
  }

  // What the customer pays with this claim.
  // - full plan (no stored balance): the whole remaining amount.
  // - installment: one goods-sized installment each time; the final payment
  //   clears the remaining goods plus the delivery fee.
  const remaining = order.total - order.amount_paid
  const goodsInstallment =
    order.balance_due_amount != null ? order.total - order.balance_due_amount : order.total
  const dueNow =
    order.balance_due_amount == null
      ? remaining
      : remaining <= goodsInstallment + order.delivery_fee
        ? remaining
        : goodsInstallment

  await prisma.$transaction([
    prisma.payment.create({
      data: {
        order_id: order.id,
        amount: dueNow,
        type: order.amount_paid === 0 && order.balance_due_amount != null ? 'deposit' : 'full',
        method: 'bank_transfer',
        status: 'pending',
        raw_webhook_payload: { screenshot_url: uploaded.url, filename: screenshot.name },
      },
    }),
    prisma.order.update({
      where: { id: order.id },
      data: { payment_status: 'confirmation_pending' },
    }),
  ])

  // Awaited: on serverless, un-awaited work can be frozen when the response returns.
  await notifyFounder(
    `Payment claim — ${order.order_number}`,
    `${order.customer_name_snapshot} (${order.customer_phone_snapshot}) says they have paid ` +
      `₦${Math.round(dueNow / 100).toLocaleString()} for ${order.order_number}.\n` +
      `Receipt: ${uploaded.url}\n` +
      `Confirm it in Admin → Orders, then email the customer.`
  )

  return NextResponse.json({ ok: true })
}
