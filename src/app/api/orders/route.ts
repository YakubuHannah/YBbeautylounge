import { NextResponse } from 'next/server'

import {
  DELIVERY_ZONE_KEYS,
  deliveryFeeFor,
  getDeliveryPricing,
  orderAmounts,
  type DeliveryZoneKey,
} from '@/lib/delivery'
import { getInstallmentCount, installmentAmounts } from '@/lib/installments'
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
    delivery_zone?: string
    plan?: 'full' | 'installment'
    installment_count?: number
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
  const plan = body.plan === 'installment' ? 'installment' : 'full'
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

  // Delivery is priced server-side from the chosen zone — never from the client
  // (rule 1). Free at or above the threshold; international is paid directly to
  // the courier (0 online); delivery rides on the balance for a 50% deposit.
  const zoneKey = body.delivery_zone as DeliveryZoneKey
  if (!zoneKey || !DELIVERY_ZONE_KEYS.includes(zoneKey)) {
    return NextResponse.json({ error: 'Select a delivery location.' }, { status: 400 })
  }
  const subtotal = validLines.reduce((sum, l) => sum + l.line_total, 0)
  const pricing = await getDeliveryPricing()
  const deliveryFeeAmount = deliveryFeeFor(zoneKey, subtotal, pricing)
  const deliveryLabel: Record<DeliveryZoneKey, string> = {
    lagos_mainland: 'Lagos Mainland',
    lagos_island: 'Lagos Island',
    other_states: body.state!.trim(),
    international: 'International (paid on delivery)',
  }
  // Installment: the customer picks how many payments (2 up to the founder-set
  // maximum). The goods split into that many; the first is due now, delivery
  // stays in the balance.
  const maxInstallments = await getInstallmentCount()
  const installmentCount =
    plan === 'installment'
      ? Math.min(Math.max(2, Math.round(Number(body.installment_count) || maxInstallments)), maxInstallments)
      : 1
  const firstPayment =
    plan === 'installment' ? installmentAmounts(subtotal, installmentCount)[0] : undefined
  const { total, dueNow, balanceDue } = orderAmounts({
    subtotal,
    deliveryFee: deliveryFeeAmount,
    plan,
    firstPayment,
  })

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
        city: deliveryLabel[zoneKey],
        state: body.state!.trim(),
        country: 'Nigeria',
        subtotal,
        delivery_fee: deliveryFeeAmount,
        total,
        payment_plan: plan,
        balance_due_amount: balanceDue,
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

  // Awaited: on serverless, un-awaited work can be frozen when the response returns.
  await notifyFounder(
    `New order ${order.order_number} — ₦${Math.round(total / 100).toLocaleString()}`,
    `${body.name} (${phoneNormalised}${body.email ? `, ${body.email}` : ''}) placed ${order.order_number}.\n` +
      validLines
        .map((l) => `- ${l.variant.product.name} (${l.description}) x${l.quantity}`)
        .join('\n') +
      `\nGoods: ₦${Math.round(subtotal / 100).toLocaleString()}` +
      `\nDelivery — ${deliveryLabel[zoneKey]}: ${zoneKey === 'international' ? 'paid on delivery to courier' : `₦${Math.round(deliveryFeeAmount / 100).toLocaleString()}`}` +
      `\nOrder total: ₦${Math.round(total / 100).toLocaleString()}` +
      `\nDue now (${plan === 'installment' ? `installment 1 of ${installmentCount}, goods only` : 'full'}): ₦${Math.round(dueNow / 100).toLocaleString()}` +
      (balanceDue
        ? `\nBalance before dispatch (incl. delivery): ₦${Math.round(balanceDue / 100).toLocaleString()}`
        : '') +
      `\nDeliver to: ${body.address}, ${body.state}` +
      `\nAwaiting bank transfer — watch Admin → Orders for the payment claim.`
  )

  return NextResponse.json({
    order_id: order.id,
    order_number: order.order_number,
    subtotal,
    delivery_fee: deliveryFeeAmount,
    total,
    due_now: dueNow,
    bank: { bank_name: bankName, account_name: accountName, account_number: accountNumber },
  })
}
