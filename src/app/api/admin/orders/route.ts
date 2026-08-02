import { NextResponse } from 'next/server'

import { requireAdminSession } from '@/lib/auth/admin-session'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const FULFILLMENT_FLOW: Record<string, string[]> = {
  unfulfilled: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
}

export async function GET() {
  try {
    await requireAdminSession()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: {
      items: true,
      payments: { orderBy: { createdAt: 'desc' } },
    },
  })
  return NextResponse.json({ orders })
}

export async function PATCH(req: Request) {
  let admin
  try {
    admin = await requireAdminSession()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = (await req.json()) as {
    action?: 'confirm_payment' | 'update_fulfillment'
    order_id?: string
    payment_id?: string
    fulfillment_status?: string
  }
  if (!body.order_id) {
    return NextResponse.json({ error: 'order_id required' }, { status: 400 })
  }
  const order = await prisma.order.findUnique({
    where: { id: body.order_id },
    include: { items: true },
  })
  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  if (body.action === 'confirm_payment') {
    if (!body.payment_id) {
      return NextResponse.json({ error: 'payment_id required' }, { status: 400 })
    }
    const payment = await prisma.payment.findUnique({ where: { id: body.payment_id } })
    if (!payment || payment.order_id !== order.id) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }
    if (payment.status === 'confirmed') {
      return NextResponse.json({ error: 'Already confirmed' }, { status: 400 })
    }

    const amountPaid = order.amount_paid + payment.amount
    const paidInFull = amountPaid >= order.total

    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: 'confirmed',
          verified_at: new Date(),
          recorded_by_admin_id: admin.adminId,
        },
      })
      await tx.order.update({
        where: { id: order.id },
        data: {
          amount_paid: amountPaid,
          payment_status: paidInFull ? 'paid' : 'partially_paid',
        },
      })
      // First confirmed payment decrements stock (no reservation flow yet).
      if (order.amount_paid === 0) {
        for (const item of order.items) {
          if (item.product_variant_id) {
            await tx.productVariant.updateMany({
              where: { id: item.product_variant_id, stock_quantity: { gte: item.quantity } },
              data: { stock_quantity: { decrement: item.quantity } },
            })
          }
        }
      }
      await tx.auditLog.create({
        data: {
          actor_id: admin.adminId,
          actor_type: 'admin',
          action: 'payment.confirm',
          entity_type: 'order',
          entity_id: order.id,
          before_value: { amount_paid: order.amount_paid, payment_status: order.payment_status },
          after_value: {
            amount_paid: amountPaid,
            payment_status: paidInFull ? 'paid' : 'partially_paid',
            payment_id: payment.id,
          },
        },
      })
    })
    return NextResponse.json({ ok: true })
  }

  if (body.action === 'update_fulfillment') {
    const next = String(body.fulfillment_status || '')
    const allowed = FULFILLMENT_FLOW[order.fulfillment_status] || []
    if (!allowed.includes(next)) {
      return NextResponse.json(
        { error: `Cannot move from ${order.fulfillment_status} to ${next}` },
        { status: 400 }
      )
    }
    // Dispatch is blocked in code while a balance is outstanding (§ never-negotiable 8).
    if (next === 'shipped' && order.amount_paid < order.total) {
      return NextResponse.json(
        { error: 'Outstanding balance — collect and confirm the balance before dispatch.' },
        { status: 400 }
      )
    }
    await prisma.$transaction([
      prisma.order.update({
        where: { id: order.id },
        data: { fulfillment_status: next },
      }),
      prisma.auditLog.create({
        data: {
          actor_id: admin.adminId,
          actor_type: 'admin',
          action: 'order.fulfillment',
          entity_type: 'order',
          entity_id: order.id,
          before_value: { fulfillment_status: order.fulfillment_status },
          after_value: { fulfillment_status: next },
        },
      }),
    ])
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
