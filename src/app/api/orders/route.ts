import { NextResponse } from 'next/server'

import { notifyFounder } from '@/lib/notify'
import { generateOrderNumber, normalizePhone } from '@/lib/orders'
import { prisma } from '@/lib/prisma'
import { getSettingValue } from '@/lib/settings'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const body = (await req.json()) as {
    name?: string
    phone?: string
    email?: string
    state?: string
    address?: string
    plan?: 'full' | 'deposit_50'
    marketing?: boolean
    items?: { variant_id?: string; quantity?: number }[]
  }

  if (!body.name?.trim()) {
    return NextResponse.json({ error: 'Name required' }, { status: 400 })
  }
  const phoneNormalised = normalizePhone(body.phone || '')
  if (!/^234\d{10}$/.test(phoneNormalised)) {
    return NextResponse.json({ error: 'Enter a valid Nigerian phone number' }, { status: 400 })
  }
  if (!body.address?.trim() || !body.state?.trim()) {
    return NextResponse.json({ error: 'Delivery address and state required' }, { status: 400 })
  }
  const plan = body.plan === 'deposit_50' ? 'deposit_50' : 'full'
  const requested = (body.items || [])
    .map((i) => ({ variant_id: String(i.variant_id || ''), quantity: Number(i.quantity) }))
    .filter((i) => i.variant_id && Number.isInteger(i.quantity) && i.quantity > 0 && i.quantity <= 20)
  if (!requested.length) {
    return NextResponse.json({ error: 'Your bag is empty' }, { status: 400 })
  }

  // Server-side pricing: the client sends variant ids and quantities only (§14.1).
  const variants = await prisma.productVariant.findMany({
    where: { id: { in: requested.map((i) => i.variant_id) }, is_active: true },
    include: { product: { select: { name: true, status: true, deleted_at: true } } },
  })
  const lines = requested.map((item) => {
    const variant = variants.find((v) => v.id === item.variant_id)
    if (!variant || variant.product.status !== 'active' || variant.product.deleted_at) {
      return null
    }
    const description = [
      variant.length_inches ? `${variant.length_inches}"` : null,
      variant.colorway,
      variant.density_percent ? `${variant.density_percent}%` : null,
    ]
      .filter(Boolean)
      .join(' · ')
    return {
      variant,
      quantity: item.quantity,
      description,
      line_total: variant.price * item.quantity,
    }
  })
  if (lines.some((l) => l === null)) {
    return NextResponse.json(
      { error: 'An item in your bag is no longer available — refresh and try again.' },
      { status: 400 }
    )
  }
  const validLines = lines as NonNullable<(typeof lines)[number]>[]

  const subtotal = validLines.reduce((sum, l) => sum + l.line_total, 0)
  const total = subtotal
  const dueNow = plan === 'deposit_50' ? Math.round(total / 2) : total

  const order = await prisma.$transaction(async (tx) => {
    const customer = await tx.customer.upsert({
      where: { phone_normalised: phoneNormalised },
      create: {
        phone_normalised: phoneNormalised,
        phone_raw: body.phone || '',
        name: body.name!.trim(),
        email: body.email?.trim() || null,
        marketing_consent: body.marketing === true,
        consent_recorded_at: body.marketing === true ? new Date() : null,
      },
      update: {
        name: body.name!.trim(),
        email: body.email?.trim() || undefined,
        ...(body.marketing === true
          ? { marketing_consent: true, consent_recorded_at: new Date() }
          : {}),
      },
    })

    const created = await tx.order.create({
      data: {
        order_number: generateOrderNumber(),
        customer_id: customer.id,
        customer_name_snapshot: body.name!.trim(),
        customer_phone_snapshot: phoneNormalised,
        customer_email_snapshot: body.email?.trim() || null,
        delivery_address: body.address!.trim(),
        city: body.state!.trim(),
        state: body.state!.trim(),
        country: 'Nigeria',
        subtotal,
        total,
        payment_plan: plan,
        balance_due_amount: plan === 'deposit_50' ? total - dueNow : null,
        payment_status: 'pending',
        fulfillment_status: 'unfulfilled',
        items: {
          create: validLines.map((l) => ({
            product_variant_id: l.variant.id,
            product_name_snapshot: l.variant.product.name,
            variant_description_snapshot: l.description,
            quantity: l.quantity,
            unit_price: l.variant.price,
            line_total: l.line_total,
          })),
        },
      },
    })
    return created
  })

  const [bankName, accountName, accountNumber] = await Promise.all([
    getSettingValue('bank_name'),
    getSettingValue('bank_account_name'),
    getSettingValue('bank_account_number'),
  ])

  notifyFounder(
    `New order ${order.order_number} — ₦${Math.round(total / 100).toLocaleString()}`,
    `${body.name} (${phoneNormalised}${body.email ? `, ${body.email}` : ''}) placed ${order.order_number}.\n` +
      validLines
        .map((l) => `- ${l.variant.product.name} (${l.description}) x${l.quantity}`)
        .join('\n') +
      `\nDue now (${plan === 'deposit_50' ? '50% deposit' : 'full'}): ₦${Math.round(dueNow / 100).toLocaleString()}` +
      `\nDeliver to: ${body.address}, ${body.state}` +
      `\nAwaiting bank transfer — watch Admin → Orders for the payment claim.`
  ).catch(() => {})

  return NextResponse.json({
    order_id: order.id,
    order_number: order.order_number,
    total,
    due_now: dueNow,
    bank: { bank_name: bankName, account_name: accountName, account_number: accountNumber },
  })
}
