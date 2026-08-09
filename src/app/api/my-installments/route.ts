import { NextResponse } from 'next/server'

import { normalizePhone } from '@/lib/orders'
import { prisma } from '@/lib/prisma'
import { getSettingValue } from '@/lib/settings'

export const dynamic = 'force-dynamic'

// Customer's installment record, looked up by phone (no login). Named fields
// only (rule 4) — filtered to this phone, no cost or other customers' data.
export async function GET(req: Request) {
  const phone = normalizePhone(new URL(req.url).searchParams.get('phone') || '')
  if (!/^234\d{10}$/.test(phone)) {
    return NextResponse.json(
      { error: 'Enter the phone number you used at checkout.' },
      { status: 400 }
    )
  }

  const orders = await prisma.order.findMany({
    where: { customer: { phone_normalised: phone }, payment_plan: 'installment' },
    orderBy: { createdAt: 'desc' },
    include: {
      items: {
        include: {
          variant: { include: { product: { select: { slug: true, status: true, deleted_at: true } } } },
        },
      },
    },
  })
  const active = orders.filter((o) => o.amount_paid < o.total && o.payment_status !== 'cancelled')

  const [bankName, accountName, accountNumber] = await Promise.all([
    getSettingValue('bank_name'),
    getSettingValue('bank_account_name'),
    getSettingValue('bank_account_number'),
  ])

  return NextResponse.json({
    bank: { bank_name: bankName, account_name: accountName, account_number: accountNumber },
    installments: active.map((o) => {
      const remaining = o.total - o.amount_paid
      const goodsInstallment =
        o.balance_due_amount != null ? o.total - o.balance_due_amount : o.total
      const nextPayment =
        remaining <= goodsInstallment + o.delivery_fee ? remaining : goodsInstallment
      return {
        order_id: o.id,
        order_number: o.order_number,
        total: o.total,
        amount_paid: o.amount_paid,
        balance: remaining,
        next_payment: nextPayment,
        payment_status: o.payment_status,
        items: o.items.map((it) => {
          const product = it.variant?.product
          const available = product?.status === 'active' && !product?.deleted_at
          return {
            name: it.product_name_snapshot,
            detail: it.variant_description_snapshot,
            quantity: it.quantity,
            slug: available ? product?.slug ?? null : null,
          }
        }),
      }
    }),
  })
}
